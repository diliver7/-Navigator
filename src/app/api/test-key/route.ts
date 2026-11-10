import { NextRequest, NextResponse } from "next/server";
import { DeepSeekError, chatCompletion, resolveApiKey } from "@/lib/ai/deepseek";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const apiKey = resolveApiKey(request.headers.get("x-deepseek-key"));
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "未填写 API Key" }, { status: 401 });
  }

  let payload: { baseUrl?: string; model?: string };
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  try {
    const result = await chatCompletion({
      apiKey,
      baseUrl: payload.baseUrl,
      model: payload.model?.trim() || process.env.DEEPSEEK_MODEL || "deepseek-chat",
      messages: [{ role: "user", content: "回复 OK，仅用于连通性测试。" }],
      maxTokens: 4,
      temperature: 0,
    });
    return NextResponse.json({ ok: true, reply: result.content.slice(0, 40) });
  } catch (error) {
    const message = error instanceof DeepSeekError ? error.message : "连接测试失败";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
