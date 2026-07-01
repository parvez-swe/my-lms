import { ObjectId } from "mongodb";

export interface AiChatSessionDocument {
  _id?: ObjectId;
  sessionId: string;
  visitorId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  messageCount: number;
  lastMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiChatMessageDocument {
  _id?: ObjectId;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  provider?: string;
  createdAt: Date;
}
