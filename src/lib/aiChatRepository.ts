import { getDatabase } from "@/lib/mongodb";
import {
  AiChatMessageDocument,
  AiChatSessionDocument,
} from "@/models/AiChatSession";

export async function upsertAiSession(params: {
  sessionId: string;
  visitorId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
}): Promise<void> {
  const db = await getDatabase();
  const now = new Date();
  await db.collection<AiChatSessionDocument>("aiChatSessions").updateOne(
    { sessionId: params.sessionId },
    {
      $setOnInsert: {
        sessionId: params.sessionId,
        messageCount: 0,
        createdAt: now,
      },
      $set: {
        visitorId: params.visitorId,
        userId: params.userId,
        userName: params.userName,
        userEmail: params.userEmail,
        updatedAt: now,
      },
    },
    { upsert: true }
  );
}

export async function saveAiMessage(params: {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  provider?: string;
  visitorId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
}): Promise<void> {
  const db = await getDatabase();
  const now = new Date();

  await upsertAiSession({
    sessionId: params.sessionId,
    visitorId: params.visitorId,
    userId: params.userId,
    userName: params.userName,
    userEmail: params.userEmail,
  });

  await db.collection<AiChatMessageDocument>("aiChatMessages").insertOne({
    sessionId: params.sessionId,
    role: params.role,
    content: params.content,
    provider: params.provider,
    createdAt: now,
  });

  await db.collection<AiChatSessionDocument>("aiChatSessions").updateOne(
    { sessionId: params.sessionId },
    {
      $set: {
        lastMessage: params.content.slice(0, 200),
        updatedAt: now,
      },
      $inc: { messageCount: 1 },
    }
  );
}

export async function listAiSessions(limit = 50, skip = 0) {
  const db = await getDatabase();
  const sessions = await db
    .collection<AiChatSessionDocument>("aiChatSessions")
    .find({})
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  return sessions;
}

export async function getAiMessages(sessionId: string) {
  const db = await getDatabase();
  return db
    .collection<AiChatMessageDocument>("aiChatMessages")
    .find({ sessionId })
    .sort({ createdAt: 1 })
    .toArray();
}
