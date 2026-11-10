"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, Check, Clock3, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const RUN_STEPS = [
  { label: "解析目标与约束", icon: Sparkles },
  { label: "拆解为 4 个执行步骤", icon: Check },
  { label: "检索方法笔记 · Top-4", icon: BookOpenCheck },
  { label: "写入复习任务 · 等待确认", icon: ShieldCheck },
  { label: "整理答复并标注引用", icon: Clock3 },
];

const FLOAT_PARTICLES = [
  { left: "16%", top: "24%", size: 4, delay: "0s" },
  { left: "78%", top: "18%", size: 3, delay: "0.7s" },
  { left: "84%", top: "62%", size: 5, delay: "1.4s" },
  { left: "22%", top: "76%", size: 3, delay: "2s" },
  { left: "52%", top: "10%", size: 2, delay: "2.6s" },
  { left: "70%", top: "84%", size: 2, delay: "1.1s" },
];

export function HeroVisual() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % RUN_STEPS.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="pointer-events-none absolute -left-10 top-10 h-56 w-56 rounded-full bg-brand/25 blur-[90px]" />
      <div className="pointer-events-none absolute -right-6 bottom-0 h-52 w-52 rounded-full bg-mint/20 blur-[90px]" />

      <motion.div
        initial={{ opacity: 0, y: 28, rotateX: 6 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="glass relative overflow-hidden rounded-[26px] p-4 shadow-card sm:p-5"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ff6b6b]/70" />
            <span className="h-2 w-2 rounded-full bg-[#ffd166]/70" />
            <span className="h-2 w-2 rounded-full bg-mint/70" />
            <span className="ml-2 font-mono text-[10px] text-slate-500">navigator · live session</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-mint/25 bg-mint/10 px-2.5 py-1 text-[10px] font-medium text-mint">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
            学习闭环运行中
          </span>
        </div>

        <div className="relative mt-4 h-[212px] overflow-hidden rounded-2xl border border-line bg-[radial-gradient(circle_at_50%_45%,rgba(111,140,255,0.18),transparent_62%)]">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]" />
          <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.07]" />

          <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 animate-orbit">
            {[0, 90, 180, 270].map((degree, index) => (
              <span
                key={degree}
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-brand/80 shadow-glow"
                style={{
                  transform: `rotate(${degree}deg) translateY(-112px)`,
                  opacity: 0.9 - index * 0.15,
                }}
              />
            ))}
          </div>

          {FLOAT_PARTICLES.map((particle, index) => (
            <span
              key={index}
              className="absolute rounded-full bg-mint/70"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                animation: `float 5s ease-in-out ${particle.delay} infinite`,
              }}
            />
          ))}

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative grid h-[104px] w-[104px] place-items-center">
              <span className="absolute inset-0 animate-pulse-ring rounded-full border border-brand/50" />
              <span className="absolute inset-2 animate-pulse-ring rounded-full border border-mint/40 [animation-delay:900ms]" />
              <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_140deg,#6f8cff,#4fe3c1,#a78bfa,#6f8cff)] opacity-70 blur-[1px]" />
              <span className="absolute inset-[3px] rounded-full bg-[radial-gradient(circle_at_35%_28%,#141d38,#080d19_70%)]" />
              <span className="relative font-mono text-[9px] uppercase tracking-[0.28em] text-slate-400">agent</span>
              <span className="absolute bottom-5 h-1 w-1 rounded-full bg-mint shadow-[0_0_12px_2px_rgba(79,227,193,0.8)]" />
            </div>
          </div>

          <div className="absolute left-3 top-3 animate-float rounded-xl border border-white/10 bg-black/45 px-2.5 py-2 backdrop-blur">
            <p className="text-[9px] uppercase tracking-wider text-slate-500">plan</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-200">4 步 · 可编辑</p>
          </div>
          <div className="absolute right-3 top-5 animate-float rounded-xl border border-white/10 bg-black/45 px-2.5 py-2 backdrop-blur [animation-delay:1.2s]">
            <p className="text-[9px] uppercase tracking-wider text-slate-500">rag</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-mint">
              <span className="h-1 w-1 rounded-full bg-mint" />
              0.82 相似度
            </p>
          </div>
          <div className="absolute bottom-3 left-4 animate-float rounded-xl border border-amber/25 bg-amber/[0.08] px-2.5 py-2 backdrop-blur [animation-delay:0.6s]">
            <p className="flex items-center gap-1 text-[10px] text-amber">
              <Wrench className="h-3 w-3" />
              新增复习任务
            </p>
            <p className="mt-0.5 text-[9px] text-amber/70">等待人工确认</p>
          </div>
          <div className="absolute bottom-4 right-3 animate-float rounded-xl border border-white/10 bg-black/45 px-2.5 py-2 backdrop-blur [animation-delay:1.8s]">
            <p className="text-[9px] uppercase tracking-wider text-slate-500">memory</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-200">已记住 3 条偏好</p>
          </div>
        </div>

        <div className="relative mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-black/30 px-3 py-2.5">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/20 font-mono text-[9px] text-brand-soft">
            U
          </span>
          <p className="text-[12px] leading-5 text-slate-300">
            帮我排一份考前三周的间隔复习计划，并检索主动回忆的做法。
            <span className="ml-1 inline-block h-3.5 w-[6px] translate-y-0.5 animate-blink bg-mint/80 align-middle" />
          </p>
        </div>

        <div className="relative mt-3 space-y-1.5">
          {RUN_STEPS.map((step, index) => {
            const Icon = step.icon;
            const state = index < active ? "done" : index === active ? "running" : "idle";
            return (
              <div
                key={step.label}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-all duration-500",
                  state === "running"
                    ? "border-brand/30 bg-brand/[0.08]"
                    : state === "done"
                      ? "border-transparent bg-white/[0.02]"
                      : "border-transparent opacity-40",
                )}
              >
                <span
                  className={cn(
                    "grid h-4 w-4 place-items-center rounded-full border text-[8px]",
                    state === "done"
                      ? "border-mint/40 bg-mint/10 text-mint"
                      : state === "running"
                        ? "border-brand/50 bg-brand/20 text-brand-soft"
                        : "border-line text-slate-600",
                  )}
                >
                  <Icon className="h-2.5 w-2.5" />
                </span>
                <span className={cn("text-[11px]", state === "running" ? "text-slate-100" : "text-slate-400")}>
                  {step.label}
                </span>
                {state === "running" && (
                  <span className="ml-auto flex items-center gap-0.5">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-1 w-1 animate-typing-dot rounded-full bg-brand-soft"
                        style={{ animationDelay: `${dot * 0.15}s` }}
                      />
                    ))}
                  </span>
                )}
                {state === "done" && <Check className="ml-auto h-3 w-3 text-mint/70" />}
              </div>
            );
          })}
        </div>

        <div className="relative mt-3 flex items-center justify-between border-t border-line pt-2.5 font-mono text-[10px] text-slate-500">
          <span>tools 8</span>
          <span>rounds 2 / 3</span>
          <span>safety ✓</span>
          <span className="text-mint">streaming</span>
        </div>
      </motion.div>
    </div>
  );
}
