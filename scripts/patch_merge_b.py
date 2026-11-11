# -*- coding: utf-8 -*-
"""
补丁 B：五大板块的内容与交互扩充

  方法矩阵  → 12 张方法卡（按 A/B/C 证据分级 + 操作 + 误用 + 关联笔记）+ 目标→组合表
  检索实验室 → 覆盖统计 + 分类筛选 + 检索历史 + 场景索引
  全部笔记  → 排序、分类计数、已读标记
  学习看板  → 复习负荷预测、笔记库覆盖度、本周执行清单、第二排指标
  训练路径  → 6 条路径 + 逐日日程展开 + 一键写入看板

运行：python scripts/patch_merge_b.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"

miss = []


def repl(text, old, new):
    if new and new in text:
        return text
    if old not in text:
        miss.append("repl: " + old[:70].replace("\n", "\\n"))
        return text
    return text.replace(old, new)


def splice(text, start, end, new):
    if new and new in text:
        return text
    i = text.find(start)
    j = text.find(end, i + len(start)) if i >= 0 else -1
    if i < 0 or j < 0:
        miss.append("splice: " + start[:70].replace("\n", "\\n"))
        return text
    return text[:i] + new + text[j:]


# ============================================================ 方法矩阵数据
FEATURES_BLOCK = r'''const FEATURES = [
  { icon: "🔁", ev: "A", tag: "RETRIEVAL", doc: "retrieval-practice",
    title: "主动回忆",
    desc: "合上材料先自己答，再翻开核对。同样的时间，留存明显高于反复重读。",
    ops: "读完一节立刻合书，用 3 句话写出要点，再翻回去补漏。",
    warn: "边看答案边「自测」，实际只是再认，不是回忆。" },
  { icon: "🗓", ev: "A", tag: "SPACING", doc: "spacing-effect",
    title: "间隔重复",
    desc: "把总时长摊到多次、越往后间隔越长，比一次学完再猛攻更抗遗忘。",
    ops: "学完当天、第 1 天、第 3 天、第 7 天各复习一次，之后按需拉长。",
    warn: "只在考前一周集中刷，间隔趋近于零，等于没分散。" },
  { icon: "🔀", ev: "A", tag: "INTERLEAVE", doc: "interleaving",
    title: "交错练习",
    desc: "把不同题型打乱混练，逼你先判断「这是哪一类」，迁移更稳。",
    ops: "三类题各取 3 道打乱做，每题后立刻对答案。",
    warn: "交错却不给反馈，把「必要的难度」变成「必要的错误」。" },
  { icon: "❓", ev: "B", tag: "ELABORATION", doc: "elaborative-interrogation",
    title: "精细提问",
    desc: "对每个结论追问「为什么这是真的」，把新知识和已有知识接上。",
    ops: "每读一个结论，写一句「因为……所以……，如果……就不成立」。",
    warn: "追问停留在「因为书上这么说」，没有产生自己的因果链。" },
  { icon: "🗣", ev: "B", tag: "FEYNMAN", doc: "feynman-selfexplanation",
    title: "自我解释 / 费曼技巧",
    desc: "用不给术语的大白话讲给外行听，卡住的地方就是理解缺口。",
    ops: "合书讲 3 分钟并录音，回听时标记含糊处，回去只补这些点。",
    warn: "讲的时候不停看原文，等于朗读，不是解释。" },
  { icon: "🧾", ev: "A", tag: "WORKED EXAMPLE", doc: "worked-example",
    title: "样例学习与指导消退",
    desc: "新手先看完整分步解法，再逐步挖空让学生补，最后独立解题。",
    ops: "完整样例 → 挖掉关键步的样例 → 只给答案 → 独立做。",
    warn: "已经会了还反复看全解，触发专长反转，反而更费劲。" },
  { icon: "🎨", ev: "B", tag: "DUAL CODING", doc: "dual-coding",
    title: "双重编码与画图",
    desc: "文字配自己画的图，两个通道同时编码，回忆时多一条线索。",
    ops: "读完一段，用 5 个方框加箭头画出因果链，不抄原文。",
    warn: "用现成的精美插图代替自己画，少了生成过程就没有编码。" },
  { icon: "🕸", ev: "B", tag: "STRUCTURE", doc: "concept-mapping",
    title: "概念图与矩阵表",
    desc: "把零散定义整理成「关系」，比较型知识用矩阵表最快。",
    ops: "选两个易混概念，列 4 个维度做对照表，再补一句适用边界。",
    warn: "抄目录当概念图，只有层级没有关系，等于换了排版的目录。" },
  { icon: "📝", ev: "C", tag: "CORNELL", doc: "cornell-note",
    title: "康奈尔笔记",
    desc: "一页分三栏：右侧记要点，左侧写问题，底部写一句话总结。",
    ops: "当天用左侧问题遮住右侧，自问自答一遍，答不出的标红。",
    warn: "三栏都写满文字，没有留给自测的问题栏。" },
  { icon: "🍅", ev: "C", tag: "POMODORO", doc: "pomodoro",
    title: "番茄工作法",
    desc: "25 分钟只做一件事，降低启动阻力，也限制单次负荷。",
    ops: "开工前写下这一轮的唯一产出，铃响后必须停手记录。",
    warn: "把番茄当计时钟，被打断也不记，数据全是假的。" },
  { icon: "⏳", ev: "C", tag: "DEEP WORK", doc: "deep-work",
    title: "时间块与深度工作",
    desc: "给重要任务预留 90 分钟整块，把浅层事务挤到边缘时段。",
    ops: "周末先给两件事各划一个 90 分钟块，写进日历再排别的。",
    warn: "块内仍开着消息提醒，名义深度、实际碎片。" },
  { icon: "🧮", ev: "B", tag: "ERROR REVIEW", doc: "error-log",
    title: "错题归因与周回顾",
    desc: "错题不只抄题，要写清错因类型，每周用数据决定改哪一处。",
    ops: "每题标「概念 / 步骤 / 审题 / 计算」，周五统计哪类最多。",
    warn: "只抄正确答案，不写错因，下次错同一处。" },
];
const COMBOS = [
  { goal: "背单词 / 术语 / 公式", combo: "主动回忆 + 间隔重复 + 卡片设计",
    why: "先把「认得出」变成「写得出」，再把总时长摊到 1 / 3 / 7 / 15 天。", doc: "flashcard-design" },
  { goal: "练题型、准备计算题", combo: "交错练习 + 错题归因 + 限时模拟",
    why: "打乱顺序练判别，错题按错因归类，最后用限时把速度补齐。", doc: "exam-strategy" },
  { goal: "读教材 / 文献 / 长文档", combo: "SQ3R + 康奈尔笔记 + 概念图",
    why: "带着问题读、边读边留问题栏、读完画关系图，三步缺一就会退化成抄书。", doc: "active-reading" },
  { goal: "听课 / 讲座 / 会议", combo: "要点笔记 + 24 小时内闭卷复述",
    why: "课堂只负责抓结构，真正的学习发生在课后那次不看笔记的复述。", doc: "cornell-note" },
  { goal: "考前两周", combo: "限时模拟 + 错题收敛 + 复习排程",
    why: "先按考试方式测一次拿到真实基线，再把时间全押在错得最多的点上。", doc: "exam-strategy" },
  { goal: "长期项目 / 论文", combo: "时间块 + 执行意图 + 周回顾",
    why: "用整块时间保证深度，用 if-then 保证能开始，用周回顾保证方向没跑偏。", doc: "weekly-review" },
];
const FT_FILTER = { ev: "全部" };

function renderFeatures() {
  const box = $("feature-grid"); if (!box) return;
  const tabs = $("ft-filter");
  if (tabs) tabs.innerHTML = ["全部", "A", "B", "C"].map(e => {
    const n = e === "全部" ? FEATURES.length : FEATURES.filter(f => f.ev === e).length;
    const on = FT_FILTER.ev === e;
    return `<button onclick="ftFilter('${e}')" class="rounded-full border px-3 py-1.5 text-[11px] transition ${on ? "border-mint/50 bg-mint/10 text-mint" : "border-line bg-black/20 text-slate-400 hover:border-white/25 hover:text-white"}">${e === "全部" ? "全部方法" : e + " 级证据"} <span class="ml-1 font-mono text-[10px] opacity-70">${n}</span></button>`;
  }).join("");
  const list = FEATURES.filter(f => FT_FILTER.ev === "全部" || f.ev === FT_FILTER.ev);
  box.innerHTML = list.map((f, i) => {
    const evCls = f.ev === "A" ? "bg-mint/15 text-mint" : f.ev === "B" ? "bg-brand/15 text-brand-soft" : "bg-white/10 text-slate-400";
    return `
    <div class="panel card-hover reveal p-5" style="transition-delay:${i * 35}ms">
      <div class="flex items-center justify-between">
        <span class="text-xl">${f.icon}</span>
        <span class="rounded-full ${evCls} px-2 py-0.5 font-mono text-[10px] tracking-wider">${f.ev} 级证据</span>
      </div>
      <h3 class="mt-3 text-[15px] font-semibold text-white">${f.title}</h3>
      <p class="mt-1.5 text-[12px] leading-5 text-slate-400">${f.desc}</p>
      <p class="mt-2 rounded-lg border border-line bg-black/20 px-2.5 py-2 text-[10.5px] leading-4 text-slate-400"><span class="text-amber">怎么做</span>　${f.ops}</p>
      <p class="mt-1.5 text-[10.5px] leading-4 text-slate-600"><span class="text-red-400/80">常见误用</span>　${f.warn}</p>
      <button onclick="libJump('${f.doc}')" class="mt-2.5 text-[10.5px] text-brand-soft underline decoration-dotted underline-offset-2 transition hover:text-white">读依据笔记 →</button>
    </div>`;
  }).join("");
  document.querySelectorAll("#features .reveal").forEach(el => el.classList.add("revealed"));
  renderCombos();
}
function ftFilter(e) { FT_FILTER.ev = e; renderFeatures(); }
function renderCombos() {
  const box = $("combo-grid"); if (!box) return;
  box.innerHTML = COMBOS.map(c => `
    <div class="rounded-xl border border-line bg-black/15 p-3.5">
      <p class="text-[11px] text-slate-500">${c.goal}</p>
      <p class="mt-1 text-[12.5px] font-semibold text-white">${c.combo}</p>
      <p class="mt-1.5 text-[10.5px] leading-4 text-slate-500">${c.why}</p>
      <button onclick="libJump('${c.doc}')" class="mt-1.5 text-[10px] text-brand-soft underline decoration-dotted underline-offset-2 hover:text-white">展开依据 →</button>
    </div>`).join("");
}

/* 跳到笔记库并展开某一篇（跨板块深链，方法卡 / 组合表 / 场景卡共用） */
function markRead(id) {
  if (!id) return;
  const list = LS.get("readDocs", []);
  if (list.indexOf(id) < 0) { list.push(id); LS.set("readDocs", list); }
  if (window.renderBoard) renderBoard();
}
function libJump(id) {
  if (!id) return;
  gotoRoute("library");
  setTimeout(() => {
    LIB_CAT = "全部"; LIB_Q = ""; LIB_SORT = "cat"; LIB_OPEN = id;
    const q = $("lib-query"); if (q) q.value = "";
    const sel = $("lib-sort"); if (sel) sel.value = "cat";
    markRead(id);
    renderLibrary();
    const target = document.getElementById("lib-doc-" + id);
    if (target && target.scrollIntoView) target.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 60);
}
'''

# ============================================================ 检索实验室 + 场景
KB_BLOCK = r'''const KB_PRESETS = ["怎么复习效果最好？", "主动回忆为什么比重读有效？", "复习间隔怎么安排？", "交错练习怎么用？", "卡片一张该写多少？", "错题本怎么写", "考前两周怎么排", "用 AI 学会不会替自己学了"];
const SCENES = [
  { icon: "⏰", name: "一周内就要考", hint: "先按考试方式测一次，再收敛错题", ids: ["exam-strategy", "error-log", "srs-scheduler"] },
  { icon: "📚", name: "书读完了但记不住", hint: "把阅读改成带问题读 + 闭卷复述", ids: ["active-reading", "retrieval-practice", "cornell-note"] },
  { icon: "🧩", name: "知识点很散，串不起来", hint: "先画结构，再做变式迁移", ids: ["knowledge-structure", "concept-mapping", "transfer-variability"] },
  { icon: "😵", name: "坐下了却进不了状态", hint: "先降启动阻力，再谈学习时长", ids: ["pomodoro", "distraction-design", "procrastination-emotion"] },
  { icon: "📝", name: "笔记很多，从不回看", hint: "把一页纸改造成一套自测题", ids: ["cornell-note", "zettelkasten", "weekly-review"] },
  { icon: "🤖", name: "想用 AI 又怕被它替学", hint: "先自己产出，再让 AI 只挑错", ids: ["genai-learning", "illusion-metacognition", "metacognitive-calibration"] },
];
let KB_CAT = "全部";
let KB_HISTORY = [];

function renderKb() {
  if (!$("kb-docs")) return;
  $("kb-stats").textContent = RAG.stats.docs + " 篇 · " + RAG.stats.chunks + " 分块";
  const cats = KB_CATEGORIES();
  const catBox = $("kb-cats");
  if (catBox) catBox.innerHTML = [{ name: "全部", count: KNOWLEDGE_DOCS.length }, ...cats].map(c => `
    <button onclick="kbCat('${c.name}')" class="rounded-full border px-2.5 py-1 text-[10.5px] transition ${KB_CAT === c.name ? "border-mint/50 bg-mint/10 text-mint" : "border-line bg-black/20 text-slate-400 hover:border-white/25 hover:text-white"}">
      ${esc(c.name)} <span class="ml-1 font-mono text-[9.5px] opacity-70">${c.count}</span>
    </button>`).join("");
  const docs = KNOWLEDGE_DOCS.filter(d => KB_CAT === "全部" || d.category === KB_CAT);
  $("kb-docs").innerHTML = docs.map(d => `
    <li>
      <button onclick="kbDocToggle('${d.id}')" class="flex w-full items-center gap-2.5 rounded-xl border border-line bg-black/15 px-3.5 py-2.5 text-left transition hover:border-brand/40">
        <svg class="h-3.5 w-3.5 shrink-0 text-brand-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
        <span class="min-w-0 flex-1 truncate text-[12px] text-slate-300">${esc(d.title)}</span>
        <span class="font-mono text-[10px] text-slate-600">${d.content.length} 字</span>
        <svg id="kb-chev-${d.id}" class="h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div id="kb-detail-${d.id}" class="hidden px-1 pt-2">
        <p class="rounded-xl border border-line bg-black/25 p-3 text-[11px] leading-5 text-slate-400">${esc(d.content.slice(0, 280).replace(/\n+/g, " "))}…</p>
        <button onclick="libJump('${d.id}')" class="mt-1.5 text-[10.5px] text-brand-soft underline decoration-dotted underline-offset-2 hover:text-white">展开全文 →</button>
      </div>
    </li>`).join("");
  $("kb-presets").innerHTML = KB_PRESETS.map(p => `
    <button onclick="kbPreset('${p.replace(/'/g, "\\'")}')" class="rounded-full border border-line bg-black/20 px-2.5 py-1 text-[10.5px] text-slate-400 transition hover:border-brand/40 hover:text-white">${p}</button>`).join("");
  renderKbOverview();
  renderSceneIndex();
}
function kbCat(c) { KB_CAT = c; renderKb(); }
function renderKbOverview() {
  const box = $("kb-overview"); if (!box) return;
  const chars = KNOWLEDGE_DOCS.reduce((s, d) => s + d.content.length, 0);
  const items = [
    { k: KNOWLEDGE_DOCS.length + " 篇", v: "内置方法笔记", c: "text-glow" },
    { k: KB_CATEGORIES().length + " 类", v: "学习科学 → AI 工具", c: "text-brand-soft" },
    { k: (chars / 10000).toFixed(1) + " 万字", v: "全部离线存于本页", c: "text-mint" },
    { k: RAG.stats.chunks + " 块", v: "分块索引 · 实时召回", c: "text-amber" },
  ];
  box.innerHTML = items.map(s => `
    <div class="panel p-4">
      <p class="text-xl font-bold ${s.c}">${s.k}</p>
      <p class="mt-1 text-[10.5px] text-slate-500">${s.v}</p>
    </div>`).join("");
}
function renderSceneIndex() {
  const box = $("scene-index"); if (!box) return;
  const byId = {}; KNOWLEDGE_DOCS.forEach(d => byId[d.id] = d);
  box.innerHTML = SCENES.map(s => `
    <div class="rounded-xl border border-line bg-black/15 p-3.5">
      <div class="flex items-center gap-2">
        <span class="text-base">${s.icon}</span>
        <p class="text-[12px] font-semibold text-white">${s.name}</p>
      </div>
      <p class="mt-1 text-[10.5px] text-slate-500">${s.hint}</p>
      <div class="mt-2 space-y-1">
        ${s.ids.filter(id => byId[id]).map(id => `
          <button onclick="libJump('${id}')" class="flex w-full items-start gap-1.5 text-left text-[10.5px] leading-4 text-slate-400 transition hover:text-white">
            <span class="mt-1 text-mint">·</span><span class="min-w-0 flex-1">${esc(byId[id].title)}</span>
          </button>`).join("")}
      </div>
    </div>`).join("");
}
function renderKbHistory() {
  const box = $("kb-history"); if (!box) return;
  if (!KB_HISTORY.length) { box.classList.add("hidden"); return; }
  box.classList.remove("hidden");
  box.innerHTML = `<span class="text-[10px] text-slate-600">最近</span>` + KB_HISTORY.map(h => `
    <button onclick="kbPreset('${h.replace(/'/g, "\\'")}')" class="rounded-full border border-glow/25 bg-glow/[0.05] px-2.5 py-1 text-[10px] text-glow/80 transition hover:text-glow">${h}</button>`).join("");
}
'''

# ============================================================ 全部笔记
LIB_BLOCK = r'''let LIB_CAT = "全部", LIB_Q = "", LIB_OPEN = "", LIB_SORT = "cat";
function libDocs() {
  const q = LIB_Q.trim().toLowerCase();
  const list = KNOWLEDGE_DOCS.filter(d =>
    (LIB_CAT === "全部" || d.category === LIB_CAT) &&
    (!q || (d.title + " " + (d.tags || []).join(" ") + " " + d.content).toLowerCase().includes(q)));
  if (LIB_SORT === "len") list.sort((a, b) => b.content.length - a.content.length);
  else if (LIB_SORT === "title") list.sort((a, b) => a.title.localeCompare(b.title, "zh"));
  return list;
}
function renderLibrary() {
  if (!$("lib-list")) return;
  const cats = KB_CATEGORIES();
  const chars = KNOWLEDGE_DOCS.reduce((s, d) => s + d.content.length, 0);
  const read = new Set(LS.get("readDocs", []));
  $("lib-stats").textContent = `${KNOWLEDGE_DOCS.length} 篇 · ${cats.length} 类 · ${chars.toLocaleString("zh-CN")} 字 · 已读 ${read.size} 篇 · ${RAG.stats.chunks} 个分块`;
  $("lib-cats").innerHTML = [{ name: "全部", count: KNOWLEDGE_DOCS.length }, ...cats].map(c => `
    <button onclick="libCat('${c.name}')" class="rounded-full border px-3 py-1.5 text-[11px] transition ${LIB_CAT === c.name ? "border-mint/50 bg-mint/10 text-mint" : "border-line bg-black/20 text-slate-400 hover:border-white/25 hover:text-white"}">
      ${esc(c.name)} <span class="ml-1 font-mono text-[10px] opacity-70">${c.count}</span>
    </button>`).join("");
  const list = libDocs();
  $("lib-list").innerHTML = list.length ? list.map(d => `
    <div class="rounded-xl border border-line bg-black/15 transition hover:border-brand/35">
      <button onclick="libToggle('${d.id}')" class="flex w-full items-start gap-3 p-3.5 text-left">
        <span class="mt-0.5 shrink-0 rounded-md bg-brand/10 px-2 py-0.5 text-[10px] text-brand-soft">${esc(d.category)}</span>
        <span class="min-w-0 flex-1">
          <span class="block text-[12.5px] font-semibold text-white">${esc(d.title)}${read.has(d.id) ? `<span class="ml-1.5 rounded-sm bg-mint/15 px-1 py-0.5 text-[9px] text-mint">已读</span>` : ""}</span>
          <span class="mt-1 block text-[10.5px] text-slate-500">${esc((d.tags || []).join(" · "))} · ${d.content.length} 字</span>
        </span>
        <svg class="mt-1 h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${LIB_OPEN === d.id ? "rotate-180" : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div id="lib-doc-${d.id}" class="${LIB_OPEN === d.id ? "" : "hidden"} border-t border-line px-4 pb-4 pt-3">
        <div class="max-h-[340px] overflow-y-auto pr-2 text-[11.5px] leading-6 text-slate-400" style="white-space:normal">${esc(d.content).replace(/\n\n/g, "<br><br>")}</div>
        <p class="mt-3 border-t border-line pt-2.5 text-[10px] leading-4 text-slate-600">参考来源：${esc((d.source || []).join("；"))}</p>
      </div>
    </div>`).join("") : `<p class="col-span-full rounded-xl border border-dashed border-line py-10 text-center text-xs text-slate-500">没有匹配的笔记，换个关键词或分类试试</p>`;
  // 资料是核心内容，切到本页时直接可见，不依赖滚动淡入
  document.querySelectorAll("#library .reveal").forEach(el => el.classList.add("revealed"));
}
function libCat(c) { LIB_CAT = c; LIB_OPEN = ""; renderLibrary(); }
function libSearch(v) { LIB_Q = v; renderLibrary(); }
function libSort(v) { LIB_SORT = v; renderLibrary(); }
function libToggle(id) {
  const opening = LIB_OPEN !== id;
  LIB_OPEN = opening ? id : "";
  if (opening) markRead(id);
  renderLibrary();
}

'''

# ============================================================ 训练路径
PATHS_BLOCK = r'''const PATHS = [
  { icon: "🌱", title: "7 天 · 建立主动回忆习惯", level: "入门", weeks: 1,
    audience: "长期重读划线、合书说不清的人", output: "7 天自测记录 + 20 张单点卡片",
    tags: ["闭卷自测", "卡片设计", "每日复盘"],
    goal: "我总在重读笔记，想用 7 天改成主动回忆的复习方式，每天 40 分钟，帮我排一份周计划",
    stages: [
      { d: "第 1–2 天", name: "换掉复习动作", ref: "retrieval-practice",
        tasks: ["把当晚要复习的一节改成合书默写 3 条要点", "对照原文补漏，漏掉的写成卡片", "睡前 2 分钟复述今天最难的一条"] },
      { d: "第 3–5 天", name: "卡片与每日自测", ref: "flashcard-design",
        tasks: ["每张卡只考一件事，正面问题、背面答案与出处", "每天固定 20 分钟清到期卡片", "答错的卡标记重来，不靠重读补救"] },
      { d: "第 6–7 天", name: "复盘与固化", ref: "weekly-review",
        tasks: ["做一次 20 题闭卷小测并记正确率", "对比第 1 天的默写，找出仍说不清的点", "定下下周固定的自测时段"] },
    ] },
  { icon: "📈", title: "4 周 · 搭建间隔复习系统", level: "进阶", weeks: 4,
    audience: "记了又忘、复习总堆在考前的人", output: "一份 4 周排程表 + 到期卡片清空率",
    tags: ["遗忘曲线", "复习排程", "交错练习"],
    goal: "我准备期末考，想用 4 周把 60 个知识点排成间隔复习表并配自测卡片，每天 1 小时，帮我排一份周计划",
    stages: [
      { d: "第 1 周", name: "清点与分块", ref: "srs-scheduler",
        tasks: ["把要背的内容拆成 60–100 个单点", "按难易标三档，难的多排一次", "每个点建一张卡，写清来源与页码"] },
      { d: "第 2–3 周", name: "排程与执行", ref: "forgetting-curve",
        tasks: ["按 1 / 3 / 7 / 15 天排，每天只清当天到期", "答错的卡进次日加练队列", "每周留一次混合小测"] },
      { d: "第 4 周", name: "交错与调参", ref: "interleaving",
        tasks: ["不同章节的卡混着抽，练判别", "统计反复错的卡，回教材重学", "按数据改间隔，不凭心情调"] },
    ] },
  { icon: "🎯", title: "2 周 · 考前冲刺与错题收敛", level: "挑战", weeks: 2,
    audience: "两周内考试、想把薄弱点收掉的人", output: "3 套限时模拟 + 错题归因表",
    tags: ["限时真题", "错题归因", "考前一张纸"],
    goal: "两周后考试，我想用限时真题和错题本把薄弱点收敛掉，每天 2 小时，帮我排一份周计划",
    stages: [
      { d: "第 1–3 天", name: "拿到真实基线", ref: "exam-strategy",
        tasks: ["按考试时长做一套完整真题", "按概念 / 步骤 / 审题 / 计算四类标错因", "算出每类失分占比"] },
      { d: "第 4–9 天", name: "定点收敛", ref: "error-log",
        tasks: ["只练失分最多的两类，每天 40 分钟", "错题重做不看答案，讲出每一步理由", "每两天补一套限时半卷"] },
      { d: "第 10–14 天", name: "全真模拟与节奏", ref: "exam-strategy",
        tasks: ["隔天一套全真模拟，严格计时", "把常错点写成考前一张纸", "考前一晚只过这张纸，不做新题"] },
    ] },
  { icon: "📖", title: "3 周 · 主动阅读与笔记重构", level: "进阶", weeks: 3,
    audience: "书读完了、笔记很多却从不回看的人", output: "每章 5 道自测题 + 一张概念图",
    tags: ["SQ3R", "康奈尔笔记", "概念图"],
    goal: "我读书总是读完就忘，笔记记了很多也不回看，想用 3 周把阅读和笔记改成能自测的方式，每天 1 小时",
    stages: [
      { d: "第 1 周", name: "改造阅读动作", ref: "active-reading",
        tasks: ["先看标题与小节问题，带着 3 个问题读", "每节读完合书口述要点", "读不下去的段落先标记，不硬啃"] },
      { d: "第 2 周", name: "重构笔记", ref: "cornell-note",
        tasks: ["一页分三栏：要点 / 问题 / 一句话总结", "把 5 个要点改写成 5 道自测题", "删掉纯抄写的段落"] },
      { d: "第 3 周", name: "连成结构", ref: "concept-mapping",
        tasks: ["画一张本章概念图，只写关系不抄定义", "找两个易混概念做对照表", "用问题栏自测一遍，标红答不出的"] },
    ] },
  { icon: "🔀", title: "3 周 · 迁移与变式训练", level: "进阶", weeks: 3,
    audience: "例题会做、换个问法就不会的人", output: "同一考点的 3 种问法 + 变式清单",
    tags: ["变式练习", "交错练习", "指导消退"],
    goal: "我例题都会做，但换个问法就不会，想用 3 周做变式与交错训练，每天 45 分钟，帮我排一份周计划",
    stages: [
      { d: "第 1 周", name: "先把变式找出来", ref: "transfer-variability",
        tasks: ["挑 5 个高频考点，各找 3 种问法", "对比差异：条件变了还是目标变了", "写下每种问法的判别线索"] },
      { d: "第 2 周", name: "混合练", ref: "interleaving",
        tasks: ["三类题打乱做，每题先判类型再动笔", "做完立刻对答案并写一句为什么", "错的回看完整样例，再挖空重做"] },
      { d: "第 3 周", name: "剥离提示", ref: "expertise-reversal",
        tasks: ["逐步撤掉公式表与提示", "限时做一组混合题", "统计判别错误占比，专练这一类"] },
    ] },
  { icon: "⚡", title: "2 周 · 专注力与环境改造", level: "入门", weeks: 2,
    audience: "坐下了总在整理桌面、刷手机的人", output: "每日至少 1 个 25 分钟块 + 干扰清单",
    tags: ["番茄钟", "环境设计", "时间块"],
    goal: "我一坐下就想刷手机、总在整理桌面，想用 2 周把专注时间建起来，每天能有一段完整时间",
    stages: [
      { d: "第 1–3 天", name: "降低启动阻力", ref: "distraction-design",
        tasks: ["把任务改写成两分钟第一动作", "手机放另一个房间，通知全关", "开工前写下这一轮的唯一产出"] },
      { d: "第 4–9 天", name: "建立节奏", ref: "pomodoro",
        tasks: ["每天至少 1 个 25 分钟块，逐步加到 2 个", "用 if-then 固定开始时间与地点", "记录每次中断的原因"] },
      { d: "第 10–14 天", name: "加长深度", ref: "deep-work",
        tasks: ["把最重要的事排进 90 分钟整块", "浅层事务集中到固定时段", "周末复盘：哪种干扰最常出现"] },
    ] },
];
'''

PATHS_RENDER = r'''function renderPaths() {
  const box = $("path-grid"); if (!box) return;
  box.innerHTML = PATHS.map((p, i) => `
    <div class="panel card-hover scan-card flex flex-col p-5" style="transition-delay:${i * 50}ms">
      <div class="flex items-start justify-between">
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-glow/10 text-xl">${p.icon}</span>
        <span class="rounded-full border border-glow/25 px-2 py-0.5 font-mono text-[10px] tracking-wider text-glow">${p.level}</span>
      </div>
      <h3 class="mt-3 text-[15px] font-semibold text-white">${p.title}</h3>
      <p class="mt-1 text-[11.5px] leading-4 text-slate-500">建议 ${p.weeks} 周 · ${p.audience}</p>
      <div class="mt-3 flex flex-wrap gap-1.5">
        ${p.tags.map(t => `<span class="rounded-md border border-line bg-black/20 px-2 py-0.5 text-[10.5px] text-slate-400">${t}</span>`).join("")}
      </div>
      <ul class="mt-3 space-y-1 border-t border-line pt-2.5">
        ${p.stages.map((s, k) => `<li class="flex gap-1.5 text-[10.5px] leading-4"><span class="font-mono text-glow/70">${k + 1}</span><span class="min-w-0 flex-1 text-slate-400">${s.d} · ${s.name}</span></li>`).join("")}
      </ul>
      <p class="mt-2.5 rounded-lg border border-line bg-black/20 px-2.5 py-2 text-[10px] leading-4 text-slate-500">产出：${p.output}</p>
      <div class="mt-3 flex flex-wrap gap-2">
        <button class="btn-primary path-gen !flex-1 !justify-center !py-2 !text-xs" data-i="${i}">生成我的周计划</button>
        <button class="btn-ghost path-detail !px-3 !py-2 !text-xs" data-i="${i}">展开日程</button>
      </div>
      <div id="path-plan-${i}" class="hidden"></div>
      <div id="path-out-${i}" class="hidden"></div>
    </div>`).join("");
  document.querySelectorAll(".path-gen").forEach(b => b.onclick = () => pathGen(Number(b.dataset.i), b));
  document.querySelectorAll(".path-detail").forEach(b => b.onclick = () => pathDetail(Number(b.dataset.i), b));
}
function docTitle(id) {
  const d = KNOWLEDGE_DOCS.find(x => x.id === id);
  return d ? d.title : "内置笔记";
}
function pathDetail(i, btn) {
  const p = PATHS[i], box = $("path-plan-" + i);
  if (!box) return;
  if (!box.classList.contains("hidden")) {
    box.classList.add("hidden");
    if (btn) btn.textContent = "展开日程";
    return;
  }
  box.classList.remove("hidden");
  if (btn) btn.textContent = "收起日程";
  if (box.dataset.done) return;
  box.dataset.done = "1";
  const total = p.stages.reduce((n, s) => n + s.tasks.length, 0);
  box.innerHTML = `
    <div class="mt-3 rounded-xl border border-glow/25 bg-glow/[0.04] p-3.5" style="animation: fade-up .35s ease both">
      <p class="text-[11.5px] font-semibold text-white">${esc(p.title)} · 逐日安排</p>
      <div class="mt-2.5 space-y-2.5">
        ${p.stages.map(s => `
          <div class="rounded-lg border border-line bg-black/20 p-2.5">
            <p class="text-[10.5px] font-semibold text-glow">${esc(s.d)} · ${esc(s.name)}</p>
            <ul class="mt-1.5 space-y-1">
              ${s.tasks.map(t => `<li class="flex gap-1.5 text-[10.5px] leading-4 text-slate-400"><span class="text-mint">·</span><span class="min-w-0 flex-1">${esc(t)}</span></li>`).join("")}
            </ul>
            <button onclick="libJump('${s.ref}')" class="mt-1.5 text-left text-[9.5px] text-brand-soft underline decoration-dotted underline-offset-2 hover:text-white">依据：${esc(docTitle(s.ref))} →</button>
          </div>`).join("")}
      </div>
      <button onclick="pathPushTodos(${i}, this)" class="btn-primary mt-3 w-full !justify-center !py-1.5 !text-[11px]">把这 ${total} 个动作写进学习看板</button>
    </div>`;
}
function pathPushTodos(i, btn) {
  const p = PATHS[i];
  let n = 0;
  p.stages.forEach(s => s.tasks.forEach(t => {
    state.todos.unshift({
      id: uid("todo"), title: (s.d + " · " + t).slice(0, 60),
      due: "", priority: "medium", done: false, createdAt: Date.now(),
    });
    n++;
  }));
  persist();
  if (btn) {
    btn.textContent = "已写入 " + n + " 条，去学习看板查看 →";
    btn.disabled = true;
    btn.classList.add("opacity-70");
    btn.onclick = () => gotoRoute("board");
  }
}

'''

# ============================================================ 看板扩充
BOARD_BLOCK = r'''const CHECKS = [
  { id: "c1", text: "做过一次闭卷自测（完全合上材料）" },
  { id: "c2", text: "清空当天到期的复习卡片" },
  { id: "c3", text: "用交错方式练过混合题型" },
  { id: "c4", text: "把 3 处错漏写进错题本或卡片" },
  { id: "c5", text: "完成一次 90 分钟无手机时间块" },
  { id: "c6", text: "做过一次周回顾：写下数字与一个改动" },
];
function weekKey(d) {
  const t = new Date((d || new Date()).getTime());
  t.setHours(0, 0, 0, 0);
  t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
  const week1 = new Date(t.getFullYear(), 0, 4);
  return t.getFullYear() + "-W" + (1 + Math.round(((t - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7));
}
function checksState() {
  const w = weekKey(new Date());
  let c = LS.get("checks", null);
  if (!c || c.week !== w || !c.items) { c = { week: w, items: {} }; LS.set("checks", c); }
  return c;
}
function checkDone() {
  const c = checksState();
  return CHECKS.filter(x => c.items[x.id]).length;
}
function toggleCheck(id) {
  const c = checksState();
  c.items[id] = !c.items[id];
  LS.set("checks", c);
  renderBoard();
}
function renderBoardMetrics() {
  const box = $("board-metrics"); if (!box) return;
  const open = state.todos.filter(t => !t.done).length;
  const read = LS.get("readDocs", []).length;
  const items = [
    { label: "待完成学习任务", value: open, cls: "text-amber" },
    { label: "已存学习笔记", value: state.notes.length, cls: "text-brand-soft" },
    { label: "笔记已读 / 总篇", value: read + " / " + KNOWLEDGE_DOCS.length, cls: "text-glow" },
    { label: "本周清单完成", value: checkDone() + " / " + CHECKS.length, cls: "text-mint" },
  ];
  box.innerHTML = items.map(s => `
    <div class="panel p-4 text-center">
      <p class="text-lg font-bold ${s.cls}">${s.value}</p>
      <p class="mt-1 text-[10.5px] text-slate-500">${s.label}</p>
    </div>`).join("");
}
function renderBoardLoad() {
  const box = $("board-load"); if (!box) return;
  const base = new Date(); base.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(base); d.setDate(d.getDate() + i); return d; });
  const offsets = [1, 3, 7];
  const vals = days.map(d => {
    const s = d.getTime(), e = s + 86400000;
    let n = 0;
    state.todos.forEach(t => offsets.forEach(o => {
      const due = t.createdAt + o * 86400000;
      if (due >= s && due < e) n++;
    }));
    return n;
  });
  const total = vals.reduce((a, b) => a + b, 0);
  if (!total) {
    box.innerHTML = `<p class="rounded-xl border border-dashed border-line py-8 text-center text-[11px] text-slate-600">还没有学习任务 — 排几条任务，或在「方法与路径」里把一条路径写进看板，这里会推算未来 7 天哪天要复习</p>`;
    return;
  }
  const max = Math.max(...vals, 1);
  const peak = vals.indexOf(max);
  box.innerHTML = `
    <div class="grid grid-cols-7 gap-2">
      ${vals.map((v, i) => `
        <div class="flex flex-col items-center gap-1.5">
          <span class="font-mono text-[10px] ${v ? "text-mint" : "text-slate-700"}">${v || ""}</span>
          <div class="flex h-24 w-full items-end overflow-hidden rounded-lg bg-black/25">
            <div class="w-full rounded-lg bg-gradient-to-t from-brand/70 to-mint/80" style="height:${Math.max(4, Math.round(v / max * 100))}%;opacity:${v ? 1 : 0.18}"></div>
          </div>
          <span class="text-[9.5px] ${i === 0 ? "text-mint" : "text-slate-600"}">${i === 0 ? "今天" : (days[i].getMonth() + 1) + "/" + days[i].getDate()}</span>
        </div>`).join("")}
    </div>
    <p class="mt-2 text-[10px] text-slate-600">峰值在 ${peak === 0 ? "今天" : (days[peak].getMonth() + 1) + "/" + days[peak].getDate()}（${max} 条）· 7 天合计 ${total} 次复习 · 这是按创建日推算的负荷，不是承诺</p>`;
}
function renderBoardCoverage() {
  const box = $("board-coverage"); if (!box) return;
  const read = new Set(LS.get("readDocs", []));
  const cats = KB_CATEGORIES();
  box.innerHTML = cats.map(c => {
    const docs = KNOWLEDGE_DOCS.filter(d => d.category === c.name);
    const n = docs.filter(d => read.has(d.id)).length;
    const pct = Math.round((n / docs.length) * 100);
    return `<div>
      <div class="flex items-center justify-between text-[10.5px]"><span class="text-slate-400">${esc(c.name)}</span><span class="font-mono ${pct ? "text-mint" : "text-slate-600"}">${n}/${docs.length}</span></div>
      <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10"><div class="h-full rounded-full bg-gradient-to-r from-brand to-mint" style="width:${pct}%"></div></div>
    </div>`;
  }).join("");
}
function renderBoardCheck() {
  const box = $("board-check"); if (!box) return;
  const c = checksState();
  box.innerHTML = CHECKS.map(x => `
    <label class="flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 transition ${c.items[x.id] ? "border-mint/40 bg-mint/[0.06]" : "border-line bg-black/15 hover:border-white/20"}">
      <input type="checkbox" ${c.items[x.id] ? "checked" : ""} onchange="toggleCheck('${x.id}')" class="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#00f2ea]" />
      <span class="text-[11.5px] leading-4 ${c.items[x.id] ? "text-slate-500 line-through" : "text-slate-300"}">${x.text}</span>
    </label>`).join("");
  const n = checkDone();
  const el = $("board-check-count");
  if (el) el.textContent = n + " / " + CHECKS.length + (n === CHECKS.length ? " · 本周满分" : "");
}

'''

FEATURE_OLD = """  $("feature-grid").innerHTML = FEATURES.map((f, i) => `
    <div class="panel card-hover reveal p-5" style="transition-delay:${i * 60}ms">
      <div class="flex items-center justify-between">
        <span class="text-xl">${f.icon}</span>
        <span class="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-brand-soft">${f.tag}</span>
      </div>
      <h3 class="mt-3 text-[15px] font-semibold text-white">${f.title}</h3>
      <p class="mt-1.5 text-[12px] leading-5 text-slate-400">${f.desc}</p>
    </div>`).join("");"""

SEARCH_OLD = """  const hits = RAG.search(q, 4);
  const tookMs = Math.max(1, Math.round(performance.now() - t0));"""

SEARCH_NEW = """  const hits = RAG.search(q, 4);
  const tookMs = Math.max(1, Math.round(performance.now() - t0));
  KB_HISTORY = [q, ...KB_HISTORY.filter(x => x !== q)].slice(0, 5);
  renderKbHistory();"""

BOARD_OLD = """  document.querySelectorAll(".memory-remove").forEach(b => b.onclick = () => removeMemory(b.dataset.m));
  renderCurve();
}"""

BOARD_NEW = """  document.querySelectorAll(".memory-remove").forEach(b => b.onclick = () => removeMemory(b.dataset.m));
  renderCurve();
  renderBoardMetrics();
  renderBoardLoad();
  renderBoardCoverage();
  renderBoardCheck();
}"""


def main():
    html = HTML.read_text(encoding="utf-8")

    # 方法矩阵
    html = splice(html, 'const FEATURES = [', 'const FLOW = [', FEATURES_BLOCK)
    html = repl(html, FEATURE_OLD, '  renderFeatures();')

    # 检索实验室
    html = splice(html, 'const KB_PRESETS = [', 'function kbPreset(p)', KB_BLOCK)
    html = repl(html, SEARCH_OLD, SEARCH_NEW)
    html = repl(html, '  renderKbOverview();\n  renderSceneIndex();',
                '  renderKbOverview();\n  renderSceneIndex();\n  renderKbHistory();')

    # 全部笔记
    html = splice(html, 'let LIB_CAT = "全部", LIB_Q = "", LIB_OPEN = "";',
                  '/* ================= 效率看板 ================= */', LIB_BLOCK)

    # 训练路径
    html = splice(html, 'const PATHS = [', 'const PATH_BUSY = {};', PATHS_BLOCK)
    html = splice(html, 'function renderPaths() {', 'async function pathGen(i, btn) {', PATHS_RENDER)

    # 看板
    html = repl(html, BOARD_OLD, BOARD_NEW)
    html = repl(html, 'function toggleTodoDone(id) {', BOARD_BLOCK + 'function toggleTodoDone(id) {')

    HTML.write_text(html, encoding="utf-8")
    if miss:
        print("!! 未命中 %d 条：" % len(miss))
        for m in miss:
            print("   -", m)
    else:
        print("补丁 B 完成：12 张方法卡 + 组合表 + 场景索引 + 排序 + 6 条路径 + 看板四块新面板")


if __name__ == "__main__":
    main()
