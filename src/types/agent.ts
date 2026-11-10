/** 全局领域类型：Agent 会话、规划、工具轨迹与流式事件 */

export type Role = "user" | "assistant";

export type PlanStatus = "pending" | "running" | "done" | "skipped";

export interface PlanStep {
  id: string;
  title: string;
  detail: string;
  status: PlanStatus;
}

export interface Citation {
  index: number;
  title: string;
  source: string;
  score: number;
  snippet: string;
}

export type ToolStatus = "pending" | "awaiting" | "running" | "success" | "error" | "denied";

export interface ToolTrace {
  id: string;
  tool: string;
  label: string;
  args: Record<string, unknown>;
  status: ToolStatus;
  result?: string;
  durationMs?: number;
}

export type TraceKind = "plan" | "thought" | "tool" | "approval" | "safety" | "error" | "info";

export interface TraceItem {
  id: string;
  kind: TraceKind;
  title: string;
  detail?: string;
  status: "pending" | "success" | "error" | "info";
  at: number;
}

export interface ApprovalRequest {
  id: string;
  tool: string;
  label: string;
  args: Record<string, unknown>;
  effect: string;
  status: "pending" | "approved" | "denied";
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  streaming?: boolean;
  plan?: PlanStep[];
  trace?: TraceItem[];
  tools?: ToolTrace[];
  citations?: Citation[];
  approvals?: ApprovalRequest[];
  error?: string;
  safety?: string;
  durationMs?: number;
}

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface AgentSettings {
  /** 用户自己的 DeepSeek Key，仅存于浏览器 localStorage */
  apiKey: string;
  baseUrl: string;
  model: string;
  /** 写入类工具执行前是否需要人工确认（Human-in-the-loop） */
  requireApproval: boolean;
  voiceOutput: boolean;
}

export interface MemoryFact {
  id: string;
  text: string;
  createdAt: number;
  source: string;
}

export type McpTool = {
  name: string;
  description: string;
  mutating: boolean;
};

export type McpServer = {
  id: string;
  name: string;
  description: string;
  transport: string;
  status: "online" | "offline";
  tools: McpTool[];
};

export interface KnowledgeHit {
  docId: string;
  title: string;
  source: string;
  content: string;
  score: number;
  chunkId: string;
}

export type AgentStreamEvent =
  | { type: "meta"; runId: string; model: string }
  | { type: "safety"; message: string }
  | { type: "plan"; steps: PlanStep[]; title: string }
  | { type: "step"; stepId: string; status: PlanStatus }
  | { type: "trace"; item: TraceItem }
  | { type: "tool_call"; trace: ToolTrace }
  | { type: "tool_result"; id: string; status: ToolStatus; result: string; durationMs: number }
  | { type: "approval_request"; approval: ApprovalRequest }
  | { type: "citations"; citations: Citation[] }
  | { type: "memory"; fact: string }
  | { type: "token"; delta: string }
  | { type: "done"; content: string; durationMs: number }
  | { type: "error"; message: string; code?: string };

export interface AgentRequestBody {
  runId: string;
  sessionId: string;
  messages: { role: Role; content: string }[];
  memory: string[];
  requireApproval: boolean;
  model?: string;
  baseUrl?: string;
}
