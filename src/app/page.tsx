"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Blocks,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  KeyRound,
  Mic,
  Route,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { HeroVisual } from "@/components/home/hero-visual";
import { ApiKeyDialog } from "@/components/settings/api-key-dialog";
import { GuideConsole } from "@/components/guide/guide-console";
import { useAgentStore } from "@/store/agent-store";

const HOME_GUIDE = [
  {
    id: "intro",
    title: "认识你的学习导游",
    say: "欢迎来到引航。这不是一个收藏学习方法的书单，而是会把你的目标拆成阶段、找出笔记里的依据、再陪你把复习任务排进日历的工具站。",
    target: "hero",
  },
  {
    id: "capability",
    title: "四件真正能用的学习工具",
    say: "方法笔记检索、复习计划排程、带出处的引用核对、写入前人工确认，全部在真实链路里运行。",
    target: "capabilities",
  },
  {
    id: "flow",
    title: "一次任务如何跑完",
    say: "你只需要说清学习目标：读懂目标 → 检索笔记 → 拆成阶段任务 → 确认写入 → 带出处答复。每一步都能在右侧轨迹里追溯。",
    target: "flow",
  },
  {
    id: "setup",
    title: "可选：配置自己的 Key",
    say: "不配置也已经能完整使用：58 篇方法笔记会本地检索、排复习计划并给出带出处的答复。若想更贴合你的考试日期与作息，点右上角填入自己的 DeepSeek Key，它只保存在浏览器里。",
    target: "setup",
  },
  {
    id: "start",
    title: "开始第一个任务",
    say: "准备就绪。去工作台试试：帮我排一份考前三周的间隔复习计划，检索主动回忆的做法，并把关键任务写进学习清单。",
    target: "cta",
  },
];

const CAPABILITIES = [
  {
    icon: Route,
    title: "复习计划拆解",
    description: "把「期末还有三周」拆成阶段目标与每日任务，执行过程中逐步回写状态，计划看得见也改得动。",
    tag: "Agent",
    tone: "brand",
  },
  {
    icon: Wrench,
    title: "学习工具链",
    description: "8 个本地工具：方法笔记检索、学习任务增删、复习笔记沉淀、时间与番茄钟计算，最多 3 轮自主调用。",
    tag: "Tools",
    tone: "mint",
  },
  {
    icon: ShieldCheck,
    title: "Human-in-the-loop",
    description: "所有写操作都会挂起并弹出审批卡片，展示任务内容与影响范围，拒绝后引擎会给出替代方案。",
    tag: "Safety",
    tone: "amber",
  },
  {
    icon: BookOpenCheck,
    title: "方法笔记引用溯源",
    description: "58 篇笔记自动分块、中文二元词向量化、相似度召回；答复标注 [1][2]，可展开核对原文片段。",
    tag: "RAG",
    tone: "violet",
  },
  {
    icon: BrainCircuit,
    title: "长期记忆",
    description: "记住你的考试日期、每日可用时长与薄弱科目，去重后存入本地记忆，后续排计划时自动带上。",
    tag: "Memory",
    tone: "brand",
  },
  {
    icon: Blocks,
    title: "学习工具清单",
    description: "4 组本地能力：查笔记、排任务、存笔记、算时间，边界清晰、写入前可审计。",
    tag: "MCP",
    tone: "mint",
  },
];

const FLOW = [
  {
    step: "01",
    title: "描述目标",
    detail: "用一句话说明你的学习目标，例如「期末还有三周，帮我排间隔复习」。",
  },
  {
    step: "02",
    title: "自动规划",
    detail: "引擎拆解为 2-4 个可执行的复习阶段，并同步到规划面板。",
  },
  {
    step: "03",
    title: "工具执行",
    detail: "自主选择笔记检索、学习任务或笔记工具；写操作等待你确认。",
  },
  {
    step: "04",
    title: "答复与记忆",
    detail: "流式输出结论、出处与下一步复习动作，并记住你的备考约束。",
  },
];

const TECH = ["主动回忆", "间隔重复", "交错练习", "番茄工作法", "康奈尔笔记", "费曼技巧", "错题归因", "周回顾"];

const toneClass: Record<string, string> = {
  brand: "from-brand/20 to-brand/0 text-brand-soft border-brand/20",
  mint: "from-mint/20 to-mint/0 text-mint border-mint/20",
  amber: "from-amber/20 to-amber/0 text-amber border-amber/20",
  violet: "from-violet/20 to-violet/0 text-violet border-violet/20",
};

export default function HomePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasOwnKey = useAgentStore((state) => Boolean(state.settings.apiKey));

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(111,140,255,0.16),transparent_55%)]" />
        <div className="absolute left-[-10%] top-[18%] h-[420px] w-[420px] animate-drift rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute right-[-8%] top-[45%] h-[380px] w-[380px] animate-drift rounded-full bg-mint/[0.08] blur-[120px] [animation-delay:4s]" />
        <div className="absolute inset-0 grid-bg opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      <SiteNav onOpenSettings={() => setSettingsOpen(true)} hasOwnKey={mounted && hasOwnKey} />

      <main>
        <section id="hero" className="container-page relative pb-14 pt-14 lg:pb-20 lg:pt-20">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="chip border-brand/25 bg-brand/[0.08] text-brand-soft">
                  <Sparkles className="h-3.5 w-3.5" />
                  学习方法与效率工具站
                </span>
                <span className="chip">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
                  58 篇方法笔记内置 · 零配置可用
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08 }}
                className="mt-6 text-[38px] font-semibold leading-[1.16] tracking-tight text-white sm:text-[46px] lg:text-[52px]"
              >
                把目标交给引航
                <br />
                把方法<span className="gradient-text">练成习惯</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.16 }}
                className="mt-5 max-w-xl text-[14.5px] leading-7 text-slate-400"
              >
                不只讲方法，而是陪你把方法排进日程。58 篇系统笔记、复习计划、任务看板与带出处的问答，
                组成一条可核对、可干预、可追溯的学习闭环。不填任何 API Key 也能完整使用；
                配置后，同一批笔记会交给大模型结合你的考试日期与作息深度组织。
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.24 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <Link href="/workspace" className="btn-primary group px-6 py-3 text-sm">
                  进入工作台
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <a href="#guide" className="btn-ghost px-5 py-3 text-sm">
                  <Route className="h-4 w-4 text-mint" />
                  让导游带我看看
                </a>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="hidden items-center gap-1.5 px-2 py-3 text-xs text-slate-400 transition hover:text-white sm:inline-flex"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  可选：配置 API Key
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-500"
              >
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-mint/80" />
                  无需注册
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-mint/80" />
                  密钥仅存本地浏览器
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-mint/80" />
                  支持语音输入与朗读
                </span>
              </motion.div>
            </div>

            <HeroVisual />
          </div>

          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { value: "8", label: "本地学习工具" },
              { value: "3", label: "最大工具轮次" },
              { value: "26", label: "内置方法笔记" },
              { value: "100%", label: "数据本地存储" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-line bg-white/[0.02] px-4 py-3.5">
                <p className="font-mono text-xl font-semibold text-white">{stat.value}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="guide" className="container-page py-14">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="chip">GUIDE CONSOLE</span>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-[28px]">第一次来？先见见导游</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                小引会用 5 步带你把这套学习方法走一遍，点击任意步骤还能直接定位到页面对应区域。
              </p>
            </div>
            <span className="hidden items-center gap-1.5 text-[11px] text-slate-500 sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
              导览实时高亮页面元素
            </span>
          </div>
          <GuideConsole steps={HOME_GUIDE} label="导游台 · 小引" />
        </section>

        <section id="capabilities" className="container-page py-16">
          <div className="mb-9 text-center">
            <span className="chip mx-auto">CAPABILITY MATRIX</span>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-[28px]">不是又一份书单，是完整的练习闭环</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              检索、计划、任务、审批、笔记、复盘六层能力全部真实接入，每一层都能在界面中被观察和干预。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group relative overflow-hidden rounded-2xl border border-line bg-surface/50 p-5 transition hover:border-white/20 hover:bg-surface/80"
                >
                  <div
                    className={`pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-70 blur-2xl transition group-hover:opacity-100 ${toneClass[item.tone]}`}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className={`grid h-9 w-9 place-items-center rounded-xl border bg-gradient-to-br ${toneClass[item.tone]}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">{item.tag}</span>
                  </div>
                  <h3 className="relative mt-4 text-[15px] font-semibold text-white">{item.title}</h3>
                  <p className="relative mt-2 text-[12.5px] leading-6 text-slate-400">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section id="flow" className="container-page py-16">
          <div className="rounded-3xl border border-line bg-[linear-gradient(160deg,rgba(16,24,48,0.7),rgba(6,10,20,0.8))] p-6 sm:p-9">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="chip">EXECUTION FLOW</span>
                <h2 className="mt-3 text-2xl font-semibold text-white">四步闭环，全程可视化</h2>
              </div>
              <p className="max-w-sm text-xs leading-5 text-slate-500">
                右侧检查器实时展示规划状态、工具调用轨迹与审批记录，任何一步都能被暂停或拒绝。
              </p>
            </div>

            <div className="relative mt-9 grid gap-4 md:grid-cols-4">
              <div className="absolute left-0 right-0 top-[26px] hidden h-px bg-gradient-to-r from-brand/50 via-white/15 to-transparent md:block" />
              {FLOW.map((item) => (
                <div key={item.step} className="relative">
                  <div className="relative z-10 mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-white/12 bg-[#0b1120] font-mono text-sm font-semibold text-brand-soft shadow-glow">
                    {item.step}
                  </div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-5 text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-5">
              <span className="mr-1 text-[10px] uppercase tracking-[0.2em] text-slate-600">stack</span>
              {TECH.map((tech) => (
                <span key={tech} className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-slate-400">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="setup" className="container-page py-10">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-line bg-surface/50 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <KeyRound className="h-4 w-4 text-brand-soft" />
                本地 API 设置（可选增强）
              </div>
              <p className="mt-2 max-w-xl text-[12.5px] leading-6 text-slate-400">
                默认零配置即可使用：58 篇方法笔记、复习计划、8 个工具、人工确认、语音与学习看板全部可用，
                断网也能跑完整闭环。配置自己的 DeepSeek Key 后，笔记片段会自动注入模型上下文，
                能结合考试日期与作息排出个性化计划；接口异常或断网时自动回退离线引擎。
                密钥只保存在当前浏览器的 localStorage 中，不会写入服务端存储或代码仓库。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setSettingsOpen(true)} className="btn-ghost px-4 py-2 text-xs">
                  <KeyRound className="h-3.5 w-3.5" />
                  配置我的 API Key
                </button>
                <Link href="/knowledge" className="btn-ghost px-4 py-2 text-xs">
                  <BookOpenCheck className="h-3.5 w-3.5 text-mint" />
                  查看知识库
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-mint/20 bg-mint/[0.05] p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-mint">
                <ShieldCheck className="h-4 w-4" />
                四条使用守则
              </div>
              <ul className="mt-3 space-y-2 text-[12px] leading-5 text-mint/80">
                <li>· 每条方法建议都可展开核对原文出处</li>
                <li>· 学习任务与笔记写入前先请你确认</li>
                <li>· 任务、笔记与记录只保存在本机浏览器</li>
                <li>· 系统提示明确禁止编造引用编号与出处</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="cta" className="container-page py-16">
          <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(140deg,rgba(111,140,255,0.18),rgba(79,227,193,0.08)_55%,rgba(10,15,29,0.9))] px-6 py-12 text-center sm:px-12">
            <div className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 animate-drift rounded-full bg-brand/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 animate-drift rounded-full bg-mint/15 blur-3xl [animation-delay:3s]" />
            <span className="chip relative mx-auto">
              <Sparkles className="h-3.5 w-3.5 text-mint" />
              现在开始你的第一轮复习计划
            </span>
            <h2 className="relative mt-5 text-[26px] font-semibold leading-tight text-white sm:text-[32px]">
              从一句目标，到看得见的执行结果
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-[13px] leading-6 text-slate-300/80">
              试用示例：帮我排一份考前三周的间隔复习计划，检索主动回忆的做法，并把关键任务写进学习清单。
            </p>
            <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/workspace" className="btn-primary px-6 py-3 text-sm">
                立即进入工作台
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#guide" className="btn-ghost px-5 py-3 text-sm">
                再听一次导览
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
          <span>引航 Navigator · AI Agent 学习 / 办公任务助手</span>
          <span>Next.js 14 · DeepSeek · 本地 RAG · 参赛演示版本</span>
        </div>
      </footer>

      <ApiKeyDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
