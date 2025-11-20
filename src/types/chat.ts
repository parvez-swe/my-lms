// Real-time chat types and interfaces
export type ChatUserRole =
  | "admin"
  | "student"
  | "instructor"
  | "visitor"
  | "mentor"
  | "superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: ChatUserRole; // Role determines who can see what
  status: "online" | "offline" | "away";
  lastSeen: Date;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs - exactly 2 for one-on-one chats
  participantNames: string[];
  participantIds: string[]; // Explicit IDs for filtering
  participantRoles: ChatUserRole[]; // Roles of participants
  participantAvatars?: string[];
  lastMessage?: string;
  lastMessageTime?: Date;
  lastMessageSenderId?: string; // Who sent the last message
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: string[]; // URLs to attachments
}

export interface CreateConversationRequest {
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
}

export interface SendMessageRequest {
  conversationId: string;
  text: string;
  attachments?: string[];
}

export interface SendMessageResponse {
  success: boolean;
  message?: ChatMessage;
  error?: string;
}

export interface ConversationListResponse {
  conversations: ConversationWithLastMessage[];
  total: number;
}

export interface ConversationWithLastMessage extends Conversation {
  lastMessageSender?: string;
  lastMessagePreview?: string;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  total: number;
  hasMore: boolean;
}

// Mock data for demonstration
export const mockUsers: User[] = [
  {
    id: "admin-1",
    name: "John Admin",
    email: "admin@learning.com",
    avatar: "/images/users/user1.jpg",
    role: "admin",
    status: "online",
    lastSeen: new Date(),
  },
  {
    id: "student-1",
    name: "Sarah Smith",
    email: "sarah@student.com",
    avatar: "/images/users/user31.jpg",
    role: "student",
    status: "online",
    lastSeen: new Date(),
  },
  {
    id: "student-2",
    name: "Mike Johnson",
    email: "mike@student.com",
    avatar: "/images/users/user8.jpg",
    role: "student",
    status: "offline",
    lastSeen: new Date(Date.now() - 30 * 60000), // 30 mins ago
  },
  {
    id: "instructor-1",
    name: "Emily Davis",
    email: "emily@instructor.com",
    avatar: "/images/users/user4.jpg",
    role: "instructor",
    status: "online",
    lastSeen: new Date(),
  },
  {
    id: "student-3",
    name: "David Wilson",
    email: "david@student.com",
    avatar: "/images/users/user2.jpg",
    role: "student",
    status: "away",
    lastSeen: new Date(Date.now() - 5 * 60000), // 5 mins ago
  },
];

// Mock conversations - ONE-ON-ONE ONLY (exactly 2 participants)
export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participants: ["admin-1", "student-1"],
    participantNames: ["John Admin", "Sarah Smith"],
    participantIds: ["admin-1", "student-1"],
    participantRoles: ["admin", "student"],
    lastMessage: "Thanks for your help!",
    lastMessageTime: new Date(Date.now() - 2 * 60000),
    lastMessageSenderId: "student-1",
    unreadCount: 0,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60000),
    updatedAt: new Date(Date.now() - 2 * 60000),
  },
  {
    id: "conv-2",
    participants: ["admin-1", "student-2"],
    participantNames: ["John Admin", "Mike Johnson"],
    participantIds: ["admin-1", "student-2"],
    participantRoles: ["admin", "student"],
    lastMessage: "I need help with the assignment",
    lastMessageTime: new Date(Date.now() - 30 * 60000),
    lastMessageSenderId: "student-2",
    unreadCount: 1,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60000),
    updatedAt: new Date(Date.now() - 30 * 60000),
  },
  {
    id: "conv-3",
    participants: ["admin-1", "instructor-1"],
    participantNames: ["John Admin", "Emily Davis"],
    participantIds: ["admin-1", "instructor-1"],
    participantRoles: ["admin", "instructor"],
    lastMessage: "Course schedule updated",
    lastMessageTime: new Date(Date.now() - 1 * 60000),
    lastMessageSenderId: "admin-1",
    unreadCount: 0,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60000),
    updatedAt: new Date(Date.now() - 1 * 60000),
  },
  {
    id: "conv-4",
    participants: ["admin-1", "student-3"],
    participantNames: ["John Admin", "David Wilson"],
    participantIds: ["admin-1", "student-3"],
    participantRoles: ["admin", "student"],
    lastMessage: undefined,
    lastMessageTime: undefined,
    lastMessageSenderId: undefined,
    unreadCount: 0,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60000),
  },
];

// Mock messages
export const mockMessages: ChatMessage[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "student-1",
    senderName: "Sarah Smith",
    senderAvatar: "/images/users/user31.jpg",
    text: "Hi, I have a question about the course material",
    timestamp: new Date(Date.now() - 5 * 60000),
    isRead: true,
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    senderId: "admin-1",
    senderName: "John Admin",
    senderAvatar: "/images/users/user1.jpg",
    text: "Sure, what's your question?",
    timestamp: new Date(Date.now() - 4 * 60000),
    isRead: true,
  },
  {
    id: "msg-3",
    conversationId: "conv-1",
    senderId: "student-1",
    senderName: "Sarah Smith",
    senderAvatar: "/images/users/user31.jpg",
    text: "Thanks for your help!",
    timestamp: new Date(Date.now() - 2 * 60000),
    isRead: true,
  },
  {
    id: "msg-4",
    conversationId: "conv-2",
    senderId: "student-2",
    senderName: "Mike Johnson",
    senderAvatar: "/images/users/user8.jpg",
    text: "I need help with the assignment",
    timestamp: new Date(Date.now() - 30 * 60000),
    isRead: false,
  },
  {
    id: "msg-5",
    conversationId: "conv-3",
    senderId: "instructor-1",
    senderName: "Emily Davis",
    senderAvatar: "/images/users/user4.jpg",
    text: "Course schedule updated",
    timestamp: new Date(Date.now() - 1 * 60000),
    isRead: true,
  },
];
