import type {
  AgentStreamEvent,
  ApprovalRequest,
  Citation,
  PlanStep,
  ToolTrace,
  TraceItem,
} from "@/types/agent";
import { searchKnowledge, type KnowledgeHit } from "@/lib/rag/knowledge";
import { executeTool, getTool } from "./tools";

/**
 * 离线 Agent 引擎（无需任何 API Key）
 *
 * 与静态版 index.html 的本地引擎保持同一套能力：意图感知规划 → 规则预测工具 →
 * 只读工具直接执行 / 写操作走人工审批 → 本地 RAG 抽取式作答 → 分块流式推送 → done。
 * 所有事件沿用 AgentStreamEvent 协议，前端无需为离线模式做任何分支处理。
 */

export interface GuestRunContext {
  goal: string;
  memory: string[];
  requireApproval: boolean;
  send: (event: AgentStreamEvent) => void;
  trace: (item: Omit<TraceItem, "id" | "at">) => void;
  waitApproval: (id: string, signal: AbortSignal) => Promise<boolean>;
  signal: AbortSignal;
  uid: (prefix: string) => string;
}

const STOP_TERMS = new Set([
  "如何", "怎么", "怎样", "什么", "哪些", "为什么", "可以", "可能", "应该", "需要",
  "一个", "这个", "那个", "我们", "你们", "以及", "进行", "通过", "因为", "所以",
  "但是", "而且", "如果", "就是", "不是", "没有", "还是", "能够", "帮你", "一下",
  "使用", "时候", "问题", "这样", "具体", "直接", "主要", "相关", "内容", "方面",
]);

function queryTerms(q: string): string[] {
  const normalized = q.toLowerCase().replace(/[^\u4e00-\u9fffA-Za-z0-9]+/g, " ");
  const terms: string[] = [];
  for (const part of normalized.split(/\s+/)) {
    if (!part) continue;
    if (/^[\u4e00-\u9fff]+$/.test(part)) {
      for (let i = 0; i < part.length - 1; i += 1) {
        const bigram = part.slice(i, i + 2);
        if (!STOP_TERMS.has(bigram)) terms.push(bigram);
      }
    } else if (part.length >= 2 && !STOP_TERMS.has(part)) terms.push(part);
  }
  return Array.from(new Set(terms)).slice(0, 24);
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .replace(/([。；！？])/g, "$1§")
    .split("§")
    .map((s) => s.trim())
    .filter((s) => s.length >= 14 && s.length <= 240);
}

function pickSentences(text: string, terms: string[], limit: number): string[] {
  return splitSentences(text)
    .map((s) => {
      const low = s.toLowerCase();
      const matched = new Set<string>();
      let score = 0;
      for (const t of terms) {
        if (low.includes(t)) {
          matched.add(t);
          if (/^\d+$/.test(t)) score += 2.2;
        }
      }
      score += matched.size * 1.15;
      if (/^[a-z]{2,}\s+[A-Z]/.test(s)) score -= 3.2;
      if (s.length < 26) score -= 2.6;
      if (s.length > 40 && s.length < 190) score += 0.8;
      if (/[；;]/.test(s) && s.length < 70) score -= 1.0;
      if (/(应|建议|可以|先|再|每|把|用|避免|记录|检查|需要|例如|常见|核心|关键|步骤|方法|通过|设置|保持|完成|控制|定义|指|分为|原因|解决)/.test(s)) score += 1.0;
      score -= Math.max(0, s.length - 170) / 90;
      return { s, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter((x) => x.score >= 1.2)
    .map((x) => x.s);
}

function intentOf(goal: string): "define" | "howto" | "compare" | "trouble" | "plan" | "general" {
  if (/(报错|错误|失败|401|402|429|500|503|异常|排查|卡住|记不住|学不会|走神|拖延|坚持不下去|没效果|效率低)/i.test(goal)) return "trouble";
  if (/(区别|对比|不同|差异|vs|versus|优缺点)/i.test(goal)) return "compare";
  if (/(怎么|如何|怎样|方法|步骤|技巧|用法|实践)/i.test(goal)) return "howto";
  if (/(计划|安排|清单|排期|日程|复习|备考|冲刺|规划)/i.test(goal)) return "plan";
  if (/(是什么|什么是|定义|概念|含义|指什么|介绍)/i.test(goal)) return "define";
  return "general";
}

function answerHits(hits: KnowledgeHit[], goal: string): KnowledgeHit[] {
  const core = queryTerms(goal).filter((t) => t.length >= 2);
  const brief = /术语|速查|对照|模板|FAQ|常见问题|一览/i;
  return hits
    .map((h, i) => ({ h, i }))
    .sort((a, b) => {
      const score = ({ h }: { h: KnowledgeHit }) => {
        let value = h.score - (brief.test(h.title) ? 0.022 : 0);
        const title = h.title.toLowerCase();
        let cover = 0;
        for (const q of core) if (title.includes(q)) cover += 1;
        return value + Math.min(0.035, cover * 0.012);
      };
      return score(b) - score(a) || a.i - b.i;
    })
    .map((x) => x.h);
}

function buildAnswer(goal: string, hits: KnowledgeHit[], configured: boolean): string {
  const L: string[] = [];
  const intent = intentOf(goal);
  const terms = queryTerms(goal);
  L.push("### 内置学习笔记给出的答案");
  L.push(
    "> 当前为**离线模式**（未配置 API Key）。以下要点全部摘自本机内置的学习方法笔记原文，检索、抽取与引用均在本地完成。",
  );
  L.push("");
  if (!hits.length) {
    L.push("这次检索没有达到可信阈值，内置笔记里没有足够相关的片段。可以换用笔记中的术语再试：");
    L.push("");
    L.push("「主动回忆」「间隔重复」「认知负荷」「番茄工作法」「费曼技巧」「错题归因」等。");
    L.push("");
    L.push("## 下一步建议");
    L.push("- 到笔记库页面按分类浏览 58 篇系统笔记");
    L.push("- 也可直接说「帮我添加一个待办：今晚闭卷自测第 3 章」把计划落成任务");
    return L.join("\n");
  }
  const leads: Record<string, string> = {
    define: `关于「${goal.replace(/[？?。]/g, "").slice(0, 30)}」，最相关的说明集中在《${hits[0].title}》。`,
    howto: "按内置笔记给出的操作要点，可以这样推进（每条都标注了出处编号）。",
    compare: "内置笔记中与这个问题相关的几条论述可以对照来看。",
    trouble: "先定位是哪一类学习问题，内置笔记给出的判断与处理要点如下。",
    plan: `内置笔记命中 ${hits.length} 个片段，下面是可直接落进复习计划的依据与节奏建议。`,
    general: `内置学习笔记命中 ${hits.length} 个片段，重点如下。`,
  };
  L.push(`**结论**：${leads[intent]}`);
  L.push("");
  L.push("**要点摘录**");
  L.push("");
  const used = new Set<string>();
  let n = 0;
  for (let i = 0; i < hits.length && n < 6; i += 1) {
    const picked = pickSentences(hits[i].content || "", terms, i === 0 ? 2 : 1);
    for (const sentence of picked) {
      const key = sentence.slice(0, 18);
      if (used.has(key)) continue;
      used.add(key);
      n += 1;
      const clean = sentence.length > 150 ? `${sentence.slice(0, 148)}…` : sentence;
      L.push(`${n}. ${clean} **[${i + 1}]**`);
      if (n >= 6) break;
    }
  }
  if (!n) L.push(`1. ${hits[0].content.slice(0, 140)}… **[1]**`);
  L.push("");
  L.push("## 出处（可展开核对原文）");
  L.push("");
  L.push(hits.map((h, i) => `- **[${i + 1}]** 《${h.title}》 · 相似度 ${h.score.toFixed(3)}`).join("\n"));
  L.push("");
  L.push("## 下一步建议");
  L.push("");
  L.push("- 换更具体的关键词再问一次，命中会更准");
  L.push("- 可以说「把上面第 1 条记到笔记里」，把要点存进本机笔记本");
  L.push(
    configured
      ? "- 已配置 Key：同一问题可获得大模型基于这些片段组织的完整文稿"
      : "- 配置 API Key 后，可让大模型结合这些笔记与你的考试日期生成个性化复习计划",
  );
  L.push("");
  L.push("*58 篇方法笔记全部内置于本机，断网可用；未产生任何外部请求。*");
  return L.join("\n");
}

function predictTools(goal: string): string[] {
  const rules: [RegExp, string][] = [
    [/笔记|资料|检索|怎么|如何|什么|方法|原理|技巧|区别|为什么|介绍|术语|主动回忆|间隔|遗忘曲线|复习|记忆|专注|番茄|费曼|认知负荷|交错练习|康奈尔|卡片盒|错题|真题|拖延|习惯|周回顾|学习计划|高效用/i, "search_knowledge"],
    [/有哪些待办|查看待办|当前待办|待办列表|我的待办/i, "list_todos"],
    [/添加|加\s*\d|创建一条|清单|待办|任务|提醒|截止/i, "add_todo"],
    [/笔记|记下|记录|备忘|记到/i, "save_note"],
    [/几点|时间|日期|星期|明晚|今晚|今天/i, "get_datetime"],
    [/计算|等于|平均|总计|\+|×|÷|乘以/i, "calculate"],
  ];
  const out: string[] = [];
  for (const [re, name] of rules) if (re.test(goal) && !out.includes(name)) out.push(name);
  return out.slice(0, 4);
}

function guestArgs(name: string, goal: string): Record<string, unknown> | null {
  if (name === "search_knowledge") return { query: goal.slice(0, 60), topK: 3 };
  if (name === "calculate") {
    const m = goal.replace(/[，,？?!！。]/g, "").match(/[-+*/()%×xX÷\d.\s]{3,}/);
    const expr = m ? m[0].trim() : "";
    return /\d/.test(expr) && /[+\-*/%×xX÷]/.test(expr) ? { expression: expr } : null;
  }
  if (name === "add_todo") {
    const quoted = goal.match(/[「『"']([^」』"']{2,60})[」』"']/);
    let title = quoted ? quoted[1] : "";
    if (!title) {
      const m = goal.replace(/^(请|麻烦|帮我?|帮忙)\s*/, "").match(/(?:添加|新建|加个?|加一?个?|安排|提醒我(?:做|去)?)\s*(?:一个?|条)?\s*(?:待办|任务|事项)?[：:]?\s*(.{2,60})/);
      if (m) title = m[1].replace(/[。.,！!?？]\s*$/, "").trim();
    }
    if (!title) return null;
    return { title: title.slice(0, 60), priority: /(重要|紧急)/.test(goal) ? "high" : "medium" };
  }
  if (name === "complete_todo") {
    const quoted = goal.match(/[「『"']([^」』"']{2,30})[」』"']/);
    const m = goal.match(/(?:完成|做完了?|搞定了?)[「『"']?([^\s「』"']{2,20})/);
    const title = quoted ? quoted[1] : m ? m[1] : "";
    return title ? { title } : null;
  }
  if (name === "save_note") {
    const quoted = goal.match(/[「『"']([^」』"']{2,200})[」』"']/);
    const content = quoted ? quoted[1] : (goal.match(/(?:笔记|备忘)[：:]?\s*(.{2,200})/)?.[1] ?? "");
    return content ? { title: content.slice(0, 16), content } : null;
  }
  return {};
}

/** 模型调用失败时的离线兜底答复（401 / 402 / 429 / 断网等场景） */
export async function buildLocalFallback(goal: string, reason: string): Promise<string> {
  const hits = answerHits(await searchKnowledge(goal, 4), goal);
  return (
    `> ⚠️ 大模型连接失败（${reason}），已自动切回**离线模式**。下面的答复由本机内置资料生成，功能不中断。\n\n` +
    buildAnswer(goal, hits, false)
  );
}

export async function runGuestAgent(ctx: GuestRunContext): Promise<void> {
  const { goal, send, trace, signal } = ctx;
  const startedAt = Date.now();
  const predicted = predictTools(goal);
  const rawHits = await searchKnowledge(goal, 4);
  const hits = answerHits(rawHits, goal);
  const topicHit = hits.find((h) => !/术语|速查|模板|FAQ|常见问题/.test(h.title)) ?? hits[0];

  const stepDefs: { title: string; detail: string }[] = [
    { title: "理解目标", detail: `本地规则解析需求与约束 · 识别为「${topicHit ? "本地资料" : "通用任务"}」类问题` },
  ];
  if (predicted.length) {
    stepDefs.push({
      title: "调用本地工具",
      detail: predicted.map((name) => getTool(name)?.label ?? name).join("、") + "（全部在本机执行）",
    });
  }
  if (hits.length) {
    stepDefs.push({ title: "检索并核对资料", detail: `命中 ${hits.length} 个片段，来自《${topicHit?.title ?? "内置资料"}》等文档` });
  }
  stepDefs.push({ title: "整理带出处的答复", detail: "抽取原文要点、标注 [编号] 引用并给出下一步动作" });

  const steps: PlanStep[] = stepDefs.map((s, i) => ({ id: `step-${i + 1}`, ...s, status: "pending" }));
  send({ type: "plan", steps, title: goal.length > 24 ? `${goal.slice(0, 24)}…` : goal });
  const setStep = (i: number, status: PlanStep["status"]) => {
    if (!steps[i]) return;
    steps[i].status = status;
    send({ type: "step", stepId: steps[i].id, status });
  };
  setStep(0, "done");
  trace({
    kind: "plan",
    title: "离线模式 · 本地规划",
    detail: steps.map((s, i) => `${i + 1}. ${s.title}`).join(" → "),
    status: "success",
  });

  const parts: string[] = [];
  let toolCount = 0;
  for (const name of predicted) {
    if (signal.aborted) return;
    const tool = getTool(name);
    const args = guestArgs(name, goal);
    if (!tool || !args) continue;
    const callId = ctx.uid("guest-call");
    const base: ToolTrace = { id: callId, tool: name, label: tool.label, args, status: "pending" };
    toolCount += 1;
    send({ type: "tool_call", trace: base });
    trace({ kind: "thought", title: `决定调用「${tool.label}」`, detail: JSON.stringify(args).slice(0, 160), status: "info" });

    let approved = true;
    if (tool.requiresApproval && ctx.requireApproval) {
      send({ type: "tool_call", trace: { ...base, status: "awaiting" } });
      const approval: ApprovalRequest = {
        id: `approval-${callId}`,
        tool: name,
        label: tool.label,
        args,
        effect: tool.effect,
        status: "pending",
      };
      send({ type: "approval_request", approval });
      trace({ kind: "approval", title: `等待人工确认：${tool.label}`, detail: tool.effect, status: "pending" });
      approved = await ctx.waitApproval(approval.id, signal);
      trace({
        kind: "approval",
        title: approved ? `用户已批准：${tool.label}` : `用户已拒绝：${tool.label}`,
        status: approved ? "success" : "error",
      });
    }
    if (!approved) {
      send({ type: "tool_result", id: callId, status: "denied", result: "用户拒绝执行", durationMs: 0 });
      parts.push(`**${tool.label}**：用户拒绝执行，未产生任何写入。`);
      continue;
    }

    send({ type: "tool_call", trace: { ...base, status: "running" } });
    const t0 = Date.now();
    try {
      const outcome = await executeTool(name, args);
      const durationMs = Date.now() - t0;
      send({ type: "tool_result", id: callId, status: "success", result: outcome.content.slice(0, 1200), durationMs });
      trace({ kind: "tool", title: `工具执行成功：${tool.label}`, detail: `${durationMs} ms`, status: "success" });
      if (name !== "search_knowledge") parts.push(`### ${tool.label}\n${outcome.content}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "工具执行失败";
      send({ type: "tool_result", id: callId, status: "error", result: message, durationMs: Date.now() - t0 });
      trace({ kind: "error", title: `工具失败：${tool.label}`, detail: message, status: "error" });
    }
  }

  const pureTool = predicted.length > 0 && parts.length > 0 && !predicted.includes("search_knowledge");
  const citations: Citation[] = hits.map((h, i) => ({
    index: i + 1,
    title: h.title,
    source: h.source,
    score: h.score,
    snippet: h.content.slice(0, 160),
  }));
  if (!pureTool) {
    parts.unshift(buildAnswer(goal, hits, false));
    if (citations.length) send({ type: "citations", citations });
    trace({
      kind: "info",
      title: `本地 RAG 命中 ${hits.length} 条`,
      detail: hits.map((h, i) => `[${i + 1}] ${h.title} · ${h.score.toFixed(3)}`).join("；") || "无可信命中",
      status: hits.length ? "success" : "info",
    });
  }
  if (!parts.length) {
    parts.push(
      "### 离线模式 · 零配置能力一览\n\n知识问答、任务规划、待办 / 笔记 / 计算 / 时间、人工审批、语音、看板全部可用。\n\n## 下一步建议\n- 试试「根据知识库，番茄工作法怎么用？」\n- 或「帮我添加一个待办：今晚复习 RAG」",
    );
  }

  steps.forEach((_, i) => setStep(i, "done"));
  trace({
    kind: "info",
    title: `执行完成 · 调用工具 ${toolCount} 次（离线引擎）`,
    detail: `全程未产生外部请求`,
    status: "success",
  });

  const content = parts.join("\n\n");
  const chunkSize = 18;
  for (let i = 0; i < content.length; i += chunkSize) {
    if (signal.aborted) return;
    send({ type: "token", delta: content.slice(i, i + chunkSize) });
    await new Promise((resolve) => setTimeout(resolve, 8));
  }
  if (signal.aborted) return;
  send({ type: "done", content, durationMs: Date.now() - startedAt });
}
