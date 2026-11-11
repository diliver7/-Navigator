"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  Calculator,
  CalendarClock,
  KeyRound,
  Menu,
  PanelRight,
  Plug,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { SessionSidebar } from "@/components/workspace/session-sidebar";
import { ChatMessageItem } from "@/components/workspace/chat-message";
import { Composer } from "@/components/workspace/composer";
import { Inspector } from "@/components/workspace/inspector";
import { McpDialog } from "@/components/workspace/mcp-dialog";
import { ApiKeyDialog } from "@/components/settings/api-key-dialog";
import { GuideConsole } from "@/components/guide/guide-console";
import { Modal } from "@/components/ui/modal";
import { useAgentStore } from "@/store/agent-store";
import { useAgentChat } from "@/hooks/use-agent-chat";
import { cn } from "@/lib/utils";

const WORKSPACE_GUIDE = [
  {
    id: "chat",
    title: "先说出你的目标",
    say: "在中间输入框中描述学习目标。引航会先拆阶段，再检索方法笔记或排复习任务，而不是直接给空泛建议。",
    target: "workspace-chat",
  },
  {
    id: "plan",
    title: "右侧是执行检查器",
    say: "这里实时展示规划步骤、工具调用轨迹与审批记录。点击「跳过」可以做本地任务标记。",
    target: "workspace-plan",
  },
  {
    id: "approval",
    title: "写入前一定问你",
    say: "新增学习任务、保存笔记这类写操作会弹出橙色确认卡片，展示具体内容与影响范围，你拒绝后引擎会换方案。",
    target: "workspace-plan",
  },
  {
    id: "composer",
    title: "语音与朗读也支持",
    say: "输入框左侧可以语音输入，右侧可以开启回答朗读。人工确认开关可以控制写操作是否拦截。",
    target: "workspace-composer",
  },
  {
    id: "api",
    title: "用自己的密钥",
    say: "右上角「可选增强设置」可填写自己的 DeepSeek Key。它只存在浏览器 localStorage，不会写入服务端。",
    target: "workspace-header",
  },
];

const SUGGESTIONS = [
  {
    icon: CalendarClock,
    title: "制定复习计划",
    prompt: "帮我制定一份两周的考研数学复习计划，并创建三个关键待办。",
    tone: "text-brand-soft border-brand/20 bg-brand/[0.06]",
  },
  {
    icon: BookOpenCheck,
    title: "查一个学习方法",
    prompt: "主动回忆和间隔重复应该怎么配合使用？请引用内置笔记回答。",
    tone: "text-mint border-mint/20 bg-mint/[0.06]",
  },
  {
    icon: StickyNote,
    title: "整理成笔记",
    prompt: "检索错题本的写法，总结成一篇复习笔记并帮我保存下来。",
    tone: "text-violet border-violet/20 bg-violet/[0.06]",
  },
  {
    icon: Calculator,
    title: "时间与计算",
    prompt: "今天是几号？距离 11 月 25 日还有多少天？顺便算一下 (18+6)*1.5。",
    tone: "text-amber border-amber/20 bg-amber/[0.06]",
  },
];

export default function WorkspacePage() {
  const sessions = useAgentStore((state) => state.sessions);
  const activeSessionId = useAgentStore((state) => state.activeSessionId);
  const createSession = useAgentStore((state) => state.createSession);
  const patchMessage = useAgentStore((state) => state.patchMessage);
  const settings = useAgentStore((state) => state.settings);
  const memory = useAgentStore((state) => state.memory);
  const hasHydrated = useAgentStore((state) => state.hasHydrated);
  const setHasHydrated = useAgentStore((state) => state.setHasHydrated);

  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mcpOpen, setMcpOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeSession = sessions.find((session) => session.id === activeSessionId);
  const messages = activeSession?.messages ?? [];
  const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  const lastMessage = messages[messages.length - 1];
  const lastContentLength = lastMessage?.content.length ?? 0;

  const { isStreaming, sendMessage, stop, respondApproval } = useAgentChat(activeSessionId ?? null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!hasHydrated) {
      const timer = setTimeout(() => setHasHydrated(true), 400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [mounted, hasHydrated, setHasHydrated]);

  useEffect(() => {
    if (!mounted || !hasHydrated) return;
    const activeExists = sessions.some((session) => session.id === activeSessionId);
    if (!activeExists) createSession();
  }, [mounted, hasHydrated, activeSessionId, sessions, createSession]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 220;
    if (nearBottom) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length, lastContentLength]);

  const toggleStep = (stepId: string) => {
    if (!activeSessionId || !latestAssistant) return;
    patchMessage(activeSessionId, latestAssistant.id, (message) => ({
      plan: (message.plan ?? []).map((step) =>
        step.id === stepId
          ? { ...step, status: step.status === "skipped" ? "pending" : "skipped" }
          : step,
      ),
    }));
  };

  if (!mounted || !hasHydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-base">
        <div className="flex flex-col items-center gap-3">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
          <p className="text-xs text-slate-500">正在恢复本地会话与记忆…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      <div className="hidden lg:flex">
        <SessionSidebar onOpenSettings={() => setSettingsOpen(true)} onOpenMcp={() => setMcpOpen(true)} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-[75] flex lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} aria-hidden />
          <div className="relative h-full">
            <SessionSidebar
              onClose={() => setSidebarOpen(false)}
              onOpenSettings={() => {
                setSettingsOpen(true);
                setSidebarOpen(false);
              }}
              onOpenMcp={() => {
                setMcpOpen(true);
                setSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          id="workspace-header"
          className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-[#070b16]/80 px-3 backdrop-blur-xl sm:px-4"
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="打开会话侧栏"
            className="rounded-lg border border-line p-1.5 text-slate-400 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[13px] font-semibold text-white">
                {activeSession?.title && activeSession.title !== "新的学习任务" ? activeSession.title : "新的学习任务"}
              </h1>
              {isStreaming && (
                <span className="hidden items-center gap-1 rounded-full border border-brand/25 bg-brand/10 px-2 py-0.5 text-[9px] text-brand-soft sm:inline-flex">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-brand-soft" />
                  运行中
                </span>
              )}
            </div>
            <p className="mt-0.5 hidden items-center gap-2 text-[9.5px] text-slate-600 sm:flex">
              <span className="font-mono">{settings.model}</span>
              <span>·</span>
              <span>{settings.apiKey ? "增强模式 · 自有 Key" : "离线引擎 · 零配置"}</span>
              <span>·</span>
              <span>记忆 {memory.length} 条</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setInspectorOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[10.5px] text-slate-300 transition hover:border-white/25 xl:hidden"
            >
              <PanelRight className="h-3.5 w-3.5" />
              检查器
            </button>
            <button
              type="button"
              onClick={() => setMcpOpen(true)}
              className="hidden items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[10.5px] text-slate-300 transition hover:border-white/25 sm:inline-flex"
            >
              <Plug className="h-3.5 w-3.5 text-mint" />
              MCP
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[10.5px] text-slate-300 transition hover:border-brand/30 hover:text-white"
            >
              <KeyRound className="h-3.5 w-3.5 text-brand-soft" />
              <span className="hidden sm:inline">{settings.apiKey ? "我的 API" : "API 设置"}</span>
            </button>
            <Link
              href="/"
              className="hidden rounded-lg px-2.5 py-1.5 text-[10.5px] text-slate-500 transition hover:text-white sm:inline-flex"
            >
              首页
            </Link>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <section id="workspace-chat" className="flex min-w-0 flex-1 flex-col">
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6">
              <div className="mx-auto max-w-3xl space-y-5">
                {messages.length === 0 ? (
                  <div className="pt-6 sm:pt-12">
                    <div className="flex flex-col items-center text-center">
                      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/25 to-mint/10 shadow-glow">
                        <Sparkles className="h-6 w-6 text-brand-soft" />
                      </span>
                      <h2 className="mt-4 text-xl font-semibold text-white">今天想练会哪一件事？</h2>
                      <p className="mt-2 max-w-md text-[12.5px] leading-6 text-slate-400">
                        说出学习目标即可。引航会先拆解阶段，再查 58 篇方法笔记、调用 8 个本地工具；涉及写入时一定会先征求你的确认。
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[9.5px] text-slate-600">
                        <span className="rounded-full border border-line px-2 py-0.5">规划</span>
                        <span className="rounded-full border border-line px-2 py-0.5">笔记出处</span>
                        <span className="rounded-full border border-line px-2 py-0.5">工具调用</span>
                        <span className="rounded-full border border-line px-2 py-0.5">人工确认</span>
                        <span className="rounded-full border border-line px-2 py-0.5">长期记忆</span>
                      </div>
                    </div>

                    <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
                      {SUGGESTIONS.map((suggestion) => {
                        const Icon = suggestion.icon;
                        return (
                          <button
                            key={suggestion.title}
                            type="button"
                            onClick={() => sendMessage(suggestion.prompt)}
                            className="group rounded-xl border border-line bg-white/[0.02] p-3.5 text-left transition hover:border-white/20 hover:bg-white/[0.05]"
                          >
                            <span className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px]", suggestion.tone)}>
                              <Icon className="h-3 w-3" />
                              {suggestion.title}
                            </span>
                            <p className="mt-2 text-[11.5px] leading-5 text-slate-400 group-hover:text-slate-300">
                              {suggestion.prompt}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatMessageItem
                      key={message.id}
                      message={message}
                      onApprove={(messageId, approvalId, approved) =>
                        respondApproval(messageId, approvalId, approved)
                      }
                    />
                  ))
                )}
              </div>
            </div>

            <div id="workspace-composer">
              <Composer onSend={sendMessage} onStop={stop} isStreaming={isStreaming} />
            </div>
          </section>

          <aside
            id="workspace-plan"
            className="hidden w-[340px] shrink-0 border-l border-line bg-[#080d18] xl:flex xl:flex-col"
          >
            <Inspector
              message={latestAssistant}
              onToggleStep={toggleStep}
              onOpenMcp={() => setMcpOpen(true)}
            />
          </aside>
        </div>
      </div>

      <GuideConsole steps={WORKSPACE_GUIDE} mode="floating" label="导游台 · 小引" />
      <ApiKeyDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <McpDialog open={mcpOpen} onClose={() => setMcpOpen(false)} />

      <Modal
        open={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        title="执行检查器"
        description="复习计划、检索轨迹与工具分组"
        className="max-w-md"
      >
        <div className="h-[60vh]">
          <Inspector message={latestAssistant} onToggleStep={toggleStep} onOpenMcp={() => setMcpOpen(true)} />
        </div>
      </Modal>
    </div>
  );
}
