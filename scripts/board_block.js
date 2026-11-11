/* ================= 学习看板 v2（覆盖旧的同名渲染函数） ================= */
let BOARD_FILTER = "open";

function dayKey(d) {
  const x = d || new Date();
  return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
}
function touchActiveDay() {
  const k = dayKey();
  const days = LS.get("activeDays", []);
  if (!days.includes(k)) {
    days.push(k);
    LS.set("activeDays", days.slice(-180));
  }
}
function streakDays() {
  const days = new Set(LS.get("activeDays", []));
  let n = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function ringHTML(pct, size, stroke, color) {
  const p = Math.max(0, Math.min(100, Number(pct) || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - p / 100);
  return `<svg viewBox="0 0 ${size} ${size}" class="h-full w-full">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="${stroke}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
      stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
  </svg>`;
}
function dueTodayCount() {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const s = base.getTime(), e = s + 86400000;
  let n = 0;
  state.todos.forEach(t => {
    if (t.done) return;
    [1, 3, 7].forEach(o => {
      const due = t.createdAt + o * 86400000;
      if (due >= s && due < e) n++;
    });
  });
  return n;
}
function setBoardFilter(f) { BOARD_FILTER = f; renderBoard(); }

function renderBoardFilter() {
  const box = $("board-filter");
  if (!box) return;
  const items = [
    { k: "open", label: "未完成", n: state.todos.filter(t => !t.done).length },
    { k: "done", label: "已完成", n: state.todos.filter(t => t.done).length },
    { k: "all", label: "全部", n: state.todos.length },
  ];
  box.innerHTML = items.map(x => `
    <button onclick="setBoardFilter('${x.k}')" class="rounded-lg border px-2.5 py-1 text-[10.5px] transition ${BOARD_FILTER === x.k ? "border-brand/45 bg-brand/15 text-brand-soft" : "border-line bg-black/20 text-slate-500 hover:border-white/25 hover:text-white"}">
      ${x.label} <span class="ml-0.5 font-mono text-[9.5px] opacity-75">${x.n}</span>
    </button>`).join("");
}


function seedDemoData() {
  const now = Date.now(), day = 86400000;
  if (!state.todos.length && !state.notes.length && !state.memory.length) {
    state.todos = [
      { id: uid("todo"), title: "闭卷默写第 4 章 5 条要点", due: "", priority: "high", done: false, createdAt: now - 3 * day },
      { id: uid("todo"), title: "清掉今天到期的 12 张复习卡片", due: "", priority: "medium", done: false, createdAt: now - 1 * day },
      { id: uid("todo"), title: "限时做一套真题（90 分钟）", due: "", priority: "high", done: false, createdAt: now - 2 * day },
      { id: uid("todo"), title: "把 3 处错漏写进错题本", due: "", priority: "medium", done: false, createdAt: now - 5 * day },
      { id: uid("todo"), title: "读一篇还没读过的笔记", due: "", priority: "low", done: true, createdAt: now - 4 * day },
      { id: uid("todo"), title: "整理本周的复习排程", due: "", priority: "low", done: true, createdAt: now - 6 * day },
    ];
    state.notes = [
      { id: uid("note"), title: "主动回忆的关键", content: "合上材料再提取，答不出的才是真正要复习的。", createdAt: now - 2 * day },
      { id: uid("note"), title: "这周唯一有效的调整", content: "把晚上的重读换成 20 分钟闭卷自测，正确率从 46% 到 71%。", createdAt: now - day },
      { id: uid("note"), title: "关于交错练习", content: "同一章节的题混着做，当下更难受，但考试时判别更快。", createdAt: now - 3 * day },
    ];
    state.memory = [
      { text: "两周后期末考，每天可用 90 分钟" },
      { text: "目标是把复习从重读改成闭卷自测" },
      { text: "晚上 8 点后不碰咖啡" },
    ];
  }
  const read = new Set(LS.get("readDocs", []));
  KNOWLEDGE_DOCS.slice(0, 11).forEach(d => read.add(d.id));
  LS.set("readDocs", Array.from(read));
  const c = checksState();
  ["c1", "c2", "c4", "c6"].forEach(k => { c.items[k] = true; });
  LS.set("checks", c);
  const days = LS.get("activeDays", []);
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    if (!days.includes(k)) days.push(k);
  }
  LS.set("activeDays", days);
  persist();
  renderBoard();
  askToast("已载入示例数据，点「清空本地数据」可还原");
}

function renderBoardHero() {
  const box = $("board-hero");
  if (!box) return;
  const now = new Date();
  const wd = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][now.getDay()];
  const hh = now.getHours();
  const greet = hh < 6 ? "还醒着" : hh < 11 ? "早上好" : hh < 14 ? "中午好" : hh < 19 ? "下午好" : "晚上好";
  const done = state.todos.filter(t => t.done).length;
  const total = state.todos.length;
  const rate = total ? Math.round((done / total) * 100) : 0;
  const todayDue = dueTodayCount();
  const chk = checkDone();
  const streak = streakDays();
  const sub = todayDue
    ? `今天有 ${todayDue} 条复习到期，先清掉它们，再考虑加新内容。`
    : total
      ? `今天没有到期的复习。可以做一次 20 分钟闭卷自测，或从笔记库挑一篇没读过的。`
      : `还没有学习任务。先去「方法与路径」挑一条路径，或者在这里直接加一条。`;
  box.innerHTML = `
    <div class="panel relative overflow-hidden p-5 sm:p-6">
      <div class="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-brand/15 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-mint/10 blur-3xl"></div>
      <div class="relative flex flex-wrap items-center justify-between gap-6">
        <div class="min-w-0">
          <p class="font-mono text-[10.5px] uppercase tracking-[0.2em] text-slate-500">TODAY · ${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${wd}</p>
          <p class="mt-1.5 text-[20px] font-bold leading-snug text-white sm:text-[23px]">${greet}，${todayDue ? `先把到期的 ${todayDue} 条复习清掉` : "今天从一件小事开始"}</p>
          <p class="mt-1.5 max-w-xl text-[11.5px] leading-5 text-slate-500">${sub}</p>
          ${(!state.todos.length && !state.notes.length && !state.memory.length)
            ? `<button onclick="seedDemoData()" class="btn-ghost mt-3 !px-3 !py-1.5 !text-[11px]">载入示例数据，先看看满的样子</button>`
            : ""}
        </div>
        <div class="flex flex-wrap items-center gap-4 sm:gap-5">
          <div class="text-center">
            <p class="text-[20px] font-bold leading-none text-mint">${streak}</p>
            <p class="mt-1.5 text-[9.5px] text-slate-500">连续天数</p>
          </div>
          <div class="text-center">
            <p class="text-[20px] font-bold leading-none text-[#f5b64a]">${todayDue}</p>
            <p class="mt-1.5 text-[9.5px] text-slate-500">今日到期</p>
          </div>
          <div class="text-center">
            <p class="text-[20px] font-bold leading-none text-brand-soft">${chk}<span class="text-[11px] font-normal text-slate-600">/6</span></p>
            <p class="mt-1.5 text-[9.5px] text-slate-500">本周清单</p>
          </div>
          <div class="relative h-[74px] w-[74px]">
            ${ringHTML(rate, 74, 7, "#00f2ea")}
            <span class="absolute inset-0 grid place-items-center">
              <span class="text-[13px] font-bold text-white">${rate}%</span>
            </span>
          </div>
        </div>
      </div>
    </div>`;
}

function renderBoardMetrics() {
  const box = $("board-metrics");
  if (!box) return;
  const open = state.todos.filter(t => !t.done).length;
  const read = LS.get("readDocs", []).length;
  const chk = checkDone();
  const items = [
    { label: "待完成学习任务", value: open, pct: state.todos.length ? Math.round((open / state.todos.length) * 100) : 0, color: "#f5b64a", tip: "先清一条" },
    { label: "已存学习笔记", value: state.notes.length, pct: Math.min(100, state.notes.length * 10), color: "#7c8cff", tip: "学完写一句" },
    { label: "笔记已读 / 总篇", value: read + " / " + KNOWLEDGE_DOCS.length, pct: Math.round((read / KNOWLEDGE_DOCS.length) * 100), color: "#00f2ea", tip: "点开即算读" },
    { label: "本周清单完成", value: chk + " / " + CHECKS.length, pct: Math.round((chk / CHECKS.length) * 100), color: "#63e6be", tip: "周一归零" },
  ];
  box.innerHTML = items.map(s => `
    <div class="panel group p-4 transition hover:border-white/20">
      <div class="flex items-baseline justify-between gap-2">
        <p class="text-[17px] font-bold leading-none text-white">${s.value}</p>
        <span class="shrink-0 text-[9px] text-slate-600">${s.tip}</span>
      </div>
      <p class="mt-1.5 text-[10.5px] text-slate-500">${s.label}</p>
      <div class="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
        <div class="h-full rounded-full" style="width:${Math.max(2, s.pct)}%;background:${s.color}"></div>
      </div>
    </div>`).join("");
}

function renderBoardLoad() {
  const box = $("board-load");
  if (!box) return;
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(base); d.setDate(d.getDate() + i); return d; });
  const vals = days.map(d => {
    const s = d.getTime(), e = s + 86400000;
    let n = 0;
    state.todos.forEach(t => {
      if (t.done) return;
      [1, 3, 7].forEach(o => {
        const due = t.createdAt + o * 86400000;
        if (due >= s && due < e) n++;
      });
    });
    return n;
  });
  const total = vals.reduce((a, b) => a + b, 0);
  if (!total) {
    box.innerHTML = `
      <div class="rounded-xl border border-dashed border-line px-4 py-8 text-center">
        <p class="text-[11.5px] text-slate-500">还没有学习任务，负荷图暂时是空的</p>
        <p class="mt-1 text-[10px] leading-4 text-slate-600">排几条任务，或在「方法与路径」里把一条路径写进看板，这里会推算未来 7 天哪天要复习</p>
        <button onclick="gotoRoute('features')" class="btn-ghost mt-3 !px-3 !py-1.5 !text-[11px]">去挑一条路径</button>
      </div>`;
    return;
  }
  const max = Math.max.apply(null, vals.concat([1]));
  const peak = vals.indexOf(max);
  box.innerHTML = `
    <div class="flex items-end gap-2 sm:gap-3">
      ${vals.map((v, i) => `
        <div class="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <span class="font-mono text-[10px] ${v ? "text-mint" : "text-slate-700"}">${v || "·"}</span>
          <div class="relative flex h-28 w-full items-end overflow-hidden rounded-lg bg-black/25">
            <div class="w-full rounded-lg bg-gradient-to-t from-brand/60 to-mint/80" style="height:${Math.max(6, Math.round((v / max) * 100))}%;opacity:${v ? 1 : 0.12}"></div>
            ${i === 0 ? `<span class="absolute inset-x-0 top-0 h-0.5 bg-mint/60"></span>` : ""}
          </div>
          <span class="text-[9.5px] ${i === 0 ? "text-mint" : "text-slate-600"}">${i === 0 ? "今天" : (days[i].getMonth() + 1) + "/" + days[i].getDate()}</span>
        </div>`).join("")}
    </div>
    <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-2.5 text-[10px] text-slate-600">
      <span>7 天合计 <b class="text-slate-400">${total}</b> 次复习</span>
      <span>峰值 <b class="text-[#f5b64a]">${max} 条</b>（${peak === 0 ? "今天" : (days[peak].getMonth() + 1) + "/" + days[peak].getDate()}）</span>
      <span>只统计未完成任务</span>
    </div>`;
}

function renderBoardCoverage() {
  const box = $("board-coverage");
  if (!box) return;
  const read = new Set(LS.get("readDocs", []));
  const cats = KB_CATEGORIES();
  box.innerHTML = cats.map(c => {
    const docs = KNOWLEDGE_DOCS.filter(d => d.category === c.name);
    const n = docs.filter(d => read.has(d.id)).length;
    const pct = Math.round((n / docs.length) * 100);
    return `<div>
      <div class="flex items-center justify-between gap-2 text-[10.5px]">
        <span class="truncate text-slate-300">${esc(c.name)}</span>
        <span class="shrink-0 font-mono ${pct ? "text-mint" : "text-slate-600"}">${n}/${docs.length}</span>
      </div>
      <div class="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
        <div class="h-full rounded-full bg-gradient-to-r from-brand to-mint" style="width:${pct}%"></div>
      </div>
    </div>`;
  }).join("");
}

function renderBoardCheck() {
  const box = $("board-check");
  if (!box) return;
  const c = checksState();
  box.innerHTML = CHECKS.map(x => `
    <label class="flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2 transition ${c.items[x.id] ? "border-mint/40 bg-mint/[0.06]" : "border-line bg-black/15 hover:border-white/20"}">
      <input type="checkbox" ${c.items[x.id] ? "checked" : ""} onchange="toggleCheck('${x.id}')" class="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#00f2ea]" />
      <span class="text-[11px] leading-4 ${c.items[x.id] ? "text-slate-500 line-through" : "text-slate-300"}">${esc(x.text)}</span>
    </label>`).join("");
  const n = checkDone();
  const el = $("board-check-count");
  if (el) el.textContent = n + " / " + CHECKS.length + (n === CHECKS.length ? " · 本周满分" : "");
}

function renderBoardRings() {
  const read = new Set(LS.get("readDocs", []));
  const pct = KNOWLEDGE_DOCS.length ? Math.round((read.size / KNOWLEDGE_DOCS.length) * 100) : 0;
  const cr = $("board-cover-ring");
  if (cr) cr.innerHTML = ringHTML(pct, 92, 8, "#00f2ea") + `<span class="absolute inset-0 grid place-items-center"><span class="text-[14px] font-bold text-white">${pct}%</span></span>`;
  const cp = $("board-cover-pct");
  if (cp) cp.textContent = `已读 ${read.size} / ${KNOWLEDGE_DOCS.length} 篇`;
  const chk = checkDone();
  const ck = $("board-check-ring");
  if (ck) ck.innerHTML = ringHTML((chk / CHECKS.length) * 100, 92, 8, "#63e6be") + `<span class="absolute inset-0 grid place-items-center"><span class="text-[13px] font-bold text-white">${chk}/${CHECKS.length}</span></span>`;
}

const BOARD_BADGES = [
  { icon: "🔥", name: "连练三天", desc: "连续 3 天有学习动作", need: 3, get: function () { return streakDays(); } },
  { icon: "⚡", name: "一周不断", desc: "连续 7 天有学习动作", need: 7, get: function () { return streakDays(); } },
  { icon: "📖", name: "读了十篇", desc: "在笔记库点开 10 篇", need: 10, get: function () { return LS.get("readDocs", []).length; } },
  { icon: "🧭", name: "读了三十篇", desc: "在笔记库点开 30 篇", need: 30, get: function () { return LS.get("readDocs", []).length; } },
  { icon: "✅", name: "清掉十件", desc: "完成 10 条学习任务", need: 10, get: function () { return state.todos.filter(t => t.done).length; } },
  { icon: "🏅", name: "本周满分", desc: "一周六个动作全做到", need: 6, get: function () { return checkDone(); } },
];
function renderBoardBadges() {
  const box = $("board-badges");
  if (!box) return;
  const rows = BOARD_BADGES.map(b => {
    const v = b.get();
    return { icon: b.icon, name: b.name, desc: b.desc, need: b.need, v: v, ok: v >= b.need, pct: Math.min(100, Math.round((v / b.need) * 100)) };
  });
  box.innerHTML = rows.map(b => `
    <div class="flex items-center gap-3 rounded-xl border px-3 py-2.5 ${b.ok ? "border-mint/30 bg-mint/[0.06]" : "border-line bg-black/15"}">
      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[16px] ${b.ok ? "bg-mint/15" : "bg-white/[0.05] opacity-60"}">${b.icon}</span>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5">
          <p class="truncate text-[11.5px] font-medium ${b.ok ? "text-white" : "text-slate-400"}">${b.name}</p>
          ${b.ok ? `<span class="shrink-0 rounded bg-mint/20 px-1 py-0.5 text-[8.5px] text-mint">已达成</span>` : ""}
        </div>
        <p class="mt-0.5 truncate text-[9.5px] text-slate-600">${b.desc}</p>
        <div class="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
          <div class="h-full rounded-full ${b.ok ? "bg-mint" : "bg-slate-600"}" style="width:${b.pct}%"></div>
        </div>
      </div>
      <span class="shrink-0 font-mono text-[10px] ${b.ok ? "text-mint" : "text-slate-600"}">${Math.min(b.v, b.need)}/${b.need}</span>
    </div>`).join("");
  const cnt = $("board-badge-count");
  if (cnt) cnt.textContent = `已达成 ${rows.filter(r => r.ok).length} / ${rows.length}`;
}

function renderBoard() {
  touchActiveDay();
  const done = state.todos.filter(t => t.done).length;
  const total = state.todos.length;
  const stats = [
    { icon: "◎", label: "笔记检索耗时", value: RAG_MS ? RAG_MS + "ms" : "—", cls: "text-glow", hint: "本机实测" },
    { icon: "◫", label: "索引分块", value: RAG.stats.chunks, cls: "text-glow", hint: KNOWLEDGE_DOCS.length + " 篇笔记" },
    { icon: "⚙", label: "本次练习工具调用", value: state.toolsRun.length, cls: "text-brand-soft", hint: "工作台累计" },
    { icon: "✓", label: "任务完成率", value: total ? Math.round((done / total) * 100) + "%" : "—", cls: "text-mint", hint: done + " / " + total + " 条" },
  ];
  $("board-stats").innerHTML = stats.map(s => `
    <div class="panel relative overflow-hidden p-4">
      <div class="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/[0.03] blur-xl"></div>
      <div class="flex items-start justify-between gap-2">
        <span class="grid h-8 w-8 place-items-center rounded-lg border border-line bg-black/25 text-[13px] ${s.cls}">${s.icon}</span>
        <span class="shrink-0 text-[9.5px] text-slate-600">${s.hint}</span>
      </div>
      <p class="mt-2.5 text-[21px] font-bold leading-none ${s.cls}">${s.value}</p>
      <p class="mt-1.5 text-[10.5px] text-slate-500">${s.label}</p>
    </div>`).join("");

  const list = state.todos.filter(t => BOARD_FILTER === "all" ? true : BOARD_FILTER === "done" ? t.done : !t.done);
  $("board-todos").innerHTML = list.length ? list.map(t => `
    <li class="flex items-center gap-2.5 rounded-xl border border-line bg-black/15 px-3 py-2.5 transition hover:border-white/20 ${t.done ? "opacity-65" : ""}">
      <span class="h-6 w-[3px] shrink-0 rounded-full ${t.done ? "bg-mint/40" : t.priority === "high" ? "bg-[#ff6b6b]/70" : t.priority === "low" ? "bg-slate-600" : "bg-[#f5b64a]/70"}"></span>
      <span class="todo-check ${t.done ? "done" : ""}" onclick="toggleTodoDone('${t.id}')" title="点击切换完成状态">${t.done ? "✓" : ""}</span>
      <span class="min-w-0 flex-1 truncate text-[12px] ${t.done ? "text-slate-500 line-through" : "text-slate-200"}">${esc(t.title)}</span>
      ${prioBadge(t.priority)}
      <button onclick="deleteTodo('${t.id}')" class="p-1 text-slate-600 transition hover:text-red-400" title="删除">
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
      </button>
    </li>`).join("") : `
    <li class="rounded-xl border border-dashed border-line px-4 py-8 text-center">
      <p class="text-[11.5px] text-slate-500">${BOARD_FILTER === "done" ? "还没有完成的任务" : BOARD_FILTER === "all" ? "还没有任何学习任务" : "没有待完成的任务，今天的复习清空了"}</p>
      <button onclick="gotoRoute('features')" class="btn-ghost mt-2.5 !px-3 !py-1.5 !text-[11px]">去「方法与路径」挑一条</button>
    </li>`;

  $("board-notes").innerHTML = state.notes.length ? state.notes.map(n => `
    <li class="rounded-xl border border-line bg-black/15 px-3.5 py-2.5">
      <div class="flex items-center gap-2">
        <span class="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-200">${esc(n.title)}</span>
        <span class="font-mono text-[10.5px] text-slate-600">${new Date(n.createdAt).toLocaleDateString("zh-CN")}</span>
        <button onclick="deleteNote('${n.id}')" class="p-1 text-slate-600 transition hover:text-red-400" title="删除">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
        </button>
      </div>
      <p class="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">${esc(n.content)}</p>
    </li>`).join("") : `
    <li class="rounded-xl border border-dashed border-line px-4 py-8 text-center">
      <p class="text-[11.5px] text-slate-500">还没有学习笔记</p>
      <p class="mt-1 text-[10px] text-slate-600">在工作台说「把这条记到笔记里」，或直接点下面的按钮</p>
      <button onclick="gotoWorkspace()" class="btn-ghost mt-2.5 !px-3 !py-1.5 !text-[11px]">去工作台</button>
    </li>`;

  $("board-memory").innerHTML = state.memory.length ? state.memory.map(m => `
    <span class="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand/[0.07] px-3 py-1.5 text-[11px] text-brand-soft">
      🧠 ${esc(m.text)}
      <button class="memory-remove text-slate-500 transition hover:text-red-400" data-m="${esc(m.text)}">×</button>
    </span>`).join("") : `<span class="text-[11px] text-slate-600">暂无记忆 — 告诉引航你的专业、目标或习惯，它会自动记住</span>`;
  document.querySelectorAll(".memory-remove").forEach(b => b.onclick = () => removeMemory(b.dataset.m));

  renderCurve();
  renderBoardHero();
  renderBoardMetrics();
  renderBoardFilter();
  renderBoardLoad();
  renderBoardCoverage();
  renderBoardRings();
  renderBoardCheck();
  renderBoardBadges();
}

/* 曲线重绘：网格 + 对齐刻度 + 今天高亮，替代原来的纯折线 */
function renderCurve() {
  const box = $("board-curve");
  if (!box) return;
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(base); d.setDate(d.getDate() - i); days.push(d); }
  const vals = days.map(d => {
    const s = d.getTime(), e = s + 86400000;
    return state.todos.filter(t => t.createdAt >= s && t.createdAt < e).length
         + state.notes.filter(n => n.createdAt >= s && n.createdAt < e).length;
  });
  const total = vals.reduce((a, b) => a + b, 0);
  if (!total) {
    box.innerHTML = `<div class="rounded-xl border border-dashed border-line px-4 py-9 text-center">
      <p class="text-[11.5px] text-slate-500">近 7 天还没有数据</p>
      <p class="mt-1 text-[10px] text-slate-600">在工作台排几条复习任务，或在笔记里记一条，这里会画出曲线</p>
    </div>`;
    return;
  }
  const W = 560, H = 118, padL = 18, padR = 18, padT = 14, padB = 26;
  const max = Math.max.apply(null, vals.concat([1]));
  const stepX = (W - padL - padR) / (vals.length - 1);
  const yOf = v => H - padB - (v / max) * (H - padT - padB);
  const pts = vals.map((v, i) => [padL + i * stepX, yOf(v)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - padB} L${pts[0][0].toFixed(1)},${H - padB} Z`;
  const grid = [0, 0.5, 1].map(r => {
    const y = (H - padB - r * (H - padT - padB)).toFixed(1);
    return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(148,163,184,0.12)" stroke-width="1" stroke-dasharray="3 4"/>`;
  }).join("");
  const labels = days.map((d, i) => {
    const last = i === days.length - 1;
    return `<text x="${(padL + i * stepX).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="9" fill="${last ? "#00f2ea" : "#64748b"}">${d.getMonth() + 1}/${d.getDate()}</text>`;
  }).join("");
  box.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" style="height:118px" class="w-full">
      <defs>
        <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00f2ea" stop-opacity=".28"/>
          <stop offset="100%" stop-color="#00f2ea" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${grid}
      <path d="${area}" fill="url(#curveFill)"/>
      <path d="${line}" fill="none" stroke="#00f2ea" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      ${pts.map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i === pts.length - 1 ? 3.2 : 2.2}" fill="#00f2ea"${i === pts.length - 1 ? ' stroke="#070b16" stroke-width="1.4"' : ""}/>`).join("")}
      ${labels}
    </svg>
    <div class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-2 text-[10px] text-slate-600">
      <span>7 天新增 <b class="text-slate-400">${total}</b> 条（任务 + 笔记）</span>
      <span>峰值 <b class="text-[#f5b64a]">${max}</b> 条</span>
      <span class="text-slate-700">曲线只反映新增量，不代表掌握程度</span>
    </div>`;
}
