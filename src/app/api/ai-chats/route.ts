import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import { listAiSessions, getAiMessages } from "@/lib/aiChatRepository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  try {
    if (sessionId) {
      const messages = await getAiMessages(sessionId);
      return NextResponse.json({ success: true, data: messages });
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    const skip = (page - 1) * limit;
    const sessions = await listAiSessions(limit, skip);
    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error("AI chats fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI conversations" },
      { status: 500 }
    );
  }
}
