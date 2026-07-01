import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  ChatParticipantDetails,
  ChatParticipantRole,
  DEFAULT_CHAT_AVATAR,
  mapUserRoleToChatRole,
  SUPPORTED_CHAT_ROLES,
} from "@/lib/chatRepository";

function parseHeaderRole(role: string | null): ChatParticipantRole {
  if (role && SUPPORTED_CHAT_ROLES.includes(role as ChatParticipantRole)) {
    return role as ChatParticipantRole;
  }
  return "visitor";
}

export async function getRequestParticipant(
  request?: NextRequest
): Promise<ChatParticipantDetails | null> {
  const session = await auth();

  if (session?.user?.id) {
    return {
      id: session.user.id,
      name: session.user.name || "User",
      role: mapUserRoleToChatRole(session.user.role),
      avatar: session.user.image || DEFAULT_CHAT_AVATAR,
    };
  }

  if (!request) {
    return null;
  }

  const userId = request.headers.get("x-user-id")?.trim();
  if (!userId) {
    return null;
  }

  return {
    id: userId,
    name: request.headers.get("x-user-name")?.trim() || "Website Visitor",
    role: parseHeaderRole(request.headers.get("x-user-role")),
    avatar: request.headers.get("x-user-avatar")?.trim() || DEFAULT_CHAT_AVATAR,
  };
}
