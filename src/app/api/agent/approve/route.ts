import { NextRequest, NextResponse } from "next/server";
import { resolveApproval } from "@/lib/agent/pending";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let payload: { approvalId?: string; approved?: boolean };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "请求体不合法" }, { status: 400 });
  }

  if (!payload.approvalId || typeof payload.approved !== "boolean") {
    return NextResponse.json({ ok: false, error: "缺少 approvalId 或 approved" }, { status: 400 });
  }

  const resolved = resolveApproval(payload.approvalId, payload.approved);
  return NextResponse.json({ ok: resolved, approved: payload.approved });
}
