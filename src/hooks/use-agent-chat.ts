"use client";

import { useCallback, useRef, useState } from "react";
import type {
  AgentStreamEvent,
  ChatMessage,
  PlanStep,
  ToolTrace,
  TraceItem,
} from "@/types/agent";
import { useAgentStore, DEFAULT_TITLE } from "@/store/agent-store";
import { uid } from "@/lib/utils";

interface UseAgentChatResult {
  isStreaming: boolean;
  sendMessage: (text: string) => Promise<void>;
  stop: () => void;
  respondApproval: (messageId: string, approvalId: string, approved: boolean) => Promise<void>;
}

export function useAgentChat(sessionId: string | null): UseAgentChatResult {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || isStreaming) return;

      const store = useAgentStore.getState();
      let sid = sessionId;
      if (!sid) {
        sid = store.createSession();
      }

      const settings = useAgentStore.getState().settings;
      const userMessage: ChatMessage = {
        id: uid("msg"),
        role: "user",
        content,
        createdAt: Date.now(),
      };
      const assistantId = uid("msg");
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        streaming: true,
        plan: [],
        trace: [],
        tools: [],
        approvals: [],
      };

      store.appendMessage(sid, userMessage);
      store.appendMessage(sid, assistantMessage);

      const patch = (updater: Partial<ChatMessage> | ((message: ChatMessage) => Partial<ChatMessage>)) =>
        useAgentStore.getState().patchMessage(sid as string, assistantId, updater);

      const pushTrace = (item: TraceItem) =>
        patch((message) => ({ trace: [...(message.trace ?? []), item] }));

      const upsertTool = (trace: ToolTrace) =>
        patch((message) => {
          const tools = message.tools ?? [];
          const exists = tools.some((tool) => tool.id === trace.id);
          return {
            tools: exists ? tools.map((tool) => (tool.id === trace.id ? trace : tool)) : [...tools, trace],
          };
        });

      const currentSession = useAgentStore.getState().sessions.find((session) => session.id === sid);
      const history = (currentSession?.messages ?? [])
        .filter((message) => message.role === "user" || (message.role === "assistant" && message.content.trim()))
        .slice(-10)
        .map((message) => ({ role: message.role, content: message.content }));

      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (settings.apiKey.trim()) headers["x-deepseek-key"] = settings.apiKey.trim();

      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            runId: uid("run"),
            sessionId: sid,
            messages: history,
            memory: useAgentStore.getState().memory.map((fact) => fact.text),
            requireApproval: settings.requireApproval,
            model: settings.model,
            baseUrl: settings.baseUrl,
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || `请求失败（HTTP ${response.status}）`);
        }
        if (!response.body) throw new Error("响应流不可用，请重试");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const handleEvent = (event: AgentStreamEvent) => {
          switch (event.type) {
            case "meta":
              break;
            case "safety":
              patch({ safety: event.message });
              break;
            case "plan": {
              const steps: PlanStep[] = event.steps;
              patch({ plan: steps });
              const session = useAgentStore.getState().sessions.find((item) => item.id === sid);
              if (session && session.title === DEFAULT_TITLE) {
                useAgentStore.getState().renameSession(sid as string, event.title);
              }
              break;
            }
            case "step":
              patch((message) => ({
                plan: (message.plan ?? []).map((step) =>
                  step.id === event.stepId ? { ...step, status: event.status } : step,
                ),
              }));
              break;
            case "trace":
              pushTrace(event.item);
              break;
            case "tool_call":
              upsertTool(event.trace);
              break;
            case "tool_result":
              patch((message) => ({
                tools: (message.tools ?? []).map((tool) =>
                  tool.id === event.id
                    ? { ...tool, status: event.status, result: event.result, durationMs: event.durationMs }
                    : tool,
                ),
              }));
              break;
            case "approval_request":
              patch((message) => ({
                approvals: [...(message.approvals ?? []), event.approval],
              }));
              break;
            case "citations":
              patch({ citations: event.citations });
              break;
            case "memory":
              useAgentStore.getState().addMemory(event.fact, "对话自动提取");
              break;
            case "token":
              patch((message) => ({ content: message.content + event.delta }));
              break;
            case "done": {
              patch({ content: event.content, streaming: false, durationMs: event.durationMs });
              if (useAgentStore.getState().settings.voiceOutput && typeof window !== "undefined") {
                try {
                  const utterance = new SpeechSynthesisUtterance(event.content.replace(/[#*`>]/g, "").slice(0, 260));
                  utterance.lang = "zh-CN";
                  utterance.rate = 1.02;
                  window.speechSynthesis.cancel();
                  window.speechSynthesis.speak(utterance);
                } catch {
                  // 浏览器不支持语音合成时忽略
                }
              }
              break;
            }
            case "error":
              patch((message) => ({
                error: event.message,
                streaming: false,
                content: message.content || "",
              }));
              pushTrace({
                id: uid("trace"),
                kind: "error",
                title: "执行失败",
                detail: event.message,
                status: "error",
                at: Date.now(),
              });
              break;
            default:
              break;
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) {
            for (const line of frame.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const payload = line.slice(5).trim();
              if (!payload) continue;
              try {
                handleEvent(JSON.parse(payload) as AgentStreamEvent);
              } catch {
                // 忽略无法解析的心跳帧
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          patch({ streaming: false });
          pushTrace({
            id: uid("trace"),
            kind: "info",
            title: "已手动停止生成",
            status: "info",
            at: Date.now(),
          });
        } else {
          const message = error instanceof Error ? error.message : "请求失败";
          patch({ error: message, streaming: false });
          pushTrace({
            id: uid("trace"),
            kind: "error",
            title: "请求失败",
            detail: message,
            status: "error",
            at: Date.now(),
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, sessionId],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const respondApproval = useCallback(
    async (messageId: string, approvalId: string, approved: boolean) => {
      const sid = sessionId;
      if (!sid) return;

      useAgentStore.getState().patchMessage(sid, messageId, (message) => ({
        approvals: (message.approvals ?? []).map((approval) =>
          approval.id === approvalId
            ? { ...approval, status: approved ? "approved" : "denied" }
            : approval,
        ),
      }));

      try {
        await fetch("/api/agent/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approvalId, approved }),
        });
      } catch {
        // 审批请求失败时，服务端会在超时后自动拒绝
      }
    },
    [sessionId],
  );

  return { isStreaming, sendMessage, stop, respondApproval };
}
