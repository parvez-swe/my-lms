import { getDatabase } from "@/lib/mongodb";
import { ChatMessage, Conversation } from "@/types/chat";
import { UserDocument } from "@/models/User";
import { ObjectId, WithId } from "mongodb";

export type ChatParticipantRole =
  | "admin"
  | "student"
  | "instructor"
  | "visitor"
  | "mentor"
  | "superadmin";

export interface ChatParticipantDetails {
  id: string;
  name: string;
  role: ChatParticipantRole;
  avatar?: string;
}

export interface ChatConversationDocument {
  _id?: ObjectId;
  participants: string[];
  participantsKey: string;
  participantDetails: ChatParticipantDetails[];
  lastMessage?: string;
  lastMessageTime?: Date;
  lastMessageSenderId?: string;
  unreadCounts?: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageDocument {
  _id?: ObjectId;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: string[];
}

const CONVERSATIONS_COLLECTION = "chatConversations";
const MESSAGES_COLLECTION = "chatMessages";
export const DEFAULT_CHAT_AVATAR = "/images/users/user31.jpg";

export const SUPPORTED_CHAT_ROLES: ChatParticipantRole[] = [
  "admin",
  "student",
  "instructor",
  "visitor",
  "mentor",
  "superadmin",
];

export function mapUserRoleToChatRole(
  role?: UserDocument["role"]
): ChatParticipantRole {
  if (!role) {
    return "visitor";
  }

  if (role === "mentor") {
    return "instructor";
  }

  if (SUPPORTED_CHAT_ROLES.includes(role as ChatParticipantRole)) {
    return role as ChatParticipantRole;
  }

  return "visitor";
}

function normalizeParticipant(
  participant: Partial<ChatParticipantDetails>
): ChatParticipantDetails {
  if (!participant.id) {
    throw new Error("Participant ID is required");
  }

  const normalizedRole = participant.role && SUPPORTED_CHAT_ROLES.includes(participant.role)
    ? participant.role
    : "visitor";

  return {
    id: participant.id,
    name: participant.name?.trim() || "Unknown User",
    role: normalizedRole,
    avatar: participant.avatar || DEFAULT_CHAT_AVATAR,
  };
}

function buildParticipantsKey(participants: string[]): string {
  return [...new Set(participants)].sort().join("::");
}

export function conversationDocumentToConversation(
  doc: WithId<ChatConversationDocument>,
  viewerId?: string
): Conversation {
  const participantNames = doc.participantDetails.map((p) => p.name);
  const participantRoles = doc.participantDetails.map((p) => p.role);
  const participantIds = doc.participantDetails.map((p) => p.id);
  const participantAvatars = doc.participantDetails.map(
    (p) => p.avatar || DEFAULT_CHAT_AVATAR
  );

  return {
    id: doc._id.toString(),
    participants: doc.participants,
    participantIds,
    participantNames,
    participantRoles,
    participantAvatars,
    lastMessage: doc.lastMessage,
    lastMessageTime: doc.lastMessageTime,
    lastMessageSenderId: doc.lastMessageSenderId,
    unreadCount: doc.unreadCounts?.[viewerId ?? ""] ?? 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function serializeMessage(
  doc: WithId<ChatMessageDocument>
): ChatMessage {
  return {
    id: doc._id.toString(),
    conversationId: doc.conversationId,
    senderId: doc.senderId,
    senderName: doc.senderName,
    senderAvatar: doc.senderAvatar || DEFAULT_CHAT_AVATAR,
    text: doc.text,
    timestamp: doc.timestamp,
    isRead: doc.isRead,
    attachments: doc.attachments || [],
  };
}

export async function findConversationByParticipants(
  participantIds: string[]
): Promise<WithId<ChatConversationDocument> | null> {
  const db = await getDatabase();
  const collection = db.collection<ChatConversationDocument>(
    CONVERSATIONS_COLLECTION
  );

  const participantsKey = buildParticipantsKey(participantIds);

  return collection.findOne({ participantsKey });
}

export async function createConversationDocument(
  participants: ChatParticipantDetails[]
): Promise<WithId<ChatConversationDocument>> {
  if (participants.length !== 2) {
    throw new Error("Only one-on-one conversations are supported");
  }

  const normalizedParticipants = participants.map((participant) =>
    normalizeParticipant(participant)
  );

  const participantIds = normalizedParticipants.map((p) => p.id);
  const participantsKey = buildParticipantsKey(participantIds);

  const existing = await findConversationByParticipants(participantIds);
  if (existing) {
    return existing;
  }

  const now = new Date();
  const unreadCounts = normalizedParticipants.reduce<Record<string, number>>(
    (acc, participant) => {
      acc[participant.id] = 0;
      return acc;
    },
    {}
  );

  const doc: ChatConversationDocument = {
    participants: participantIds,
    participantsKey,
    participantDetails: normalizedParticipants,
    lastMessage: undefined,
    lastMessageTime: undefined,
    lastMessageSenderId: undefined,
    unreadCounts,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDatabase();
  const collection = db.collection<ChatConversationDocument>(
    CONVERSATIONS_COLLECTION
  );
  const result = await collection.insertOne(doc);

  return {
    ...doc,
    _id: result.insertedId,
  } as WithId<ChatConversationDocument>;
}

export async function listConversationsForUser(
  userId: string
): Promise<Conversation[]> {
  if (!userId || userId.trim() === "") {
    return [];
  }

  const db = await getDatabase();
  const collection = db.collection<ChatConversationDocument>(
    CONVERSATIONS_COLLECTION
  );

  // Explicitly filter conversations where the userId is in the participants array
  // This ensures each user (including visitors) only sees their own conversations
  const conversations = await collection
    .find({ 
      participants: { $in: [userId] } // Explicitly check if userId is in participants array
    })
    .sort({ updatedAt: -1 })
    .limit(200)
    .toArray();

  // Additional safety check: filter out any conversations where userId is not actually a participant
  // This is a double-check to ensure privacy
  const filteredConversations = conversations.filter((conv) =>
    conv.participants.includes(userId)
  );

  return filteredConversations.map((conversation) =>
    conversationDocumentToConversation(
      conversation as WithId<ChatConversationDocument>,
      userId
    )
  );
}

export async function getConversationDocument(
  conversationId: string
): Promise<WithId<ChatConversationDocument> | null> {
  if (!ObjectId.isValid(conversationId)) {
    return null;
  }

  const db = await getDatabase();
  const collection = db.collection<ChatConversationDocument>(
    CONVERSATIONS_COLLECTION
  );

  return collection.findOne({ _id: new ObjectId(conversationId) });
}

export async function listMessagesForConversation(
  conversationId: string,
  limit: number,
  offset: number
): Promise<ChatMessage[]> {
  const db = await getDatabase();
  const collection = db.collection<ChatMessageDocument>(MESSAGES_COLLECTION);

  const messages = await collection
    .find({ conversationId })
    .sort({ timestamp: 1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  return messages.map((message) =>
    serializeMessage(message as WithId<ChatMessageDocument>)
  );
}

export async function countMessagesInConversation(
  conversationId: string
): Promise<number> {
  const db = await getDatabase();
  const collection = db.collection<ChatMessageDocument>(MESSAGES_COLLECTION);
  return collection.countDocuments({ conversationId });
}

export async function addMessageToConversation(
  conversation: WithId<ChatConversationDocument>,
  messageInput: Omit<ChatMessageDocument, "_id">
): Promise<ChatMessage> {
  const db = await getDatabase();
  const collection = db.collection<ChatMessageDocument>(MESSAGES_COLLECTION);

  const result = await collection.insertOne(messageInput);
  const insertedMessage = {
    ...messageInput,
    _id: result.insertedId,
  } as WithId<ChatMessageDocument>;

  const unreadInc: Record<string, number> = {};
  conversation.participants.forEach((participantId) => {
    if (participantId !== messageInput.senderId) {
      unreadInc[`unreadCounts.${participantId}`] = 1;
    }
  });

  const conversationCollection = db.collection<ChatConversationDocument>(
    CONVERSATIONS_COLLECTION
  );

  await conversationCollection.updateOne(
    { _id: conversation._id },
    {
      $set: {
        lastMessage: messageInput.text,
        lastMessageTime: messageInput.timestamp,
        lastMessageSenderId: messageInput.senderId,
        updatedAt: messageInput.timestamp,
      },
      ...(Object.keys(unreadInc).length ? { $inc: unreadInc } : {}),
    }
  );

  return serializeMessage(insertedMessage);
}

export async function markConversationRead(
  conversationId: string,
  userId: string
): Promise<void> {
  if (!ObjectId.isValid(conversationId)) {
    return;
  }

  const db = await getDatabase();
  const collection = db.collection<ChatConversationDocument>(
    CONVERSATIONS_COLLECTION
  );

  await collection.updateOne(
    { _id: new ObjectId(conversationId) },
    { $set: { [`unreadCounts.${userId}`]: 0 } }
  );
}

