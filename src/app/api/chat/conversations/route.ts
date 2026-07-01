import { NextRequest, NextResponse } from "next/server";
import { getRequestParticipant } from "@/lib/chatRequest";
import { listConversationsForUser } from "@/lib/chatRepository";

export const dynamic = "force-dynamic";

// GET /api/chat/conversations - Get ONE-ON-ONE conversations for current user ONLY
export async function GET(request: NextRequest) {
  /* auth-guarded */
  try {
    const currentUser = await getRequestParticipant(request);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await listConversationsForUser(currentUser.id);

    return NextResponse.json({
      conversations,
      total: conversations.length,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
