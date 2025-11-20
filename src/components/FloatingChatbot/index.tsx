"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChatMessage, Conversation } from "@/types/chat";

// Generate unique visitor ID for this session
// This ID is unique per browser and persists across page reloads
const generateVisitorId = (): string => {
  if (typeof window === "undefined") return "visitor-unknown";

  // Check if we already have a visitor ID
  let visitorId = localStorage.getItem("visitor_id");

  if (!visitorId) {
    // Generate a truly unique ID using timestamp + random + user agent hash
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const userAgentHash =
      typeof navigator !== "undefined"
        ? btoa(navigator.userAgent).substring(0, 8)
        : "unknown";

    visitorId = `visitor-${timestamp}-${random}-${userAgentHash}`;
    localStorage.setItem("visitor_id", visitorId);

    // Also store a timestamp to track when this visitor ID was created
    localStorage.setItem("visitor_id_created", timestamp.toString());
  }

  return visitorId;
};

const normalizeChatMessage = (raw: unknown): ChatMessage => {
  const message = raw as Partial<ChatMessage> & {
    timestamp?: string | Date;
  };

  const timestampValue =
    typeof message.timestamp === "string"
      ? new Date(message.timestamp)
      : message.timestamp || new Date();

  return {
    id: message.id || `temp-${Date.now()}`,
    conversationId: message.conversationId || "",
    senderId: message.senderId || "unknown",
    senderName: message.senderName || "User",
    senderAvatar: message.senderAvatar || "/images/users/user31.jpg",
    text: message.text || "",
    timestamp: timestampValue,
    isRead: message.isRead ?? false,
    attachments: message.attachments || [],
  };
};

export const FloatingChatbot: React.FC = () => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [visitorId] = useState(() => generateVisitorId());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll interval id
  const pollIntervalRef = useRef<number | null>(null);

  // Track last message timestamp to avoid unnecessary updates
  const lastMessageTimestampRef = useRef<Date | null>(null);

  const identity = useMemo(() => {
    if (session && session.user) {
      const user = session.user as {
        id?: string;
        name?: string;
        email?: string;
        image?: string;
        role?: string;
      };

      return {
        id: user.id || user.email || visitorId,
        role: user.role || "student",
        name: user.name || "Student",
        avatar: user.image || "/images/users/user31.jpg",
      };
    }

    return {
      id: visitorId,
      role: "visitor",
      name: "Website Visitor",
      avatar: "/images/users/user31.jpg",
    };
  }, [session, visitorId]);

  const loadMessages = useCallback(
    async (convId: string, skipTimestampCheck = false) => {
      try {
        // Validate we have a valid identity ID
        if (!identity.id || identity.id.trim() === "") {
          console.error("Cannot load messages: Invalid visitor ID");
          return;
        }

        const headers: Record<string, string> = {
          "x-user-id": identity.id,
          "x-user-role": identity.role,
        };

        const response = await fetch(`/api/chat/messages/${convId}?limit=50`, {
          headers,
          cache: "no-store",
        });

        if (!response.ok) {
          // If unauthorized (403), this visitor doesn't have access to this conversation
          // This should not happen if the system is working correctly, but handle it gracefully
          if (response.status === 403) {
            console.warn(
              "Access denied to conversation - this should not happen"
            );
            setConversationId(null);
            setMessages([]);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const msgs = (data.messages || []).map((message: unknown) =>
          normalizeChatMessage(message)
        );

        // Check if we have new messages
        if (msgs.length > 0) {
          const latestMessage = msgs[msgs.length - 1];
          const latestTimestamp = new Date(latestMessage.timestamp);

          // Only update if we have new messages or if skipTimestampCheck is true
          if (
            skipTimestampCheck ||
            !lastMessageTimestampRef.current ||
            latestTimestamp > lastMessageTimestampRef.current
          ) {
            // Deduplicate messages by ID
            setMessages((prev) => {
              const messageMap = new Map<string, ChatMessage>();

              // Add existing messages
              prev.forEach((msg) => {
                if (!msg.id.startsWith("temp-")) {
                  messageMap.set(msg.id, msg);
                }
              });

              // Add new messages (will overwrite duplicates)
              msgs.forEach((msg: ChatMessage) => {
                messageMap.set(msg.id, msg);
              });

              // Convert back to array and sort by timestamp
              const merged = Array.from(messageMap.values()).sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              );

              return merged;
            });

            lastMessageTimestampRef.current = latestTimestamp;
          }
        } else if (skipTimestampCheck) {
          // If no messages but we're forcing an update, still set empty array
          setMessages([]);
          lastMessageTimestampRef.current = null;
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        // Don't throw - allow polling to continue
      }
    },
    [identity.id, identity.role]
  );

  const initializeConversation = useCallback(async () => {
    try {
      // Ensure we have a valid identity ID
      if (!identity.id || identity.id.trim() === "") {
        console.error("Invalid visitor ID");
        return;
      }

      const headers: Record<string, string> = {
        "x-user-id": identity.id,
        "x-user-role": identity.role,
      };

      const response = await fetch("/api/chat/conversations", {
        headers,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }

      const data = await response.json();

      // Filter conversations to ensure we only show conversations where this visitor is a participant
      // This is an additional client-side safety check
      const userConversations = (data.conversations || []).filter(
        (conv: Conversation) =>
          conv.participants && conv.participants.includes(identity.id)
      );

      if (userConversations.length > 0) {
        // Use the most recent conversation
        const firstConv = userConversations[0];
        setConversationId(firstConv.id);
        await loadMessages(firstConv.id);
      } else {
        // Get the actual admin user ID dynamically
        let adminUser;
        try {
          const adminResponse = await fetch("/api/chat/get-admin");
          adminUser = await adminResponse.json();
        } catch (error) {
          console.error("Error fetching admin user:", error);
          // Fallback to default admin
          adminUser = {
            id: "admin-1",
            name: "Admin Support",
            avatar: "/images/users/user1.jpg",
            role: "admin",
          };
        }

        const createHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          "x-user-id": identity.id,
          "x-user-role": identity.role,
        };

        const createResponse = await fetch("/api/chat/create-conversation", {
          method: "POST",
          headers: createHeaders,
          body: JSON.stringify({
            recipientId: adminUser.id,
            recipientName: adminUser.name || "Admin Support",
            recipientAvatar: adminUser.avatar || "/images/users/user1.jpg",
            recipientRole: adminUser.role || "admin",
          }),
        });
        const createData = await createResponse.json();
        if (createData.success) {
          setConversationId(createData.conversation.id);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Error initializing conversation:", error);
    }
  }, [identity.id, identity.role, loadMessages]);

  useEffect(() => {
    if (status === "loading") return;

    setConversationId(null);
    setMessages([]);
    initializeConversation();
  }, [initializeConversation, status]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId) return;

    const messageText = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-user-id": identity.id,
        "x-user-role": identity.role,
        "x-user-name": identity.name,
        "x-user-avatar": identity.avatar,
      };

      // Optimistic UI: append a temporary message
      const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId: conversationId,
        senderId: identity.id,
        senderName: identity.name,
        senderAvatar: identity.avatar,
        text: messageText,
        timestamp: new Date(),
        isRead: false,
      };
      setMessages((prev) => [...prev, tempMessage]);

      const response = await fetch(`/api/chat/messages/${conversationId}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: messageText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.message) {
        const normalized = normalizeChatMessage(data.message);
        normalized.id = normalized.id || tempMessage.id;

        // Replace the temp message with authoritative message from server
        setMessages((prev) => {
          return prev.map((m) => (m.id === tempMessage.id ? normalized : m));
        });

        // Update timestamp ref
        lastMessageTimestampRef.current = new Date(normalized.timestamp);

        // Immediately fetch latest messages to ensure sync
        setTimeout(() => {
          loadMessages(conversationId, true);
        }, 500);
      } else {
        // If server rejected, remove temp message
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start polling for new messages when a conversation is open
  useEffect(() => {
    if (!conversationId) {
      lastMessageTimestampRef.current = null;
      return;
    }

    // Reset timestamp tracking
    lastMessageTimestampRef.current = null;

    // Initial load
    loadMessages(conversationId, true);

    // Clear any existing polling
    if (pollIntervalRef.current) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Poll every 2 seconds for better real-time feel
    const id = window.setInterval(() => {
      loadMessages(conversationId, false);
    }, 2000);
    pollIntervalRef.current = id;

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && conversationId) {
        loadMessages(conversationId, true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      lastMessageTimestampRef.current = null;
    };
  }, [conversationId, loadMessages]);
  return (
    <div className="fixed bottom-[20px] right-[20px] z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow-2xl w-[350px] h-[500px] mb-[15px] flex flex-col overflow-hidden border border-gray-200 dark:border-[#172036]">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-[15px] flex items-center justify-between">
            <div className="flex items-center gap-[10px]">
              <div className="w-[8px] h-[8px] rounded-full bg-success-500 animate-pulse"></div>
              <div>
                <h3 className="font-semibold text-sm">Chat with Admin</h3>
                <p className="text-xs text-primary-100">One-on-one chat</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="inline-block transition-all hover:bg-primary-500 p-[5px] rounded"
              aria-label="Close chat"
            >
              <i className="material-symbols-outlined text-[20px]">close</i>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-[15px] space-y-[10px]">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 text-sm">
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isCurrentUserMessage = msg.senderId === identity.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isCurrentUserMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-[10px] text-sm ${
                        isCurrentUserMessage
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 dark:bg-[#172036] text-black dark:text-gray-300"
                      }`}
                    >
                      <p className="text-xs font-semibold mb-[5px]">
                        {msg.senderName}
                      </p>
                      <p className="break-words">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-[5px]">
                        {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 dark:border-[#172036] p-[12px] flex gap-[8px]"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 rounded-md bg-gray-50 dark:bg-[#15203c] border border-gray-200 dark:border-[#172036] text-black dark:text-white px-[12px] py-[8px] text-sm focus:outline-none focus:border-primary-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-md px-[12px] py-[8px] transition-all"
            >
              <i className="material-symbols-outlined text-[18px]">send</i>
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-[56px] h-[56px] rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 animate-pulse"
        aria-label="Open chat"
        title="Chat with us"
      >
        <i className="material-symbols-outlined !text-[24px]">chat</i>
      </button>

      {/* Link to Full Chat */}
      {isOpen && (
        <div className="absolute bottom-[70px] right-0 bg-white dark:bg-[#0c1427] rounded shadow-lg p-[8px] text-center border border-gray-200 dark:border-[#172036]">
          <Link
            href={
              session
                ? "/dashboard/chats"
                : "/api/auth/signin?callbackUrl=/dashboard/chats"
            }
            className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-all whitespace-nowrap"
          >
            {session ? "View Full Chat →" : "Sign in to view full chat →"}
          </Link>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot;
