import { chatCompletion, type ChatMessagePayload } from "./deepseek";

export interface PlannedStep {
  title: string;
  detail: string;
}

export interface TaskPlan {
  title: string;
  steps: PlannedStep[];
  needsTools: boolean;
}

const PLANNER_SYSTEM = `你是「引航 Navigator」的任务规划器。请根据用户最新目标，输出严格 JSON（不要 Markdown 代码块），结构为：
{
  "title": "6-18 字的任务标题",
  "steps": [{ "title": "步骤名（4-10 字）", "detail": "一句话说明该步骤做什么" }],
  "needsTools": true
}

规划要求：
1. steps 数量为 2-4 个，按执行顺序排列，最后一步通常是"整理输出"。
2. 纯寒暄、闲聊、情绪回应 → needsTools=false，steps 可为 2 个简短步骤。
3. 只要涉及学习知识、概念解释、资料查询、学习计划、待办、笔记、行程、计算 → needsTools=true。
4. 不要描述如何使用工具，只描述对用户有价值的步骤。
5. 严禁输出 JSON 以外的任何字符。`;

function fallbackPlan(goal: string): TaskPlan {
  return {
    title: goal.length > 16 ? `${goal.slice(0, 16)}…` : goal || "新的任务",
    steps: [
      { title: "理解目标", detail: "澄清任务边界与期望产出" },
      { title: "执行任务", detail: "调用可用能力推进任务" },
      { title: "整理输出", detail: "汇总结果并给出下一步建议" },
    ],
    needsTools: false,
  };
}

export async function planTask(params: {
  apiKey: string;
  baseUrl?: string;
  model: string;
  goal: string;
  memory: string[];
  signal?: AbortSignal;
}): Promise<TaskPlan> {
  const messages: ChatMessagePayload[] = [
    { role: "system", content: PLANNER_SYSTEM },
    {
      role: "user",
      content: `用户目标：${params.goal}\n${
        params.memory.length ? `已知用户长期记忆：${params.memory.slice(0, 4).join("；")}` : ""
      }`,
    },
  ];

  try {
    const result = await chatCompletion({
      apiKey: params.apiKey,
      baseUrl: params.baseUrl,
      model: params.model,
      messages,
      temperature: 0.2,
      maxTokens: 600,
      responseFormat: "json",
      signal: params.signal,
    });

    const jsonText = result.content.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(jsonText) as Partial<TaskPlan>;
    const steps = Array.isArray(parsed.steps)
      ? parsed.steps
          .filter((step) => step && typeof step.title === "string")
          .slice(0, 4)
          .map((step) => ({
            title: String(step.title).slice(0, 24),
            detail: String(step.detail ?? "").slice(0, 80),
          }))
      : [];

    if (!steps.length) return fallbackPlan(params.goal);
    return {
      title: typeof parsed.title === "string" && parsed.title ? parsed.title.slice(0, 30) : fallbackPlan(params.goal).title,
      steps,
      needsTools: Boolean(parsed.needsTools),
    };
  } catch {
    return fallbackPlan(params.goal);
  }
}
