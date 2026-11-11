/* ================= AI 问答台（问答台 · ASK） ================= */
const ASK_CATS = [
  { key: "all", name: "全部问题", icon: "✦" },
  { key: "method", name: "方法原理", icon: "◎" },
  { key: "memory", name: "记忆复习", icon: "↻" },
  { key: "focus", name: "专注效率", icon: "⚡" },
  { key: "plan", name: "计划执行", icon: "▤" },
  { key: "exam", name: "考前应试", icon: "◇" },
  { key: "ai", name: "AI 辅助", icon: "✳" },
];
const ASK_SAMPLES = {
  all: ["主动回忆为什么比重读更有效？", "两周后考试，每天 90 分钟怎么排？", "一坐下就想刷手机，怎么改？"],
  method: ["主动回忆为什么比重读更有效？", "费曼技巧怎么才算讲清楚？", "交错练习会让当下学得更慢吗？"],
  memory: ["间隔复习的间隔到底怎么定？", "卡片怎么设计才不会越背越乱？", "为什么背完第二天就忘了？"],
  focus: ["一坐下就想刷手机，怎么改？", "番茄钟 25 分钟对我太短怎么办？", "学习时总想整理桌面，是拖延吗？"],
  plan: ["两周后考试，每天 90 分钟怎么排？", "计划总在第三天崩掉，问题在哪？", "怎么判断一个计划可不可行？"],
  exam: ["考前三周该刷题还是看笔记？", "错题本怎么用才不浪费时间？", "模拟考分数波动大怎么调整？"],
  ai: ["用 AI 总结，会不会等于没学？", "怎么让 AI 当提问者而不是答案机？", "AI 给的答案怎么核对真假？"],
};
const ASK_TPL = [
  { t: "对比型", q: "主动回忆和间隔重复有什么区别？我该先练哪个？" },
  { t: "排计划", q: "我两周后考试，每天 90 分钟，帮我排一份能执行的复习计划" },
  { t: "找原文", q: "笔记里关于认知负荷的原文是怎么说的？" },
  { t: "排查", q: "我每天都在复习，但一做题还是错，问题出在哪？" },
];
const ASK = { cat: "all", busy: false, count: 0, hitsTotal: 0, lastQ: "", lastAnswer: "", refs: [], history: [], seed: 0 };

function askToast(msg) {
  let el = document.getElementById("ask-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "ask-toast";
    el.className = "fixed bottom-6 left-1/2 z-[120] rounded-full border border-line bg-black/85 px-4 py-2 text-[11.5px] text-slate-200 shadow-card backdrop-blur";
    el.style.pointerEvents = "none";
    el.style.opacity = "0";
    el.style.transform = "translate(-50%, 8px)";
    el.style.transition = "opacity .2s ease, transform .2s ease";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = "1";
  el.style.transform = "translate(-50%, 0)";
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translate(-50%, 8px)"; }, 1800);
}
function askMode() {
  const key = !!getKey();
  const m = $("ask-mode"), h = $("ask-hint");
  if (m) {
    m.textContent = key ? "增强模式" : "离线模式";
    m.className = key
      ? "cursor-pointer rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[10.5px] font-medium text-brand-soft"
      : "cursor-pointer rounded-full border border-mint/25 bg-mint/10 px-3 py-1 text-[10.5px] font-medium text-mint";
    m.title = key ? "点此查看或修改配置" : "点此配置可选增强";
    m.onclick = () => gotoRoute("api");
  }
  if (h) h.textContent = key ? "已配置 Key：大模型组织语言，依据仍是本地笔记" : "未配置 Key：本地检索 + 摘录回答，全部离线";
}
function askStat() {
  const el = $("ask-stat");
  if (!el) return;
  const avg = ASK.count ? (ASK.hitsTotal / ASK.count).toFixed(1) : "0";
  el.textContent = `已答 ${ASK.count} 问 · 平均 ${avg} 条引用`;
}
function askScroll() {
  const t = $("ask-thread");
  if (t) t.scrollTop = t.scrollHeight;
}
function askBubble(role, inner) {
  const wrap = document.createElement("div");
  if (role === "user") {
    wrap.className = "flex justify-end";
    wrap.innerHTML = `<div class="max-w-[85%] rounded-2xl rounded-br-md bg-brand/20 px-3.5 py-2.5 text-[12.5px] leading-6 text-slate-100">${inner}</div>`;
  } else {
    wrap.className = "flex gap-2.5";
    wrap.innerHTML = `<span class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-white/[0.06] text-[10.5px] text-slate-300">引</span>
      <div class="min-w-0 max-w-[92%] rounded-2xl rounded-tl-md border border-line bg-black/25 px-3.5 py-3 text-[12.5px] leading-6 text-slate-300">${inner}</div>`;
  }
  const thread = $("ask-thread");
  if (thread) thread.appendChild(wrap);
  askScroll();
  return wrap.querySelector("div");
}
function askThinking() {
  return `<div class="flex items-center gap-2 text-[11.5px] text-slate-500">
    <span class="typing-dot"><span></span><span></span><span></span></span>正在检索内置笔记并组织答案…
  </div>`;
}
function askRenderCats() {
  const cats = $("ask-cats"), chips = $("ask-chips");
  if (cats) {
    cats.innerHTML = ASK_CATS.map(c => `
      <button onclick="askCat('${c.key}')" class="rounded-full border px-2.5 py-1 text-[10.5px] transition ${ASK.cat === c.key ? "border-brand/45 bg-brand/15 text-brand-soft" : "border-line bg-black/20 text-slate-500 hover:border-white/25 hover:text-white"}">
        <span class="mr-0.5 opacity-70">${c.icon}</span>${c.name}
      </button>`).join("");
  }
  if (chips) {
    const list = ASK_SAMPLES[ASK.cat] || ASK_SAMPLES.all;
    chips.innerHTML = list.map(q => `
      <button data-q="${esc(q)}" onclick="askSend(this.dataset.q)" class="max-w-full truncate rounded-lg border border-line bg-black/20 px-2.5 py-1 text-left text-[10.5px] text-slate-400 transition hover:border-mint/35 hover:text-mint">${esc(q)}</button>`).join("");
  }
}
function askCat(k) { ASK.cat = k; askRenderCats(); }
function askRenderTpl() {
  const box = $("ask-templates");
  if (!box) return;
  box.innerHTML = ASK_TPL.map(t => `
    <button data-q="${esc(t.q)}" onclick="askFill(this.dataset.q)" class="flex w-full items-start gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left transition hover:border-line hover:bg-black/25">
      <span class="mt-0.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-slate-400">${t.t}</span>
      <span class="min-w-0 flex-1 text-[10.5px] leading-4 text-slate-500">${esc(t.q)}</span>
    </button>`).join("");
}
function askFill(q) {
  const inp = $("ask-input");
  if (!inp) return;
  inp.value = q;
  inp.style.height = "auto";
  inp.style.height = Math.min(120, inp.scrollHeight) + "px";
  inp.focus();
}
function askWelcome() {
  const thread = $("ask-thread");
  if (!thread) return;
  askBubble("bot", `
    <p class="text-[12.5px] font-semibold text-white">我是小引，先说说这里能问什么</p>
    <ul class="mt-2 space-y-1.5">
      <li>· <b class="text-slate-200">讲清方法</b>：主动回忆、间隔重复、交错练习到底是什么，怎么用，最容易在哪里用错。</li>
      <li>· <b class="text-slate-200">排成计划</b>：给我考试日期和每天可用时间，我按笔记里的排程原则拆阶段。</li>
      <li>· <b class="text-slate-200">指出处</b>：每条要点后面带 [n]，右侧就是对应笔记，点开能核对原段落。</li>
    </ul>
    <p class="mt-3 text-[9.5px] uppercase tracking-[0.14em] text-slate-600">它能做四件事</p>
    <div class="mt-1.5 grid gap-1.5 sm:grid-cols-2">
      <div class="rounded-lg border border-line bg-black/20 px-2.5 py-1.5">
        <p class="text-[11px] font-semibold text-slate-200">概念拆解</p>
        <p class="mt-0.5 text-[10px] leading-4 text-slate-500">一句话定义 + 为什么有效 + 最容易用错的地方</p>
      </div>
      <div class="rounded-lg border border-line bg-black/20 px-2.5 py-1.5">
        <p class="text-[11px] font-semibold text-slate-200">计划排程</p>
        <p class="mt-0.5 text-[10px] leading-4 text-slate-500">按日期与每天可用时间，拆成可执行的阶段</p>
      </div>
      <div class="rounded-lg border border-line bg-black/20 px-2.5 py-1.5">
        <p class="text-[11px] font-semibold text-slate-200">错因诊断</p>
        <p class="mt-0.5 text-[10px] leading-4 text-slate-500">描述你现在的做法，指出哪一步和笔记里的原则冲突</p>
      </div>
      <div class="rounded-lg border border-line bg-black/20 px-2.5 py-1.5">
        <p class="text-[11px] font-semibold text-slate-200">原文核对</p>
        <p class="mt-0.5 text-[10px] leading-4 text-slate-500">每条结论都挂 [n]，点开就是出处段落</p>
      </div>
    </div>
    <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
      <span class="text-[10px] text-slate-600">试一个：</span>
      ${["主动回忆为什么比反复阅读有效？", "距考试两周，每天一小时怎么排？", "笔记记了但不进脑子，问题出在哪？"].map(q =>
        `<button data-q="${esc(q)}" onclick="askSend(this.dataset.q)" class="rounded-lg border border-line bg-black/20 px-2 py-1 text-[10px] text-slate-400 transition hover:border-brand/40 hover:text-brand-soft">${esc(q)}</button>`).join("")}
    </div>
    <p class="mt-2.5 text-[11px] leading-5 text-slate-500">也可以从下面的分类点一个问题，或者直接说「我两周后考试，每天一小时」。</p>
  `);
}
function askRich(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<b class="text-white">$1</b>')
    .replace(/\[(\d+)\]/g, '<button onclick="askFocusRef($1)" class="ml-0.5 align-super text-[9px] text-brand-soft transition hover:text-white">[$1]</button>')
    .split(/\n{2,}/)
    .map(p => `<p class="mt-2 first:mt-0">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
function askPlainify(text) {
  return String(text).replace(/\*\*/g, "").replace(/\[(\d+)\]/g, "[$1]");
}
function askFollowHTML(follow) {
  if (!follow || !follow.length) return "";
  return `<div class="mt-2.5 border-t border-line pt-2.5">
    <p class="text-[9.5px] uppercase tracking-[0.14em] text-slate-600">接着问</p>
    <div class="mt-1.5 flex flex-wrap gap-1.5">
      ${follow.slice(0, 3).map(f => `<button data-q="${esc(f)}" onclick="askSend(this.dataset.q)" class="rounded-lg border border-line bg-black/20 px-2 py-1 text-[10px] text-slate-400 transition hover:border-brand/40 hover:text-brand-soft">${esc(f)}</button>`).join("")}
    </div>
  </div>`;
}
function askAnswerHTML(r) {
  const badge = r.mode === "llm"
    ? `<span class="rounded-full bg-brand/15 px-2 py-0.5 text-[9.5px] font-semibold text-brand-soft">增强模式 · 大模型组织</span>`
    : `<span class="rounded-full bg-mint/15 px-2 py-0.5 text-[9.5px] font-semibold text-mint">离线模式 · 本地摘录</span>`;
  let head = `<div class="flex flex-wrap items-center gap-2">${badge}
    <span class="font-mono text-[9.5px] text-slate-600">${r.ms || 0}ms · 引用 ${(r.refs || []).length} 篇</span></div>`;
  if (r.note) head += `<p class="mt-2 rounded-lg border border-[#f5b64a]/25 bg-[#f5b64a]/[0.07] px-2.5 py-1.5 text-[10.5px] leading-4 text-[#f5b64a]">${esc(r.note)}</p>`;
  if (r.empty) {
    return head + `<p class="mt-2.5 text-[12.5px] leading-6 text-slate-200">${esc(r.lead)}</p>
      <ul class="mt-2 space-y-1.5">${r.points.map(p => `<li class="flex gap-2"><span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-mint"></span><span class="min-w-0 flex-1">${esc(p.text)}</span></li>`).join("")}</ul>
      ${askFollowHTML(r.follow)}`;
  }
  if (r.mode === "llm") {
    return head + `<div class="mt-2.5 text-[12.5px] leading-6 text-slate-300">${askRich(r.raw || "")}</div>` + askFollowHTML(r.follow);
  }
  const pts = r.points.map(p => `<li class="flex gap-2"><span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-mint"></span><span class="min-w-0 flex-1">${esc(p.text)}${p.cite ? `<button onclick="askFocusRef(${p.cite})" class="ml-1 align-super text-[9px] text-brand-soft transition hover:text-white">[${p.cite}]</button>` : ""}</span></li>`).join("");
  const next = r.next.map(s => `<li class="flex gap-1.5"><span class="text-brand-soft">→</span><span class="min-w-0 flex-1">${esc(s)}</span></li>`).join("");
  return `${head}
    <p class="mt-2.5 text-[12.5px] font-medium leading-6 text-slate-100">${esc(r.lead)}</p>
    <ul class="mt-2 space-y-1.5">${pts}</ul>
    <div class="mt-2.5 rounded-xl border border-line bg-white/[0.03] px-3 py-2.5">
      <p class="text-[9.5px] uppercase tracking-[0.14em] text-slate-500">下一步</p>
      <ul class="mt-1.5 space-y-1 text-[11.5px] leading-5 text-slate-400">${next}</ul>
    </div>
    ${askFollowHTML(r.follow)}`;
}
function askTrim(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  // 优先停在句末标点，句子才是完整的；退而求其次在逗号处断开并加省略号
  const end = cut.match(/^[\s\S]*[。；！？]/);
  if (end) return end[0];
  const soft = cut.match(/^[\s\S]*[，、；]/);
  return (soft ? soft[0].replace(/[，、；]$/, "") : cut) + "…";
}
function askSearch(q) {
  // 按 docId 去重：一篇笔记的多个分块只保留分数最高的一条，
  // 否则引用面板会出现同一篇目重复 3-4 次，看起来像「只查到了一篇」。
  const uniq = [];
  const collect = (list, tag) => {
    for (const h of list) {
      if (uniq.some(x => x.docId === h.docId)) continue;
      uniq.push(h);
    }
  };
  collect(answerHits(RAG.search(q, 6), q), q);
  // 去重后不足 3 篇时用核心词补召回，避免答案只依赖单篇笔记而显得单薄
  if (uniq.length < 3) {
    collect(answerHits(RAG.search(q, 8, 0.02), q), q);
  }
  if (uniq.length < 3) {
    const terms = queryTerms(q).filter(t => t.length >= 2).slice(0, 6);
    for (const term of terms) {
      collect(answerHits(RAG.search(term, 4, 0.02), term));
      if (uniq.length >= 4) break;
    }
  }
  // 放宽下限后可能拉进弱相关篇目：只保留与首位同分类、或相似度接近首位的，避免答案跑题
  if (uniq.length > 1) {
    const top = uniq[0];
    const kept = [top];
    for (const h of uniq.slice(1)) {
      if (h.category === top.category || h.score >= top.score * 0.6) kept.push(h);
    }
    // 同分类的篇目提到前面：摘句时优先从「讲同一件事」的笔记里取，
    // 减少第 3、4 条引用带来的跑题段落
    const rank = (h) => (h.category === top.category ? 1 : 0);
    kept.sort((a, b) => (rank(b) - rank(a)) || (b.score - a.score));
    return kept.slice(0, 5);
  }
  return uniq.slice(0, 5);
}
function askPick(text, terms, limit) {
  const sents = splitSentences(text);
  const scored = sents.map((s, idx) => {
    const low = s.toLowerCase();
    let sc = 0;
    for (const term of terms) if (low.includes(term)) sc += 1.05;
    if (/\d+\s*(天|周|分钟|小时|次|张|遍|%)/.test(s)) sc += 1.15;
    if (/^(第[一二三四五六七八九十]，|第[一二三四五六七八九十]、)/.test(s)) sc -= 1.7;
    if (/【/.test(s)) sc -= 2.4;
    if (/[？?]$/.test(s)) sc -= 2.2;
    if (s.length < 24) sc -= 1.2;
    if (/^(应|建议|可以|先|再|每|把|用|避免|记录|需要|如果)/.test(s)) sc += 0.6;
    return { s, idx, sc };
  }).filter(x => x.sc >= 0.7).sort((a, b) => b.sc - a.sc).slice(0, limit);
  // 按原文顺序还原，避免出现「第四…第三…」这种倒序
  return scored.sort((a, b) => a.idx - b.idx).map(x => x.s);
}
function askTerms(q) {
  const base = queryTerms(q).slice();
  const zh = String(q).replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "");
  for (let i = 0; i + 2 <= zh.length && base.length < 24; i++) {
    const t = zh.slice(i, i + 2);
    if (!base.includes(t)) base.push(t);
  }
  return base;
}
function askSection(text, name) {
  const i = text.indexOf("【" + name + "】");
  if (i < 0) return "";
  const rest = text.slice(i + name.length + 2);
  const j = rest.indexOf("【");
  return j < 0 ? rest : rest.slice(0, j);
}
/* 按章节结构取句：先核心概念，再关键结论、操作步骤，最后才看易错点 */
function askFromDoc(doc, terms, want) {
  const names = ["核心概念", "关键结论", "操作步骤与示例", "易错点"];
  const out = [];
  for (const name of names) {
    const sec = askSection(doc.content, name);
    if (!sec) continue;
    askPick(sec, terms, want).forEach(s => { if (out.length < want) out.push(s); });
    if (out.length >= want) break;
  }
  if (!out.length) splitSentences(doc.content).slice(0, want).forEach(s => out.push(s));
  return out;
}
function askLocal(q, hits) {
  const terms = askTerms(q);
  const intent = intentOf(q);
  if (!hits.length) {
    const picks = KNOWLEDGE_DOCS.slice(ASK.seed * 3 % Math.max(1, KNOWLEDGE_DOCS.length - 3)).slice(0, 3);
    return {
      mode: "offline", empty: true, ms: 0,
      lead: `内置笔记里没有和「${q.slice(0, 26)}」足够接近的段落，我不硬编。`,
      points: [
        { text: "换成笔记里的术语再问一次，命中会高很多：主动回忆、间隔重复、交错练习、认知负荷、指导消退、错题归因。" },
        { text: "或者把问题写成「场景 + 目标」：读完一章记不住、只剩 40 分钟、两周后考试，这类问法更容易对上片段。" },
      ],
      next: ["点右侧「顺手看看这几篇」先扫个主题", "到笔记库用关键词直接搜，命中片段会标相似度"],
      follow: ["主动回忆具体怎么操作？", "间隔重复的间隔怎么定？", "考前两周怎么排计划？"],
      refs: picks.map((d, i) => ({ n: i + 1, docId: d.id, title: d.title, category: d.category, score: "—", snippet: d.content.slice(0, 80) })),
      plain: "本次没有可信命中。",
    };
  }
  const tops = hits.slice(0, 4);
  const refs = tops.map((h, i) => ({
    n: i + 1, docId: h.docId, title: h.title, category: h.category,
    score: Number(h.score).toFixed(3), snippet: (h.text || h.snippet || "").slice(0, 90),
  }));
  const leadMap = {
    define: `《${tops[0].title}》对这个问题讲得最直接。`,
    howto: `和这个问题最相关的是《${tops[0].title}》，可以抓住这几点。`,
    compare: `这两件事笔记里是分开讲的，并排看差别更清楚。`,
    plan: `按《${tops[0].title}》里的排程原则，可以照这个顺序来。`,
    trouble: `先判断是哪一环断了，《${tops[0].title}》里对这种情况的处置是这样。`,
    general: `内置笔记里有 ${refs.length} 段和这个问题直接相关，重点如下。`,
  };
  const points = [];
  const seen = new Set();
  const pushPoint = (s, cite) => {
    const clean = String(s)
      .replace(/【[^】]*】/g, "")
      .replace(/^[-·•]\s*/, "")
      .replace(/^\d+[.、]\s*/, "")
      .trim();
    if (clean.length < 14) return;
    if (/^[个的了着时中后前与和及等把被对从向在为以会就才要是，、。；]/.test(clean)) return;
    const k = clean.slice(0, 14);
    if (seen.has(k)) return;
    seen.add(k);
    points.push({ text: askTrim(clean, 140), cite });
  };
  // 第 2 篇之后的引用只收「确实命中问题词」的句子：
  // 否则会从相关但不同主题的笔记里摘出整段结论，答案看起来跑题
  const strict = queryTerms(q).filter(t => t.length >= 2);
  const relevant = (sent, doc) => {
    if (!doc) return true;
    return strict.some(t => sent.includes(t));
  };
  for (let i = 0; i < tops.length && points.length < 6; i++) {
    const doc = KNOWLEDGE_DOCS.find(d => d.id === tops[i].docId);
    const body = tops[i].text || tops[i].snippet || "";
    const keyM = body.match(/【关键结论】([\s\S]*?)(?=【|$)/);
    if (keyM) {
      const sents = splitSentences(keyM[1]).filter(x => i === 0 || relevant(x, doc));
      sents.slice(0, i === 0 ? 3 : 2).forEach(x => { if (points.length < 6) pushPoint(x, i + 1); });
    }
    if (doc) {
      const want = points.length < 3 ? 2 : 1;
      askFromDoc(doc, terms, want)
        .filter(x => i === 0 || relevant(x, doc))
        .forEach(x => { if (points.length < 6) pushPoint(x, i + 1); });
    } else {
      askPick(body, terms, 1).forEach(x => { if (points.length < 6) pushPoint(x, i + 1); });
    }
  }
  // 严格闸门有时只剩 2 条，读起来太单薄：不足 4 条时再补一轮，优先同分类篇目
  if (points.length < 4) {
    for (let i = 1; i < tops.length && points.length < 5; i++) {
      const doc2 = KNOWLEDGE_DOCS.find(d => d.id === tops[i].docId);
      if (!doc2) continue;
      if (tops[i].category !== tops[0].category && points.length >= 3) continue;
      askFromDoc(doc2, terms, 2).forEach(x => { if (points.length < 5) pushPoint(x, i + 1); });
    }
  }
  if (!points.length) points.push({ text: askTrim((tops[0].snippet || "").replace(/【[^】]*】/g, ""), 130), cite: 1 });
  const next = [];
  if (intent === "plan") {
    next.push("把考试日期和每天可用时间补给我，我按这套规则拆成周计划");
    next.push("去「方法与路径」挑一条训练路径，一键写进学习看板");
  } else if (intent === "trouble") {
    next.push("先做一次 20 题闭卷自测，拿到真实基线再谈方法");
    next.push("把错的地方按概念 / 步骤 / 审题 / 计算四类归因");
  } else if (intent === "compare") {
    next.push("先选一个用 7 天，别同时上两套新方法");
    next.push("第 7 天用同一批题对比正确率，再决定留哪个");
  } else {
    next.push(`先按《${tops[0].title}》里的第 1 条要点练 20 分钟，不求量`);
    next.push("练完记一句结果，明天照它调间隔或难度");
  }
  const tags = [];
  tops.forEach(h => (h.tags || []).forEach(t => {
    if (/^[\u4e00-\u9fa5]{2,8}$/.test(t) && !/具体|操作|方法|步骤/.test(t) && !tags.includes(t)) tags.push(t);
  }));
  const follow = tags.slice(0, 3).map(t => `「${t}」具体怎么做？`);
  const fallback = ["这个方法和间隔重复怎么配合？", "我时间很少，最短能做到什么程度？", "最常见的误用是什么？"];
  while (follow.length < 3) follow.push(fallback[follow.length]);
  const plain = [leadMap[intent] || leadMap.general]
    .concat(points.map((p, i) => `${i + 1}. ${p.text} [${p.cite}]`))
    .concat(["下一步：", ...next.map(n => "- " + n)])
    .join("\n");
  return { mode: "offline", lead: leadMap[intent] || leadMap.general, points, next, follow, refs, plain };
}
async function askLLM(q, hits) {
  const tops = hits.slice(0, 4);
  const refs = tops.map((h, i) => ({
    n: i + 1, docId: h.docId, title: h.title, category: h.category,
    score: Number(h.score).toFixed(3), snippet: (h.text || h.snippet || "").slice(0, 90),
  }));
  const ctx = tops.map((h, i) => `[${i + 1}] 《${h.title}》（${h.category}）\n${h.text || h.snippet || ""}`).join("\n\n");
  const sys = [
    "你是「引航」的学习方法问答助手小引。只能用给定的内置笔记片段作为事实依据，用中文回答。",
    "回答结构：先用一句话给结论；再给 3–5 条可执行要点，每条末尾用 [n] 标注依据片段编号；最后给 2 条下一步动作。",
    "不要编造片段里没有的数字、作者、年份或结论。片段不足以回答时，直接说「内置笔记没有覆盖到这里」，并给出更可能命中的问法。",
    "语气克制、具体，不说教，不写空话。总长度控制在 400 字以内。",
    "",
    "# 内置笔记片段",
    ctx || "（本次没有可信命中，只能说明未覆盖）",
  ].join("\n");
  const msgs = [{ role: "system", content: sys }].concat(ASK.history.slice(-4), [{ role: "user", content: q }]);
  const out = await dsChatJSON({ messages: msgs, temperature: 0.35, maxTokens: 900 });
  const content = (out.content || "").trim();
  if (!content) throw new Error("模型返回为空");
  ASK.history.push({ role: "user", content: q }, { role: "assistant", content: content.slice(0, 600) });
  return {
    mode: "llm", raw: content, refs,
    follow: ["能用一句话再解释一下吗？", "具体到每天怎么安排？", "这个方法最常见的误用是什么？"],
    plain: askPlainify(content),
  };
}
async function askSend(preset) {
  if (ASK.busy) return;
  const inp = $("ask-input");
  const q = (typeof preset === "string" && preset ? preset : (inp ? inp.value : "")).trim();
  if (!q) { if (inp) inp.focus(); return; }
  const check = inspectInput(q);
  if (!check.ok) { askBubble("bot", `<p class="text-[12px] text-red-300">${esc(check.reason)}</p>`); return; }
  if (inp) { inp.value = ""; inp.style.height = "auto"; }
  askBubble("user", esc(q));
  ASK.busy = true;
  const btn = $("ask-btn");
  if (btn) { btn.disabled = true; btn.textContent = "思考中"; }
  const holder = askBubble("bot", askThinking());
  const t0 = performance.now();
  let res;
  try {
    const hits = askSearch(ASK.lastQ ? ASK.lastQ + " " + q : q);
    if (getKey()) {
      try { res = await askLLM(q, hits); }
      catch (err) {
        res = askLocal(q, hits);
        res.note = "大模型调用失败（" + String(err && err.message || err) + "），已自动改用本地摘录回答，功能不受影响。";
      }
    } else {
      res = askLocal(q, hits);
    }
    res.ms = Math.max(1, Math.round(performance.now() - t0));
    if (holder) holder.innerHTML = askAnswerHTML(res);
    ASK.count += 1;
    ASK.hitsTotal += (res.refs || []).length;
    ASK.lastQ = q;
    ASK.lastAnswer = res.plain || "";
    ASK.refs = res.refs || [];
    askRenderRefs(ASK.refs);
    askRelated(ASK.refs.map(r => r.docId));
    askStat();
    askScroll();
  } catch (err) {
    if (holder) holder.innerHTML = `<p class="text-[12px] text-red-300">出错了：${esc(String(err && err.message || err))}</p>`;
  } finally {
    ASK.busy = false;
    if (btn) { btn.disabled = false; btn.textContent = "提问"; }
  }
}
function askRenderRefs(refs) {
  const box = $("ask-sources"), cnt = $("ask-ref-count");
  if (cnt) cnt.textContent = (refs || []).length + " 条";
  if (!box) return;
  box.innerHTML = (refs && refs.length) ? refs.map(r => `
    <button data-ref="${r.n}" onclick="libJump('${r.docId}')" class="ask-ref w-full rounded-lg border border-line bg-black/20 p-2.5 text-left transition hover:border-brand/40">
      <span class="flex items-start gap-1.5">
        <span class="mt-0.5 rounded bg-brand/15 px-1.5 py-0.5 font-mono text-[9px] text-brand-soft">[${r.n}]</span>
        <span class="min-w-0 flex-1 text-[11px] font-medium leading-4 text-slate-200">${esc(r.title)}</span>
      </span>
      <span class="mt-1 block pl-0.5 text-[9.5px] text-slate-600">${esc(r.category)} · 相似度 ${r.score}</span>
    </button>`).join("")
    : `<p class="rounded-lg border border-dashed border-line px-3 py-6 text-center text-[10.5px] leading-4 text-slate-600">还没提问。回答里的 [1] [2] 就是这里对应的笔记，点开可核对原段落。</p>`;
}
function askFocusRef(n) {
  const box = $("ask-sources");
  if (!box) return;
  box.querySelectorAll(".ask-ref").forEach(el => {
    const on = el.dataset.ref === String(n);
    el.classList.toggle("border-brand/60", on);
    el.classList.toggle("bg-brand/[0.08]", on);
    if (on) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}
function askRelated(docIds) {
  const box = $("ask-related");
  if (!box) return;
  const used = new Set(docIds || []);
  const cats = new Set((docIds || []).map(id => { const d = KNOWLEDGE_DOCS.find(x => x.id === id); return d ? d.category : ""; }));
  let pool = KNOWLEDGE_DOCS.filter(d => !used.has(d.id));
  const same = pool.filter(d => cats.has(d.category));
  const rest = pool.filter(d => !cats.has(d.category));
  const rotate = (arr) => arr.slice(ASK.seed % Math.max(1, arr.length)).concat(arr.slice(0, ASK.seed % Math.max(1, arr.length)));
  const pick = same.slice(0, 2).concat(rotate(rest).slice(0, 2)).slice(0, 3);
  const spare = KNOWLEDGE_DOCS.filter(d => !pick.some(p => p.id === d.id));
  while (pick.length < 3 && spare.length) pick.push(spare.shift());
  box.innerHTML = pick.map(d => `
    <button onclick="libJump('${d.id}')" class="flex w-full items-start gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left transition hover:border-line hover:bg-black/25">
      <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-soft"></span>
      <span class="min-w-0 flex-1">
        <span class="block text-[11px] leading-4 text-slate-300">${esc(d.title)}</span>
        <span class="mt-0.5 block text-[9.5px] text-slate-600">${esc(d.category)} · ${d.content.length} 字</span>
      </span>
    </button>`).join("");
}
function askShuffle() {
  ASK.seed = (ASK.seed + 1) % Math.max(1, KNOWLEDGE_DOCS.length);
  askRelated(ASK.refs.map(r => r.docId));
}
function askClear() {
  const thread = $("ask-thread");
  if (thread) thread.innerHTML = "";
  ASK.lastQ = ""; ASK.lastAnswer = ""; ASK.refs = []; ASK.history = [];
  askWelcome();
  askRenderRefs([]);
  askRelated([]);
}
function askCopy() {
  if (!ASK.lastAnswer) { askToast("还没有可复制的回答"); return; }
  const txt = ASK.lastAnswer;
  askToast("已复制最近一条回答");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).catch(() => {});
  } else {
    const ta = document.createElement("textarea");
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); askToast("已复制最近一条回答"); } catch (e) { askToast("复制失败"); }
    document.body.removeChild(ta);
  }
}
function askInit() {
  if (!$("ask-thread")) return;
  askRenderCats();
  askRenderTpl();
  askRenderRefs([]);
  askRelated([]);
  askWelcome();
  askMode();
  askStat();
  const inp = $("ask-input");
  if (inp) {
    inp.addEventListener("input", () => {
      inp.style.height = "auto";
      inp.style.height = Math.min(120, inp.scrollHeight) + "px";
    });
    inp.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askSend(); }
    });
  }
}
if ($("ask-thread")) askInit();
