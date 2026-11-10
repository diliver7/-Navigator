"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  Database,
  FileText,
  Layers,
  Loader2,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

interface DocMeta {
  id: string;
  title: string;
  source: string;
  characters: number;
  chunkCount: number;
}

interface Stats {
  docs: number;
  chunks: number;
  characters: number;
}

interface Hit {
  docId: string;
  chunkId: string;
  title: string;
  source: string;
  content: string;
  score: number;
}

export default function KnowledgePage() {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [stats, setStats] = useState<Stats>({ docs: 0, chunks: 0, characters: 0 });
  const [query, setQuery] = useState("主动回忆为什么比重读更有效");
  const [topK, setTopK] = useState(4);
  const [hits, setHits] = useState<Hit[]>([]);
  const [tookMs, setTookMs] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const loadDocs = useCallback(async () => {
    try {
      const response = await fetch("/api/knowledge");
      const data = (await response.json()) as { docs?: DocMeta[]; stats?: Stats };
      setDocs(data.docs ?? []);
      if (data.stats) setStats(data.stats);
    } catch {
      // 忽略加载失败
    }
  }, []);

  const runSearch = useCallback(async (value: string, k: number) => {
    if (!value.trim()) return;
    setSearching(true);
    try {
      const response = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: value, topK: k }),
      });
      const data = (await response.json()) as { hits?: Hit[]; tookMs?: number };
      setHits(data.hits ?? []);
      setTookMs(data.tookMs ?? null);
      setSearched(true);
    } catch {
      setHits([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    loadDocs();
    runSearch("主动回忆为什么比重读更有效", 4);
  }, [loadDocs, runSearch]);

  const handleUpload = async () => {
    if (!content.trim()) {
      setNotice({ tone: "error", text: "请先粘贴文档内容（至少 30 字）" });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = (await response.json()) as { error?: string; doc?: DocMeta };
      if (!response.ok) throw new Error(data.error || "写入失败");
      setNotice({ tone: "ok", text: `已入库《${data.doc?.title}》，共 ${data.doc?.chunkCount} 个分块` });
      setTitle("");
      setContent("");
      await loadDocs();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "写入失败" });
    } finally {
      setSaving(false);
    }
  };

  const maxScore = hits.length ? Math.max(...hits.map((hit) => hit.score), 0.001) : 1;

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,227,193,0.08),transparent_55%)]" />
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-[#05070f]/80 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-slate-400 transition hover:text-white sm:inline-flex">
              <ArrowLeft className="h-3.5 w-3.5" />
              返回首页
            </Link>
            <Link href="/workspace" className="btn-primary px-4 py-2 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              去工作台
            </Link>
          </div>
        </div>
      </header>

      <main className="container-page py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="chip border-mint/25 bg-mint/[0.07] text-mint">
              <BookOpenCheck className="h-3.5 w-3.5" />
              RETRIEVAL LAB · 笔记检索台
            </span>
            <h1 className="mt-3 text-2xl font-semibold text-white sm:text-[28px]">内置学习方法笔记</h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-slate-400">
              文档按语义段落分块，使用中文二元词 + TF-IDF 构建索引，余弦相似度召回 Top-K 片段。
              工作台回答里的 [编号] 出处与这里的检索结果一一对应。
            </p>
          </div>
          <button type="button" onClick={() => setShowUpload((value) => !value)} className="btn-ghost px-4 py-2 text-xs">
            <Upload className="h-3.5 w-3.5" />
            {showUpload ? "收起上传" : "添加我的笔记"}
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: FileText, label: "方法笔记", value: stats.docs },
            { icon: Layers, label: "索引分块", value: stats.chunks },
            { icon: Database, label: "字符总量", value: stats.characters.toLocaleString("zh-CN") },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-line bg-white/[0.02] px-4 py-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white/[0.03] text-slate-400">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-mono text-lg font-semibold text-white">{stat.value}</p>
                  <p className="text-[10px] text-slate-500">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-[#080d18]/70 px-4 py-3 text-[10.5px] text-slate-500">
          <span className="font-mono uppercase tracking-[0.18em] text-slate-600">pipeline</span>
          {["解析", "语义分块", "TF-IDF 向量", "余弦召回", "引用溯源"].map((step, index) => (
            <span key={step} className="inline-flex items-center gap-2">
              {index > 0 && <span className="text-slate-700">→</span>}
              <span className={cn("rounded-full border px-2 py-0.5", index === 3 ? "border-mint/30 text-mint" : "border-line text-slate-400")}>
                {step}
              </span>
            </span>
          ))}
          <span className="ml-auto font-mono text-[9.5px] text-slate-600">无外部 Embedding 依赖 · 离线可演示</span>
        </div>

        {showUpload && (
          <div className="mt-4 rounded-2xl border border-line bg-surface/60 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="文档标题（可选）"
                className="rounded-xl border border-line bg-black/30 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-brand/50"
              />
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                支持 Markdown / 纯文本，写入后会立即参与检索。
              </div>
            </div>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              placeholder="粘贴你的课堂笔记、复习要点或摘录内容…（至少 30 字）"
              className="mt-3 w-full resize-y rounded-xl border border-line bg-black/30 px-3 py-2.5 text-xs leading-5 text-slate-100 outline-none placeholder:text-slate-600 focus:border-brand/50"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-600">{content.length} 字符</span>
              <div className="flex items-center gap-2">
                {notice && (
                  <span className={cn("text-[10.5px]", notice.tone === "ok" ? "text-mint" : "text-rose-300")}>
                    {notice.text}
                  </span>
                )}
                <button type="button" onClick={handleUpload} disabled={saving} className="btn-primary px-4 py-2 text-xs">
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  加入笔记库
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">
          <section>
            <div className="rounded-2xl border border-line bg-[#080d18]/80 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") runSearch(query, topK);
                    }}
                    placeholder="输入学习问题，例如：复习间隔怎么安排"
                    className="w-full rounded-xl border border-line bg-black/30 py-2.5 pl-9 pr-3 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-mint/40"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => runSearch(query, topK)}
                  disabled={searching}
                  className="btn-primary px-5 py-2.5 text-xs"
                >
                  {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                  检索
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="flex flex-1 items-center gap-2 text-[10px] text-slate-500">
                  Top-K
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={topK}
                    onChange={(event) => setTopK(Number(event.target.value))}
                    className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-mint"
                  />
                  <span className="w-4 font-mono text-slate-300">{topK}</span>
                </label>
                {tookMs !== null && (
                  <span className="font-mono text-[9.5px] text-slate-600">召回耗时 {tookMs} ms</span>
                )}
                <span className="rounded-full border border-line px-2 py-0.5 text-[9px] text-slate-500">只读调试</span>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {hits.length === 0 && searched && !searching && (
                <div className="rounded-2xl border border-dashed border-line px-4 py-12 text-center">
                  <p className="text-xs text-slate-400">没有召回结果</p>
                  <p className="mt-1 text-[10.5px] text-slate-600">换个笔记里的术语试试，例如主动回忆、认知负荷、错题归因。</p>
                </div>
              )}
              {hits.map((hit, index) => (
                <article key={hit.chunkId} className="rounded-2xl border border-line bg-white/[0.02] p-4 transition hover:border-white/20">
                  <div className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand/20 font-mono text-[10px] text-brand-soft">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[12.5px] font-medium text-slate-100">{hit.title}</h3>
                        <span className="font-mono text-[9px] text-slate-600">{hit.chunkId}</span>
                        <span className="ml-auto font-mono text-[10px] text-mint">{hit.score.toFixed(3)}</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand to-mint"
                          style={{ width: `${Math.max(6, (hit.score / maxScore) * 100)}%` }}
                        />
                      </div>
                      <p className="mt-2.5 line-clamp-4 whitespace-pre-wrap text-[11px] leading-5 text-slate-400">{hit.content}</p>
                      <p className="mt-2 font-mono text-[9px] text-slate-600">{hit.source}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside>
            <div className="rounded-2xl border border-line bg-[#080d18]/80 p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-200">
                  <FileText className="h-3.5 w-3.5 text-brand-soft" />
                  已加入的笔记
                </p>
                <span className="font-mono text-[9.5px] text-slate-600">{docs.length} docs</span>
              </div>
              <div className="mt-3 space-y-1.5">
                {docs.map((doc) => (
                  <div key={doc.id} className="rounded-xl border border-line bg-white/[0.015] px-3 py-2">
                    <p className="truncate text-[11px] text-slate-300">{doc.title}</p>
                    <div className="mt-1 flex items-center gap-2 font-mono text-[9px] text-slate-600">
                      <span>{doc.chunkCount} chunks</span>
                      <span>·</span>
                      <span>{doc.characters.toLocaleString("zh-CN")} 字</span>
                    </div>
                    <p className="mt-1 truncate font-mono text-[8.5px] text-slate-700">{doc.source}</p>
                  </div>
                ))}
                {docs.length === 0 && <p className="text-[10px] text-slate-600">加载中…</p>}
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-line bg-white/[0.02] p-4">
              <p className="text-[11px] font-medium text-slate-300">检索参数说明</p>
              <ul className="mt-2 space-y-1.5 text-[10px] leading-5 text-slate-500">
                <li>· 分块：420 字上限，80 字重叠，优先按段落切分</li>
                <li>· 切词：中文单字 + 二元词，英文按单词</li>
                <li>· 打分：TF-IDF 加权后计算余弦相似度</li>
                <li>· 标题命中：额外 0.12 加分，提升专有名词召回</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
