import Pusher from "pusher";

let pusherInstance: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return null;
  }

  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }

  return pusherInstance;
}

export function getChatChannelName(conversationId: string): string {
  return `private-chat-${conversationId}`;
}

export async function publishChatMessage(
  conversationId: string,
  message: unknown
): Promise<void> {
  const pusher = getPusherServer();
  if (!pusher) return;

  try {
    await pusher.trigger(
      getChatChannelName(conversationId),
      "new-message",
      message
    );
  } catch (error) {
    console.error("Pusher publish error:", error);
  }
}

export function isPusherConfigured(): boolean {
  return Boolean(
    process.env.PUSHER_APP_ID &&
      process.env.NEXT_PUBLIC_PUSHER_KEY &&
      process.env.PUSHER_SECRET &&
      process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  );
}
