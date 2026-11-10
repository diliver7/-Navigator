"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FileText,
  Info,
  Loader2,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";
import type { ChatMessage, McpServer, ToolTrace, TraceKind } from "@/types/agent";
import { cn } from "@/lib/utils";

interface InspectorProps {
  message?: ChatMessage;
  onToggleStep?: (stepId: string) => void;
  onOpenMcp: () => void;
}

type Tab = "plan" | "trace" | "tools";

const traceIcon: Record<TraceKind, typeof Info> = {
  plan: CircleDashed,
  thought: Radio,
  tool: Wrench,
  approval: ShieldAlert,
  safety: ShieldCheck,
  error: AlertCircle,
  info: Info,
};

const traceTone: Record<TraceKind, string> = {
  plan: "text-brand-soft border-brand/25 bg-brand/10",
  thought: "text-violet border-violet/25 bg-violet/10",
  tool: "text-mint border-mint/25 bg-mint/10",
  approval: "text-amber border-amber/25 bg-amber/10",
  safety: "text-mint border-mint/20 bg-mint/[0.07]",
  error: "text-rose-300 border-rose-400/25 bg-rose-500/10",
  info: "text-slate-400 border-line bg-white/[0.03]",
};

const toolStatusMeta: Record<ToolTrace["status"], { label: string; className: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "准备中", className: "text-slate-400 border-line", icon: CircleDashed },
  awaiting: { label: "待审批", className: "text-amber border-amber/30", icon: ShieldAlert },
  running: { label: "执行中", className: "text-brand-soft border-brand/30", icon: Loader2 },
  success: { label: "成功", className: "text-mint border-mint/30", icon: CheckCircle2 },
  error: { label: "失败", className: "text-rose-300 border-rose-400/30", icon: XCircle },
  denied: { label: "已拒绝", className: "text-slate-400 border-line", icon: XCircle },
};

export function Inspector({ message, onToggleStep, onOpenMcp }: InspectorProps) {
  const [tab, setTab] = useState<Tab>("plan");
  const [servers, setServers] = useState<McpServer[]>([]);
  const traceEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mcp")
      .then((response) => response.json())
      .then((data: { servers?: McpServer[] }) => {
        if (!cancelled && data.servers) setServers(data.servers);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const traces = message?.trace ?? [];
  useEffect(() => {
    traceEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [traces.length, tab]);

  const plan = message?.plan ?? [];
  const tools = message?.tools ?? [];
  const doneCount = plan.filter((step) => step.status === "done").length;
  const progress = plan.length ? Math.round((doneCount / plan.length) * 100) : 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-line px-3 py-2.5">
        {(
          [
            { key: "plan", label: "规划", count: plan.length },
            { key: "trace", label: "轨迹", count: traces.length },
            { key: "tools", label: "工具", count: tools.length },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] transition",
              tab === item.key ? "bg-white/[0.07] text-white" : "text-slate-500 hover:text-slate-200",
            )}
          >
            {item.label}
            {item.count > 0 && (
              <span className="rounded-full bg-white/[0.08] px-1.5 font-mono text-[9px] text-slate-400">{item.count}</span>
            )}
          </button>
        ))}
        <span className="ml-auto inline-flex items-center gap-1 text-[9.5px] text-slate-600">
          <span className="h-1 w-1 animate-pulse rounded-full bg-mint" />
          live
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {tab === "plan" && (
          <div className="space-y-3">
            {plan.length === 0 ? (
              <EmptyState
                icon={CircleDashed}
                title="还没有任务计划"
                detail="发送一条目标后，Agent 会先在这里生成可执行步骤。"
              />
            ) : (
              <>
                <div className="rounded-xl border border-line bg-white/[0.02] px-3 py-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>执行进度</span>
                    <span className="font-mono text-slate-300">{progress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand to-mint transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <ol className="space-y-1.5">
                  {plan.map((step, index) => (
                    <li
                      key={step.id}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 transition",
                        step.status === "running"
                          ? "border-brand/35 bg-brand/[0.07]"
                          : step.status === "done"
                            ? "border-mint/20 bg-mint/[0.04]"
                            : "border-line bg-white/[0.015]",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border font-mono text-[9px]",
                            step.status === "done"
                              ? "border-mint/40 bg-mint/10 text-mint"
                              : step.status === "running"
                                ? "border-brand/40 bg-brand/15 text-brand-soft"
                                : "border-line text-slate-500",
                          )}
                        >
                          {step.status === "done" ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-[12px] font-medium",
                              step.status === "skipped" ? "text-slate-600 line-through" : "text-slate-200",
                            )}
                          >
                            {step.title}
                          </p>
                          <p className="mt-0.5 text-[10.5px] leading-4 text-slate-500">{step.detail}</p>
                        </div>
                        {onToggleStep && (
                          <button
                            type="button"
                            onClick={() => onToggleStep(step.id)}
                            className="shrink-0 rounded px-1 text-[9px] text-slate-600 transition hover:text-slate-300"
                            title="本地标记跳过 / 恢复（不改变模型执行）"
                          >
                            {step.status === "skipped" ? "恢复" : "跳过"}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="px-1 text-[9.5px] leading-4 text-slate-600">
                  「跳过」仅作为本地任务跟踪标记，不会中断正在运行的工具调用。
                </p>
              </>
            )}
          </div>
        )}

        {tab === "trace" && (
          <div className="space-y-2">
            {traces.length === 0 ? (
              <EmptyState icon={Radio} title="暂无执行轨迹" detail="规划、工具调用与审批记录会实时出现在这里。" />
            ) : (
              traces.map((item) => {
                const Icon = traceIcon[item.kind] ?? Info;
                return (
                  <div key={item.id} className="flex gap-2.5">
                    <span
                      className={cn(
                        "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                        traceTone[item.kind] ?? traceTone.info,
                      )}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    <div className="min-w-0 flex-1 border-b border-line/60 pb-2">
                      <p className="text-[11.5px] leading-5 text-slate-200">{item.title}</p>
                      {item.detail && (
                        <p className="mt-0.5 break-words text-[10px] leading-4 text-slate-500">{item.detail}</p>
                      )}
                      <p className="mt-0.5 inline-flex items-center gap-1 font-mono text-[9px] text-slate-600">
                        <Clock3 className="h-2.5 w-2.5" />
                        {new Date(item.at).toLocaleTimeString("zh-CN", { hour12: false })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={traceEndRef} />
          </div>
        )}

        {tab === "tools" && (
          <div className="space-y-3">
            {tools.length === 0 && (
              <EmptyState icon={Wrench} title="本次未调用工具" detail="知识问题会自动检索知识库；写操作会先请求确认。" />
            )}

            {tools.map((tool) => {
              const meta = toolStatusMeta[tool.status];
              const StatusIcon = meta.icon;
              return (
                <div key={tool.id} className="rounded-xl border border-line bg-white/[0.02] p-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[11.5px] font-medium text-slate-200">{tool.label}</span>
                    <span
                      className={cn(
                        "ml-auto inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px]",
                        meta.className,
                      )}
                    >
                      <StatusIcon className={cn("h-2.5 w-2.5", tool.status === "running" && "animate-spin")} />
                      {meta.label}
                    </span>
                  </div>
                  <pre className="mt-2 max-h-24 overflow-auto rounded-lg bg-black/35 px-2.5 py-1.5 font-mono text-[9.5px] leading-4 text-slate-400">
                    {JSON.stringify(tool.args, null, 2)}
                  </pre>
                  {tool.result && (
                    <p className="mt-1.5 max-h-32 overflow-auto whitespace-pre-wrap break-words text-[10px] leading-4 text-slate-500">
                      {tool.result}
                    </p>
                  )}
                  {typeof tool.durationMs === "number" && (
                    <p className="mt-1 font-mono text-[9px] text-slate-600">{tool.durationMs} ms</p>
                  )}
                </div>
              );
            })}

            <div className="rounded-xl border border-line bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                  <FileText className="h-3.5 w-3.5 text-violet" />
                  MCP 服务
                </p>
                <button type="button" onClick={onOpenMcp} className="text-[10px] text-brand-soft hover:text-white">
                  查看清单
                </button>
              </div>
              <div className="mt-2 space-y-1.5">
                {servers.map((server) => (
                  <div key={server.id} className="rounded-lg border border-line bg-black/20 px-2.5 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                      <span className="font-mono text-[10px] text-slate-300">{server.name}</span>
                      <span className="ml-auto font-mono text-[9px] text-slate-600">{server.transport}</span>
                    </div>
                    <p className="mt-1 text-[9.5px] leading-4 text-slate-500">{server.description}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {server.tools.map((tool) => (
                        <span
                          key={tool.name}
                          className={cn(
                            "rounded border px-1.5 py-0.5 font-mono text-[9px]",
                            tool.mutating ? "border-amber/25 text-amber/90" : "border-line text-slate-400",
                          )}
                        >
                          {tool.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {servers.length === 0 && <p className="text-[10px] text-slate-600">加载 MCP 清单…</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Info;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line px-4 py-10 text-center">
      <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white/[0.03] text-slate-500">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-2.5 text-[11.5px] font-medium text-slate-300">{title}</p>
      <p className="mt-1 max-w-[220px] text-[10px] leading-4 text-slate-600">{detail}</p>
    </div>
  );
}
