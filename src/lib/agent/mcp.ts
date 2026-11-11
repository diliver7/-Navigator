import type { McpServer } from "@/types/agent";

/**
 * MCP 工具清单（本地实现，按 MCP 的工具描述规范暴露能力）。
 * 前端「MCP 服务」面板直接消费该清单，Agent 的 Function Calling 与之一一对应。
 */
export const MCP_SERVERS: McpServer[] = [
  {
    id: "mcp-knowledge",
    name: "knowledge-rag",
    description: "58 篇方法笔记检索：分块索引 + TF-IDF 召回，支持相似度可视化",
    transport: "stdio · local",
    status: "online",
    tools: [
      {
        name: "search_knowledge",
        description: "在内置学习笔记中检索 Top-K 片段并返回相似度",
        mutating: false,
      },
    ],
  },
  {
    id: "mcp-task",
    name: "task-vault",
    description: "学习任务管理：创建、查询、完成，写入前触发人工确认",
    transport: "stdio · local",
    status: "online",
    tools: [
      { name: "list_todos", description: "列出全部学习任务及状态", mutating: false },
      { name: "add_todo", description: "新增学习任务（需审批）", mutating: true },
      { name: "complete_todo", description: "完成学习任务（需审批）", mutating: true },
    ],
  },
  {
    id: "mcp-note",
    name: "note-vault",
    description: "学习笔记沉淀：保存复习要点、回溯历史结论",
    transport: "stdio · local",
    status: "online",
    tools: [
      { name: "save_note", description: "保存笔记（需审批）", mutating: true },
      { name: "list_notes", description: "列出历史笔记", mutating: false },
    ],
  },
  {
    id: "mcp-utility",
    name: "utility-kit",
    description: "时间与计算：今天几号、复习天数、番茄钟时长",
    transport: "http · local",
    status: "online",
    tools: [
      { name: "get_datetime", description: "获取当前日期时间", mutating: false },
      { name: "calculate", description: "安全四则运算", mutating: false },
    ],
  },
];
