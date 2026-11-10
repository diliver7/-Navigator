import { NextRequest, NextResponse } from "next/server";
import { addKnowledgeDoc, knowledgeStats, listKnowledgeDocs } from "@/lib/rag/knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [docs, stats] = await Promise.all([listKnowledgeDocs(), knowledgeStats()]);
  return NextResponse.json({ docs, stats });
}

export async function POST(request: NextRequest) {
  let payload: { title?: string; content?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不合法" }, { status: 400 });
  }

  if (!payload.content || !payload.content.trim()) {
    return NextResponse.json({ error: "文档内容不能为空" }, { status: 400 });
  }

  try {
    const doc = await addKnowledgeDoc({
      title: payload.title ?? "",
      content: payload.content,
    });
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "写入知识库失败" },
      { status: 400 },
    );
  }
}
