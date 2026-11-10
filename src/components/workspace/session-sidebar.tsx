"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  KeyRound,
  LayoutGrid,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useAgentStore, DEFAULT_TITLE } from "@/store/agent-store";
import { cn, formatRelative } from "@/lib/utils";

interface SessionSidebarProps {
  onClose?: () => void;
  onOpenSettings: () => void;
  onOpenMcp: () => void;
}

export function SessionSidebar({ onClose, onOpenSettings, onOpenMcp }: SessionSidebarProps) {
  const sessions = useAgentStore((state) => state.sessions);
  const activeSessionId = useAgentStore((state) => state.activeSessionId);
  const createSession = useAgentStore((state) => state.createSession);
  const selectSession = useAgentStore((state) => state.selectSession);
  const deleteSession = useAgentStore((state) => state.deleteSession);
  const memory = useAgentStore((state) => state.memory);
  const addMemory = useAgentStore((state) => state.addMemory);
  const removeMemory = useAgentStore((state) => state.removeMemory);

  const [fact, setFact] = useState("");

  return (
    <aside className="flex h-full w-[268px] shrink-0 flex-col border-r border-line bg-[#070b16]">
      <div className="flex items-center justify-between px-4 py-4">
        <Logo />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭侧栏"
            className="rounded-lg border border-line p-1.5 text-slate-500 lg:hidden"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={() => {
            createSession();
            onClose?.();
          }}
          className="btn-primary w-full py-2.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          新建任务
        </button>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        <p className="px-4 text-[10px] uppercase tracking-[0.18em] text-slate-600">历史会话</p>
        <div className="mt-1.5 min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
          {sessions.length === 0 && (
            <p className="px-2 py-4 text-[11px] leading-5 text-slate-600">
              还没有会话。点击「新建任务」开始你的第一个 Agent 任务。
            </p>
          )}
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg border px-2.5 py-2 transition",
                session.id === activeSessionId
                  ? "border-brand/25 bg-brand/[0.08]"
                  : "border-transparent hover:border-line hover:bg-white/[0.03]",
              )}
            >
              <button
                type="button"
                onClick={() => {
                  selectSession(session.id);
                  onClose?.();
                }}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-[11.5px] text-slate-200">
                  {session.title === DEFAULT_TITLE ? "未命名任务" : session.title}
                </p>
                <p className="mt-0.5 text-[9.5px] text-slate-600">
                  {formatRelative(session.updatedAt)} · {session.messages.length} 条
                </p>
              </button>
              <button
                type="button"
                onClick={() => deleteSession(session.id)}
                aria-label="删除会话"
                className="shrink-0 rounded p-1 text-slate-600 opacity-0 transition hover:bg-white/5 hover:text-rose-300 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line px-3 py-3">
        <div className="flex items-center gap-1.5">
          <BrainCircuit className="h-3.5 w-3.5 text-violet" />
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">长期记忆</p>
          <span className="ml-auto rounded-full bg-white/[0.06] px-1.5 font-mono text-[9px] text-slate-400">
            {memory.length}
          </span>
        </div>
        <div className="mt-2 max-h-28 space-y-1 overflow-y-auto">
          {memory.length === 0 && <p className="px-1 text-[10px] leading-4 text-slate-600">对话中会自动提取稳定偏好。</p>}
          {memory.map((item) => (
            <div key={item.id} className="group flex items-start gap-1 rounded-md bg-white/[0.02] px-2 py-1.5">
              <p className="min-w-0 flex-1 text-[10px] leading-4 text-slate-400">{item.text}</p>
              <button
                type="button"
                onClick={() => removeMemory(item.id)}
                aria-label="删除记忆"
                className="shrink-0 text-slate-600 opacity-0 transition hover:text-rose-300 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <form
          className="mt-2 flex items-center gap-1"
          onSubmit={(event) => {
            event.preventDefault();
            if (!fact.trim()) return;
            addMemory(fact, "手动添加");
            setFact("");
          }}
        >
          <input
            value={fact}
            onChange={(event) => setFact(event.target.value)}
            placeholder="手动添加一条记忆"
            className="min-w-0 flex-1 rounded-md border border-line bg-black/25 px-2 py-1.5 text-[10px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-brand/40"
          />
          <button
            type="submit"
            aria-label="添加记忆"
            className="rounded-md border border-line p-1.5 text-slate-500 transition hover:text-white"
          >
            <Plus className="h-3 w-3" />
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-1.5 border-t border-line px-3 py-3">
        <Link
          href="/knowledge"
          className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-[10.5px] text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          知识库
        </Link>
        <button
          type="button"
          onClick={onOpenMcp}
          className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-left text-[10.5px] text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <BracesIcon />
          MCP 服务
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-left text-[10.5px] text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <KeyRound className="h-3.5 w-3.5" />
          API 设置
        </button>
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-[10.5px] text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <HomeIcon />
          返回首页
        </Link>
      </div>
    </aside>
  );
}

function BracesIcon() {
  return <span className="font-mono text-[13px] leading-none text-slate-500">{"{ }"}</span>;
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
    </svg>
  );
}
