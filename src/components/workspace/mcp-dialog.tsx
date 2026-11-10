"use client";

import { useEffect, useState } from "react";
import { Boxes, Plug, ShieldAlert, Wrench } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import type { McpServer } from "@/types/agent";

interface McpDialogProps {
  open: boolean;
  onClose: () => void;
}

export function McpDialog({ open, onClose }: McpDialogProps) {
  const [servers, setServers] = useState<McpServer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/mcp")
      .then((response) => response.json())
      .then((data: { servers?: McpServer[] }) => setServers(data.servers ?? []))
      .catch(() => setServers([]))
      .finally(() => setLoading(false));
  }, [open]);

  const toolCount = servers.reduce((sum, server) => sum + server.tools.length, 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="MCP 服务清单"
      description="按 Model Context Protocol 的工具描述规范组织的本地能力层，与 Agent 的 Function Calling 一一对应。"
      className="max-w-2xl"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "已连接服务", value: servers.length },
            { label: "可用工具", value: toolCount },
            { label: "需确认工具", value: servers.flatMap((server) => server.tools).filter((tool) => tool.mutating).length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-line bg-white/[0.02] px-3 py-2.5">
              <p className="font-mono text-lg font-semibold text-white">{stat.value}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <p className="py-8 text-center text-xs text-slate-500">正在读取工具清单…</p>
        ) : (
          <div className="space-y-2.5">
            {servers.map((server) => (
              <div key={server.id} className="rounded-xl border border-line bg-white/[0.02] p-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg border border-mint/25 bg-mint/10 text-mint">
                    <Plug className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-mono text-[11.5px] text-slate-200">{server.name}</span>
                  <span className="rounded-full border border-mint/25 bg-mint/[0.07] px-1.5 py-0.5 text-[9px] text-mint">
                    online
                  </span>
                  <span className="ml-auto font-mono text-[9px] text-slate-600">{server.transport}</span>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-slate-400">{server.description}</p>
                <div className="mt-2 space-y-1">
                  {server.tools.map((tool) => (
                    <div key={tool.name} className="flex items-start gap-2 rounded-lg bg-black/25 px-2.5 py-1.5">
                      <Wrench className="mt-0.5 h-3 w-3 shrink-0 text-slate-500" />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[10px] text-slate-300">{tool.name}</p>
                        <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{tool.description}</p>
                      </div>
                      {tool.mutating && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded border border-amber/25 px-1 py-0.5 text-[8.5px] text-amber">
                          <ShieldAlert className="h-2.5 w-2.5" />
                          审批
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-start gap-2 rounded-xl border border-line bg-black/25 px-3 py-2.5">
          <Boxes className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
          <p className="text-[10px] leading-4 text-slate-500">
            当前为本地演示实现：服务清单通过 <code className="rounded bg-white/5 px-1">/api/mcp</code> 暴露，工具调用由服务端
            Function Calling 执行。生产环境可替换为标准 MCP Server（stdio / SSE 传输）而不改变前端协议。
          </p>
        </div>
      </div>
    </Modal>
  );
}
