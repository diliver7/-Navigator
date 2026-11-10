"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  ShieldCheck,
  ShieldAlert,
  X,
} from "lucide-react";
import type { ChatMessage } from "@/types/agent";
import { cn, formatTime } from "@/lib/utils";

interface ChatMessageItemProps {
  message: ChatMessage;
  onApprove?: (messageId: string, approvalId: string, approved: boolean) => void;
}

const stepStatusClass: Record<string, string> = {
  pending: "border-line text-slate-500",
  running: "border-brand/40 bg-brand/10 text-brand-soft",
  done: "border-mint/30 bg-mint/[0.07] text-mint",
  skipped: "border-line text-slate-600 line-through",
};

export function ChatMessageItem({ message, onApprove }: ChatMessageItemProps) {
  const [copied, setCopied] = useState(false);

  if (message.role === "user") {
    return (
      <div className="flex justify-end gap-2.5">
        <div className="max-w-[86%] rounded-2xl rounded-tr-md border border-brand/25 bg-brand/[0.12] px-4 py-3 text-[13.5px] leading-6 text-slate-100">
          {message.content}
        </div>
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-white/[0.04] text-[10px] text-slate-400">
          U
        </span>
      </div>
    );
  }

  const hasContent = message.content.trim().length > 0;
  const pendingApprovals = (message.approvals ?? []).filter((approval) => approval.status === "pending");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex gap-2.5">
      <span
        className={cn(
          "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border",
          message.error
            ? "border-rose-400/30 bg-rose-500/10 text-rose-300"
            : "border-brand/30 bg-brand/15 text-brand-soft",
        )}
      >
        <Bot className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-slate-200">引航 Agent</span>
          {message.streaming && (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand/25 bg-brand/10 px-2 py-0.5 text-[9.5px] text-brand-soft">
              <span className="h-1 w-1 animate-pulse rounded-full bg-brand-soft" />
              执行中
            </span>
          )}
          {message.safety && !message.streaming && (
            <span className="hidden items-center gap-1 text-[9.5px] text-slate-500 sm:inline-flex">
              <ShieldCheck className="h-3 w-3 text-mint/70" />
              安全校验通过
            </span>
          )}
        </div>

        {message.plan && message.plan.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.plan.map((step, index) => (
              <span
                key={step.id}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]",
                  stepStatusClass[step.status],
                )}
              >
                {step.status === "done" ? <Check className="h-2.5 w-2.5" /> : <span>{index + 1}</span>}
                {step.title}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2 rounded-2xl rounded-tl-md border border-line bg-[#0b1120]/85 px-4 py-3">
          {hasContent ? (
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          ) : message.error ? null : (
            <div className="flex items-center gap-2 py-1">
              <span className="flex items-center gap-1">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-brand-soft"
                    style={{ animationDelay: `${dot * 0.16}s` }}
                  />
                ))}
              </span>
              <span className="text-[11.5px] text-slate-500">
                {message.streaming ? "正在规划并调用工具…" : "暂无内容"}
              </span>
            </div>
          )}

          {message.streaming && hasContent && (
            <span className="ml-0.5 inline-block h-3.5 w-[6px] translate-y-0.5 animate-blink bg-mint/80" />
          )}

          {message.error && (
            <div className="mt-2 flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/[0.07] px-3 py-2.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" />
              <div className="text-[12px] leading-5 text-rose-200">
                {message.error}
                <p className="mt-1 text-[11px] text-rose-300/70">
                  可以在右上角「本地 API 设置」测试密钥，或调整问题后重试。
                </p>
              </div>
            </div>
          )}

          {pendingApprovals.length > 0 && (
            <div className="mt-3 space-y-2">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="rounded-xl border border-amber/30 bg-amber/[0.07] p-3"
                >
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-amber">
                        需要你的确认 · {approval.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-amber/80">{approval.effect}</p>
                      <pre className="mt-2 overflow-x-auto rounded-lg border border-amber/15 bg-black/30 px-2.5 py-2 font-mono text-[10.5px] leading-5 text-slate-300">
                        {JSON.stringify(approval.args, null, 2)}
                      </pre>
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onApprove?.(message.id, approval.id, true)}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber px-3 py-1.5 text-[11px] font-semibold text-[#1a1204] transition hover:brightness-110"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          批准并继续
                        </button>
                        <button
                          type="button"
                          onClick={() => onApprove?.(message.id, approval.id, false)}
                          className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-[11px] text-slate-300 transition hover:border-white/25"
                        >
                          <X className="h-3.5 w-3.5" />
                          拒绝执行
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(message.approvals ?? []).some((approval) => approval.status !== "pending") && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.approvals
                ?.filter((approval) => approval.status !== "pending")
                .map((approval) => (
                  <span
                    key={approval.id}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]",
                      approval.status === "approved"
                        ? "border-mint/25 bg-mint/[0.07] text-mint"
                        : "border-line text-slate-500",
                    )}
                  >
                    {approval.status === "approved" ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                    {approval.label} · {approval.status === "approved" ? "已批准" : "已拒绝"}
                  </span>
                ))}
            </div>
          )}

          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 border-t border-line pt-2.5">
              <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                <FileText className="h-3 w-3" />
                Citations · 知识库来源
              </p>
              <div className="mt-2 grid gap-1.5">
                {message.citations.map((citation) => (
                  <details
                    key={`${citation.index}-${citation.title}`}
                    className="group rounded-lg border border-line bg-white/[0.02] px-2.5 py-2"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-[11px] text-slate-300">
                      <span className="grid h-4 w-4 shrink-0 place-items-center rounded bg-brand/20 font-mono text-[9px] text-brand-soft">
                        {citation.index}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{citation.title}</span>
                      <span className="shrink-0 font-mono text-[9.5px] text-mint/80">
                        {citation.score.toFixed(3)}
                      </span>
                    </summary>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-400">{citation.snippet}…</p>
                    <p className="mt-1 font-mono text-[9.5px] text-slate-600">{citation.source}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {!message.streaming && (message.content || message.error) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-3 border-t border-line pt-2 text-[10px] text-slate-600">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3 w-3" />
                {formatTime(message.createdAt)}
              </span>
              {typeof message.durationMs === "number" && <span>{(message.durationMs / 1000).toFixed(1)}s</span>}
              {message.tools && message.tools.length > 0 && (
                <span>
                  工具 {message.tools.length} 次 · {Array.from(new Set(message.tools.map((tool) => tool.label))).join("、")}
                </span>
              )}
              {message.citations && message.citations.length > 0 && <span>引用 {message.citations.length} 条</span>}
              {hasContent && (
                <button
                  type="button"
                  onClick={copy}
                  className="ml-auto inline-flex items-center gap-1 text-slate-500 transition hover:text-slate-200"
                >
                  {copied ? <Check className="h-3 w-3 text-mint" /> : <Copy className="h-3 w-3" />}
                  {copied ? "已复制" : "复制"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
