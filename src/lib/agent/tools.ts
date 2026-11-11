import type { Citation } from "@/types/agent";
import type { ToolSchema } from "@/lib/ai/deepseek";
import { searchKnowledge } from "@/lib/rag/knowledge";
import { addTodo, completeTodo, listNotes, listTodos, saveNote } from "./store";
import { evaluateExpression } from "./calc";

export interface ToolResult {
  content: string;
  citations?: Citation[];
}

export interface AgentTool {
  name: string;
  label: string;
  description: string;
  requiresApproval: boolean;
  effect: string;
  parameters: Record<string, unknown>;
  run: (args: Record<string, unknown>) => Promise<ToolResult>;
}

function asString(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(args: Record<string, unknown>, key: string, fallback: number): number {
  const value = Number(args[key]);
  return Number.isFinite(value) ? value : fallback;
}

export const AGENT_TOOLS: AgentTool[] = [
  {
    name: "search_knowledge",
    label: "方法笔记检索",
    description:
      "在 58 篇学习方法笔记中检索，返回与问题最相关的片段与相似度。涉及记忆、专注、笔记、计划、应试等学习问题时必须优先调用。",
    requiresApproval: false,
    effect: "只读检索，不修改任何数据",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "检索关键词，尽量保留用户原始术语" },
        topK: { type: "number", description: "返回片段数量，1-8，默认 4" },
      },
      required: ["query"],
    },
    async run(args) {
      const query = asString(args, "query");
      if (!query) throw new Error("query 不能为空");
      const topK = Math.round(asNumber(args, "topK", 4));
      const hits = await searchKnowledge(query, topK);
      if (!hits.length) {
        return { content: "内置笔记未检索到相关方法。请谨慎给出通用学习建议，并提示用户可添加自己的笔记。" };
      }
      const citations: Citation[] = hits.map((hit, index) => ({
        index: index + 1,
        title: hit.title,
        source: hit.source,
        score: hit.score,
        snippet: hit.content.replace(/\s+/g, " ").slice(0, 220),
      }));
      const body = hits
        .map(
          (hit, index) =>
            `[${index + 1}] 《${hit.title}》（${hit.source}，相似度 ${hit.score.toFixed(3)}）\n${hit.content}`,
        )
        .join("\n\n");
      return {
        content: `方法笔记检索到 ${hits.length} 条片段，请引用时标注 [编号]：\n\n${body}`,
        citations,
      };
    },
  },
  {
    name: "list_todos",
    label: "查看学习任务",
    description: "读取当前用户的全部学习任务及状态，用于回答进度、规划复习安排。",
    requiresApproval: false,
    effect: "只读读取本地待办",
    parameters: { type: "object", properties: {}, required: [] },
    async run() {
      const todos = await listTodos();
      if (!todos.length) return { content: "当前学习任务列表为空。" };
      const lines = todos.map(
        (todo) =>
          `- [${todo.status === "done" ? "x" : " "}] ${todo.title}（id: ${todo.id}，优先级: ${todo.priority}${
            todo.due ? `，截止: ${todo.due}` : ""
          }）`,
      );
      return { content: `当前共 ${todos.length} 条学习任务：\n${lines.join("\n")}` };
    },
  },
  {
    name: "add_todo",
    label: "新增学习任务",
    description: "为当前用户创建一条待办任务，可指定截止日期与优先级。",
    requiresApproval: true,
    effect: "会写入本地学习任务，需用户确认",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "学习任务标题，具体可执行" },
        due: { type: "string", description: "截止时间，如 2026-11-15 或 本周五" },
        priority: { type: "string", enum: ["high", "medium", "low"], description: "优先级" },
      },
      required: ["title"],
    },
    async run(args) {
      const title = asString(args, "title");
      if (!title) throw new Error("title 不能为空");
      const priorityRaw = asString(args, "priority");
      const priority = priorityRaw === "high" || priorityRaw === "low" ? priorityRaw : "medium";
      const todo = await addTodo({ title, due: asString(args, "due") || undefined, priority });
      return { content: `已创建学习任务：${todo.title}（id: ${todo.id}，优先级: ${todo.priority}）` };
    },
  },
  {
    name: "complete_todo",
    label: "完成学习任务",
    description: "将指定 id 的学习任务标记为已完成。",
    requiresApproval: true,
    effect: "会修改本地待办状态，需用户确认",
    parameters: {
      type: "object",
      properties: { id: { type: "string", description: "待办 id" } },
      required: ["id"],
    },
    async run(args) {
      const id = asString(args, "id");
      if (!id) throw new Error("id 不能为空");
      const todo = await completeTodo(id);
      if (!todo) return { content: `未找到 id 为 ${id} 的待办，请先调用 list_todos 确认。` };
      return { content: `已完成学习任务：${todo.title}` };
    },
  },
  {
    name: "save_note",
    label: "保存学习笔记",
    description: "把总结、复习要点或结论保存为个人笔记，便于后续检索沉淀。",
    requiresApproval: true,
    effect: "会写入本地笔记数据，需用户确认",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "笔记标题" },
        content: { type: "string", description: "Markdown 格式的笔记正文" },
      },
      required: ["title", "content"],
    },
    async run(args) {
      const title = asString(args, "title");
      const content = asString(args, "content");
      if (!title || !content) throw new Error("title 与 content 不能为空");
      const note = await saveNote({ title, content });
      return { content: `已保存笔记《${note.title}》（id: ${note.id}，${note.content.length} 字）` };
    },
  },
  {
    name: "list_notes",
    label: "查看学习笔记",
    description: "列出用户已保存的笔记标题与摘要，用于回顾与串联知识。",
    requiresApproval: false,
    effect: "只读读取本地笔记",
    parameters: { type: "object", properties: {}, required: [] },
    async run() {
      const notes = await listNotes();
      if (!notes.length) return { content: "当前还没有保存过笔记。" };
      const lines = notes.map((note) => `- 《${note.title}》（${note.content.length} 字）：${note.content.slice(0, 80)}…`);
      return { content: `共有 ${notes.length} 篇笔记：\n${lines.join("\n")}` };
    },
  },
  {
    name: "get_datetime",
    label: "获取时间",
    description: "获取当前日期、时间与星期，用于计算截止时间和制定日程。",
    requiresApproval: false,
    effect: "只读系统时间",
    parameters: { type: "object", properties: {}, required: [] },
    async run() {
      const now = new Date();
      const formatted = now.toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
      return { content: `当前时间（Asia/Shanghai）：${formatted}` };
    },
  },
  {
    name: "calculate",
    label: "精确计算",
    description: "执行安全的四则运算（支持 + - * / % ^ 与括号），避免模型口算出错。",
    requiresApproval: false,
    effect: "纯本地计算，无副作用",
    parameters: {
      type: "object",
      properties: { expression: { type: "string", description: "数学表达式，如 (3+4)*2.5" } },
      required: ["expression"],
    },
    async run(args) {
      const expression = asString(args, "expression");
      if (!expression) throw new Error("expression 不能为空");
      const value = evaluateExpression(expression);
      return { content: `${expression} = ${Number.isInteger(value) ? value : Number(value.toFixed(6))}` };
    },
  },
];

export function toOpenAITools(): ToolSchema[] {
  return AGENT_TOOLS.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

export function getTool(name: string): AgentTool | undefined {
  return AGENT_TOOLS.find((tool) => tool.name === name);
}

export function parseToolArguments(raw: string): Record<string, unknown> {
  if (!raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  const tool = getTool(name);
  if (!tool) throw new Error(`未知工具：${name}`);
  return tool.run(args);
}
