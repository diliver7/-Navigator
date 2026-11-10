"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Compass, Play, Square, X } from "lucide-react";
import { TypingText } from "@/components/ui/typing-text";
import { cn } from "@/lib/utils";

export interface GuideStep {
  id: string;
  title: string;
  say: string;
  target?: string;
}

interface GuideConsoleProps {
  steps: GuideStep[];
  mode?: "section" | "floating";
  label?: string;
  className?: string;
}

function GuideAvatar({ size = "md", active }: { size?: "md" | "lg" | "sm"; active?: boolean }) {
  const dimension = size === "lg" ? "h-24 w-24" : size === "sm" ? "h-9 w-9" : "h-14 w-14";
  const core = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-7 w-7" : "h-10 w-10";
  return (
    <div className={cn("relative grid place-items-center", dimension)}>
      <span className="absolute inset-0 rounded-full bg-brand/25 blur-2xl" />
      <span className="absolute inset-0 animate-pulse-ring rounded-full border border-mint/40" />
      <span className="absolute inset-2 animate-pulse-ring rounded-full border border-brand/40 [animation-delay:700ms]" />
      <span
        className={cn(
          "absolute inset-0 animate-orbit rounded-full border border-dashed border-white/15",
          active && "border-brand/40",
        )}
      />
      <span
        className={cn(
          "relative grid place-items-center rounded-full bg-[radial-gradient(circle_at_32%_28%,#9db2ff,#4c63d2_55%,#111a37)] shadow-glow",
          core,
        )}
      >
        <Compass className={cn("text-white/90", size === "lg" ? "h-7 w-7" : "h-5 w-5")} />
      </span>
    </div>
  );
}

export function GuideConsole({ steps, mode = "section", label = "导游台", className }: GuideConsoleProps) {
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);
  const [open, setOpen] = useState(mode === "section");
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const highlight = useCallback((step?: GuideStep) => {
    if (!step?.target || typeof document === "undefined") return;
    const element = document.getElementById(step.target);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.classList.add("guide-target");
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => element.classList.remove("guide-target"), 3400);
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setActive((current) => {
        if (current >= steps.length - 1) {
          setRunning(false);
          return current;
        }
        const next = current + 1;
        highlight(steps[next]);
        return next;
      });
    }, 5200);
    return () => clearInterval(timer);
  }, [running, steps, highlight]);

  const go = (index: number) => {
    const bounded = Math.max(0, Math.min(steps.length - 1, index));
    setActive(bounded);
    if (mode === "floating") setOpen(true);
    highlight(steps[bounded]);
  };

  const step = steps[active];

  if (mode === "floating") {
    return (
      <div className={cn("fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3", className)}>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="w-[330px] overflow-hidden rounded-2xl border border-white/12 bg-[#0a1020]/95 shadow-card backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
                  <span className="text-xs font-semibold tracking-wide text-slate-200">{label}</span>
                  <span className="text-[10px] text-slate-500">学习导览</span>
                </div>
                <button
                  type="button"
                  aria-label="收起导游台"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-slate-500 transition hover:bg-white/5 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-start gap-3 px-4 py-4">
                <GuideAvatar active={running} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-white">{step.title}</p>
                  <p className="mt-1 min-h-[44px] text-xs leading-5 text-slate-400">
                    <TypingText text={step.say} speed={18} />
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-line px-4 py-3">
                <div className="flex items-center gap-1">
                  {steps.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={`跳到步骤 ${index + 1}`}
                      onClick={() => go(index)}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        index === active ? "w-5 bg-brand" : "w-1.5 bg-white/20 hover:bg-white/40",
                      )}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="上一步"
                    onClick={() => go(active - 1)}
                    disabled={active === 0}
                    className="rounded-lg border border-line p-1.5 text-slate-400 transition hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (running) {
                        setRunning(false);
                        return;
                      }
                      setRunning(true);
                      highlight(step);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-brand/30 bg-brand/10 px-2.5 py-1.5 text-[11px] font-medium text-brand-soft transition hover:bg-brand/20"
                  >
                    {running ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    {running ? "停止" : "导览"}
                  </button>
                  <button
                    type="button"
                    aria-label="下一步"
                    onClick={() => go(active + 1)}
                    disabled={active === steps.length - 1}
                    className="rounded-lg border border-line p-1.5 text-slate-400 transition hover:text-white disabled:opacity-30"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="group flex items-center gap-2 rounded-full border border-white/15 bg-[#0d1428]/95 px-3 py-2 shadow-card backdrop-blur-xl transition hover:border-brand/40"
          aria-expanded={open}
          aria-label={label}
        >
          <GuideAvatar size="sm" active={open} />
          <span className="pr-1 text-left">
            <span className="block text-[11px] font-semibold text-white">{label}</span>
            <span className="block text-[10px] text-slate-500">{open ? "正在导览" : "需要帮助？"}</span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(150deg,rgba(18,26,48,0.9),rgba(8,12,24,0.92))] p-6 shadow-card sm:p-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-mint/10 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col items-start">
          <span className="chip mb-5">
            <Compass className="h-3.5 w-3.5 text-mint" />
            GUIDE CONSOLE · 六步上手
          </span>
          <div className="flex items-center gap-5">
            <GuideAvatar size="lg" active={running} />
            <div>
              <p className="text-lg font-semibold text-white">你好，我是小引</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                引航的学习导游。第一次来？<br />我带你把这套方法走一遍。
              </p>
            </div>
          </div>

          <div className="mt-7 w-full rounded-2xl border border-line bg-black/25 p-4">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-500">
              <span>实时讲解</span>
              <span>
                {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
              </span>
            </div>
            <p className="mt-2 min-h-[66px] text-[13px] leading-6 text-slate-200">
              <TypingText text={step.say} speed={22} />
            </p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand to-mint"
                animate={{ width: `${((active + 1) / steps.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => go(active - 1)} disabled={active === 0} className="btn-ghost px-3 py-2 text-xs">
              <ChevronLeft className="h-4 w-4" />
              上一步
            </button>
            <button
              type="button"
              onClick={() => {
                if (running) {
                  setRunning(false);
                  return;
                }
                setRunning(true);
                highlight(step);
              }}
              className="btn-primary px-4 py-2 text-xs"
            >
              {running ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {running ? "暂停导览" : "开始导览"}
            </button>
            <button type="button" onClick={() => go(active + 1)} disabled={active === steps.length - 1} className="btn-ghost px-3 py-2 text-xs">
              下一步
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-[13px] top-3 bottom-3 w-px bg-gradient-to-b from-brand/50 via-white/10 to-transparent" />
          <ul className="space-y-2">
            {steps.map((item, index) => {
              const done = index < active;
              const current = index === active;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => go(index)}
                    className={cn(
                      "group flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition",
                      current
                        ? "border-brand/35 bg-brand/10"
                        : "border-transparent hover:border-line hover:bg-white/[0.03]",
                    )}
                  >
                    <span
                      className={cn(
                        "relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-semibold transition",
                        current
                          ? "border-brand bg-brand text-white"
                          : done
                            ? "border-mint/50 bg-mint/10 text-mint"
                            : "border-line bg-[#0a1020] text-slate-500",
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block text-[13px] font-medium", current ? "text-white" : "text-slate-300")}>
                        {item.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                        {item.target ? "点击可定位到页面对应区域" : "导览提示"}
                      </span>
                    </span>
                    {current && <span className="ml-auto mt-1 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-mint" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
