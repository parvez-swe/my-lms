"use client";

import { useEffect, useRef } from "react";
import PusherClient from "pusher-js";
import { ChatMessage } from "@/types/chat";

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

export interface ChatIdentity {
  id: string;
  role: string;
  name: string;
  avatar: string;
}

export function usePusherChat(
  conversationId: string | null,
  identity: ChatIdentity | null,
  onMessage: (message: ChatMessage) => void
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!conversationId || !identity?.id || !PUSHER_KEY || !PUSHER_CLUSTER) {
      return;
    }

    const pusher = new PusherClient(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: "/api/chat/pusher-auth",
      auth: {
        headers: {
          "x-user-id": identity.id,
          "x-user-role": identity.role,
          "x-user-name": identity.name,
          "x-user-avatar": identity.avatar,
        },
      },
    });

    const channelName = `private-chat-${conversationId}`;
    const channel = pusher.subscribe(channelName);

    const handler = (data: ChatMessage) => {
      onMessageRef.current(data);
    };

    channel.bind("new-message", handler);

    return () => {
      channel.unbind("new-message", handler);
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [conversationId, identity?.id, identity?.role, identity?.name, identity?.avatar]);
}

export function isPusherClientConfigured(): boolean {
  return Boolean(PUSHER_KEY && PUSHER_CLUSTER);
}
