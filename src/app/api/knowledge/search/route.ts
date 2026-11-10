import { NextRequest, NextResponse } from "next/server";
import { searchKnowledge } from "@/lib/rag/knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: { query?: string; topK?: number };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不合法" }, { status: 400 });
  }

  const query = payload.query?.trim();
  if (!query) {
    return NextResponse.json({ error: "检索关键词不能为空" }, { status: 400 });
  }

  const topK = Math.max(1, Math.min(Number(payload.topK) || 5, 8));
  const startedAt = Date.now();
  const hits = await searchKnowledge(query, topK);

  return NextResponse.json({
    query,
    topK,
    hits,
    tookMs: Date.now() - startedAt,
  });
}
