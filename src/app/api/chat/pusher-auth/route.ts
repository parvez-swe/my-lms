import { NextRequest, NextResponse } from "next/server";
import { getRequestParticipant } from "@/lib/chatRequest";
import { getConversationDocument } from "@/lib/chatRepository";
import { getPusherServer } from "@/lib/pusherServer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getRequestParticipant(request);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const socketId = body.socket_id as string;
    const channelName = body.channel_name as string;

    if (!socketId || !channelName) {
      return NextResponse.json({ error: "Invalid auth request" }, { status: 400 });
    }

    const prefix = "private-chat-";
    if (!channelName.startsWith(prefix)) {
      return NextResponse.json({ error: "Invalid channel" }, { status: 403 });
    }

    const conversationId = channelName.slice(prefix.length);
    const conversation = await getConversationDocument(conversationId);

    if (!conversation || !conversation.participants.includes(currentUser.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pusher = getPusherServer();
    if (!pusher) {
      return NextResponse.json(
        { error: "Realtime not configured" },
        { status: 503 }
      );
    }

    const auth = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(auth);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
