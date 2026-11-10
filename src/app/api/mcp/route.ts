import { NextResponse } from "next/server";
import { MCP_SERVERS } from "@/lib/agent/mcp";

export const dynamic = "force-dynamic";

export async function GET() {
  const toolCount = MCP_SERVERS.reduce((sum, server) => sum + server.tools.length, 0);
  return NextResponse.json({
    protocol: "Model Context Protocol · tools manifest",
    servers: MCP_SERVERS,
    stats: {
      servers: MCP_SERVERS.filter((server) => server.status === "online").length,
      tools: toolCount,
    },
  });
}
