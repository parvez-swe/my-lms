import { NextRequest } from "next/server";
import {
  ChatParticipantDetails,
  ChatParticipantRole,
  DEFAULT_CHAT_AVATAR,
  SUPPORTED_CHAT_ROLES,
} from "@/lib/chatRepository";

function normalizeRole(role?: string | null): ChatParticipantRole {
  if (!role) {
    return "visitor";
  }

  const lowered = role.toLowerCase() as ChatParticipantRole;
  if (SUPPORTED_CHAT_ROLES.includes(lowered)) {
    return lowered;
  }

  return "visitor";
}

export function getRequestParticipant(
  request: NextRequest
): ChatParticipantDetails {
  const id = request.headers.get("x-user-id") || "visitor-anonymous";
  const name = request.headers.get("x-user-name") || "Website Visitor";
  const avatar = request.headers.get("x-user-avatar") || DEFAULT_CHAT_AVATAR;
  const roleHeader = request.headers.get("x-user-role");

  return {
    id,
    name,
    role: normalizeRole(roleHeader),
    avatar,
  };
}

