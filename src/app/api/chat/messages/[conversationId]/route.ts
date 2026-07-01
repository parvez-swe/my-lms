import { NextRequest, NextResponse } from "next/server";
import { getRequestParticipant } from "@/lib/chatRequest";
import {
  addMessageToConversation,
  countMessagesInConversation,
  DEFAULT_CHAT_AVATAR,
  getConversationDocument,
  listMessagesForConversation,
  markConversationRead,
} from "@/lib/chatRepository";
import { publishChatMessage } from "@/lib/pusherServer";

export const dynamic = "force-dynamic";

// GET /api/chat/messages/[conversationId] - Get messages for ONE-ON-ONE conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  /* auth-guarded */
  try {
    const currentUser = await getRequestParticipant(request);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      100
    );
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const conversation = await getConversationDocument(conversationId);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (!conversation.participants.includes(currentUser.id)) {
      return NextResponse.json(
        { error: "You don't have access to this conversation" },
        { status: 403 }
      );
    }

    const [messages, total] = await Promise.all([
      listMessagesForConversation(conversationId, limit, offset),
      countMessagesInConversation(conversationId),
    ]);

    await markConversationRead(conversationId, currentUser.id);

    return NextResponse.json({
      messages,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/chat/messages/[conversationId] - Send a message to ONE-ON-ONE conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  /* auth-guarded */
  try {
    const currentUser = await getRequestParticipant(request);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const body = await request.json();
    const { text, attachments } = body as {
      text?: string;
      attachments?: string[];
    };

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Message text is required" },
        { status: 400 }
      );
    }

    const conversation = await getConversationDocument(conversationId);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (!conversation.participants.includes(currentUser.id)) {
      return NextResponse.json(
        { error: "You don't have access to this conversation" },
        { status: 403 }
      );
    }

    const message = await addMessageToConversation(conversation, {
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar || DEFAULT_CHAT_AVATAR,
      text: text.trim(),
      timestamp: new Date(),
      isRead: false,
      attachments: attachments || [],
    });

    await markConversationRead(conversationId, currentUser.id);

    await publishChatMessage(conversationId, message);

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
