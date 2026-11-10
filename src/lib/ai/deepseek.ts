/** DeepSeek（OpenAI 兼容）服务端调用封装：非流式 + 流式，统一错误映射 */

export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ChatMessagePayload {
  role: ChatRole;
  content: string | null;
  tool_calls?: ToolCallPayload[];
  tool_call_id?: string;
  name?: string;
}

export interface ToolCallPayload {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolSchema {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatCompletionOptions {
  apiKey: string;
  baseUrl?: string;
  model: string;
  messages: ChatMessagePayload[];
  tools?: ToolSchema[];
  toolChoice?: "auto" | "none";
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json" | "text";
  signal?: AbortSignal;
}

export interface ChatCompletionResult {
  content: string;
  toolCalls: ToolCallPayload[];
  finishReason: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

export class DeepSeekError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = "deepseek_error") {
    super(message);
    this.name = "DeepSeekError";
    this.status = status;
    this.code = code;
  }
}

const DEFAULT_BASE_URL = "https://api.deepseek.com";

export function resolveBaseUrl(baseUrl?: string): string {
  const raw = (baseUrl || process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
  return raw || DEFAULT_BASE_URL;
}

export function resolveApiKey(headerKey?: string | null): string {
  const fromHeader = headerKey?.trim();
  if (fromHeader) return fromHeader;
  return (process.env.DEEPSEEK_API_KEY || "").trim();
}

function completionsUrl(baseUrl?: string): string {
  const base = resolveBaseUrl(baseUrl);
  // 兼容 https://api.deepseek.com 与 https://api.deepseek.com/v1 两种写法
  return base.endsWith("/v1") ? `${base}/chat/completions` : `${base}/chat/completions`;
}

function mapHttpError(status: number, detail: string): DeepSeekError {
  if (status === 401) {
    return new DeepSeekError("API Key 无效或已过期，请在首页「本地 API 设置」中检查密钥。", status, "invalid_key");
  }
  if (status === 402) {
    return new DeepSeekError("DeepSeek 账户余额不足，请前往开放平台充值后重试。", status, "insufficient_balance");
  }
  if (status === 429) {
    return new DeepSeekError("请求过于频繁或并发受限，请稍后重试。", status, "rate_limited");
  }
  if (status >= 500) {
    return new DeepSeekError("DeepSeek 服务暂时不可用，请稍后重试。", status, "upstream_error");
  }
  return new DeepSeekError(detail || "模型调用失败，请稍后重试。", status, "request_failed");
}

async function readError(response: Response): Promise<string> {
  try {
    const text = await response.text();
    if (!text) return "";
    try {
      const json = JSON.parse(text);
      return json?.error?.message || json?.message || text.slice(0, 240);
    } catch {
      return text.slice(0, 240);
    }
  } catch {
    return "";
  }
}

function withTimeout(signal: AbortSignal | undefined, timeoutMs: number): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

export async function chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
  const body: Record<string, unknown> = {
    model: options.model,
    messages: options.messages,
    temperature: options.temperature ?? 0.5,
    stream: false,
  };
  if (options.tools?.length) {
    body.tools = options.tools;
    body.tool_choice = options.toolChoice ?? "auto";
  }
  if (options.maxTokens) body.max_tokens = options.maxTokens;
  if (options.responseFormat === "json") body.response_format = { type: "json_object" };

  let response: Response;
  try {
    response = await fetch(completionsUrl(options.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: withTimeout(options.signal, 90_000),
      cache: "no-store",
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new DeepSeekError("请求超时，请重试。", 504, "timeout");
    }
    throw new DeepSeekError("无法连接 DeepSeek 服务，请检查本机网络或 Base URL。", 502, "network_error");
  }

  if (!response.ok) {
    const detail = await readError(response);
    throw mapHttpError(response.status, detail);
  }

  const json = await response.json();
  const message = json?.choices?.[0]?.message;
  if (!message) {
    throw new DeepSeekError("模型返回内容为空，请重试。", 502, "empty_response");
  }

  return {
    content: typeof message.content === "string" ? message.content : "",
    toolCalls: Array.isArray(message.tool_calls) ? message.tool_calls : [],
    finishReason: json?.choices?.[0]?.finish_reason ?? "stop",
    usage: json?.usage,
  };
}

/** 逐 token 产出流式增量（异步生成器） */
export async function* streamChatCompletion(
  options: ChatCompletionOptions,
): AsyncGenerator<{ delta: string; finishReason?: string }> {
  let response: Response;
  try {
    response = await fetch(completionsUrl(options.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.apiKey}`,
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.55,
        stream: true,
      }),
      signal: withTimeout(options.signal, 180_000),
      cache: "no-store",
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new DeepSeekError("生成已取消或超时。", 504, "timeout");
    }
    throw new DeepSeekError("无法连接 DeepSeek 服务，请检查本机网络或 Base URL。", 502, "network_error");
  }

  if (!response.ok) {
    const detail = await readError(response);
    throw mapHttpError(response.status, detail);
  }
  if (!response.body) {
    throw new DeepSeekError("响应流为空，请重试。", 502, "empty_stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const block of parts) {
        for (const line of block.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta: string = json?.choices?.[0]?.delta?.content ?? "";
            const finishReason: string | undefined = json?.choices?.[0]?.finish_reason ?? undefined;
            if (delta) yield { delta, finishReason };
            else if (finishReason) yield { delta: "", finishReason };
          } catch {
            // 忽略无法解析的心跳/分片
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
