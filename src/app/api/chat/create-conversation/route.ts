import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getRequestParticipant } from "@/lib/chatRequest";
import {
  ChatParticipantDetails,
  conversationDocumentToConversation,
  createConversationDocument,
  DEFAULT_CHAT_AVATAR,
  mapUserRoleToChatRole,
} from "@/lib/chatRepository";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";

export const dynamic = "force-dynamic";

async function resolveParticipantFromDatabase(
  participant: ChatParticipantDetails
): Promise<ChatParticipantDetails> {
  try {
    if (!ObjectId.isValid(participant.id)) {
      return participant;
    }

    const db = await getDatabase();
    const user = await db
      .collection<UserDocument>("users")
      .findOne(
        { _id: new ObjectId(participant.id) },
        { projection: { name: 1, role: 1, image: 1 } }
      );

    if (!user) {
      return participant;
    }

    return {
      id: user._id?.toString() || participant.id,
      name: user.name || participant.name,
      role: mapUserRoleToChatRole(user.role),
      avatar: user.image || participant.avatar || DEFAULT_CHAT_AVATAR,
    };
  } catch (error) {
    console.error("Failed to resolve participant from database:", error);
    return participant;
  }
}

// POST /api/chat/create-conversation - Create ONE-ON-ONE conversation
export async function POST(request: NextRequest) {
  /* auth-guarded */
  try {
    const currentUser = await getRequestParticipant(request);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      recipientId,
      recipientName,
      recipientAvatar,
      recipientRole,
    }: {
      recipientId?: string;
      recipientName?: string;
      recipientAvatar?: string;
      recipientRole?: string;
    } = body;

    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient ID is required" },
        { status: 400 }
      );
    }

    if (currentUser.id === recipientId) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      );
    }

    const recipient: ChatParticipantDetails = {
      id: recipientId,
      name: recipientName || "Unknown User",
      role: (recipientRole || "visitor") as ChatParticipantDetails["role"],
      avatar: recipientAvatar || DEFAULT_CHAT_AVATAR,
    };

    const [resolvedCurrentUser, resolvedRecipient] = await Promise.all([
      resolveParticipantFromDatabase(currentUser),
      resolveParticipantFromDatabase(recipient),
    ]);

    const conversationDoc = await createConversationDocument([
      resolvedCurrentUser,
      resolvedRecipient,
    ]);

    const conversation = conversationDocumentToConversation(
      conversationDoc,
      resolvedCurrentUser.id
    );

    return NextResponse.json(
      { success: true, conversation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
