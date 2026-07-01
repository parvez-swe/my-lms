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
import { Bot, Headphones, Loader2 } from "lucide-react";
import { ChatMessage, Conversation } from "@/types/chat";
import { getChatbotResponse, getAiSessionId } from "@/services/chatbotService";
import { usePusherChat } from "@/hooks/usePusherChat";

type ChatMode = "ai" | "live";

interface AIMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const generateVisitorId = (): string => {
  if (typeof window === "undefined") return "visitor-unknown";

  let visitorId = localStorage.getItem("visitor_id");
  if (!visitorId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const userAgentHash =
      typeof navigator !== "undefined"
        ? btoa(navigator.userAgent).substring(0, 8)
        : "unknown";
    visitorId = `visitor-${timestamp}-${random}-${userAgentHash}`;
    localStorage.setItem("visitor_id", visitorId);
    localStorage.setItem("visitor_id_created", timestamp.toString());
  }
  return visitorId;
};

const normalizeChatMessage = (raw: unknown): ChatMessage => {
  const message = raw as Partial<ChatMessage> & { timestamp?: string | Date };
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
  const [mode, setMode] = useState<ChatMode>("ai");

  // AI state
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      text: "Hi! I'm your AI assistant. Ask me about courses, enrollment, or pricing. Need a human? Switch to Live Support.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Live support state
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [inputValue, setInputValue] = useState("");
  const [visitorId] = useState(() => generateVisitorId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const lastMessageTimestampRef = useRef<Date | null>(null);

  const identity = useMemo(() => {
    if (session?.user) {
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

  const authHeaders = useCallback((): Record<string, string> => {
    return {
      "x-user-id": identity.id,
      "x-user-role": identity.role,
      "x-user-name": identity.name,
      "x-user-avatar": identity.avatar,
    };
  }, [identity]);

  const mergeLiveMessage = useCallback((incoming: ChatMessage) => {
    setLiveMessages((prev) => {
      if (prev.some((m) => m.id === incoming.id)) return prev;
      const filtered = prev.filter((m) => !m.id.startsWith("temp-"));
      return [...filtered, incoming].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });
    lastMessageTimestampRef.current = new Date(incoming.timestamp);
  }, []);

  usePusherChat(conversationId, identity, mergeLiveMessage);

  const loadLiveMessages = useCallback(
    async (convId: string, force = false) => {
      try {
        const response = await fetch(`/api/chat/messages/${convId}?limit=50`, {
          headers: authHeaders(),
          cache: "no-store",
        });

        if (response.status === 403) {
          setConversationId(null);
          setLiveMessages([]);
          return;
        }
        if (!response.ok) return;

        const data = await response.json();
        const msgs = (data.messages || []).map(normalizeChatMessage);

        if (msgs.length === 0) {
          if (force) setLiveMessages([]);
          return;
        }

        const latest = msgs[msgs.length - 1];
        const latestTs = new Date(latest.timestamp);

        if (
          force ||
          !lastMessageTimestampRef.current ||
          latestTs > lastMessageTimestampRef.current
        ) {
          setLiveMessages(msgs);
          lastMessageTimestampRef.current = latestTs;
        }
      } catch (error) {
        console.error("Error loading live messages:", error);
      }
    },
    [authHeaders]
  );

  const initializeLiveConversation = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/conversations", {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (!response.ok) return;

      const data = await response.json();
      const userConversations = (data.conversations || []).filter(
        (conv: Conversation) =>
          conv.participants?.includes(identity.id)
      );

      if (userConversations.length > 0) {
        const conv = userConversations[0];
        setConversationId(conv.id);
        await loadLiveMessages(conv.id, true);
        return;
      }

      const adminRes = await fetch("/api/chat/get-admin");
      const adminUser = await adminRes.json();

      const createRes = await fetch("/api/chat/create-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          recipientId: adminUser.id,
          recipientName: adminUser.name || "Admin Support",
          recipientAvatar: adminUser.avatar || "/images/users/user31.jpg",
          recipientRole: adminUser.role || "admin",
        }),
      });

      const createData = await createRes.json();
      if (createData.success) {
        setConversationId(createData.conversation.id);
        setLiveMessages([]);
      }
    } catch (error) {
      console.error("Error initializing live conversation:", error);
    }
  }, [authHeaders, identity.id, loadLiveMessages]);

  useEffect(() => {
    if (status === "loading" || mode !== "live") return;
    setConversationId(null);
    setLiveMessages([]);
    initializeLiveConversation();
  }, [initializeLiveConversation, mode, status]);

  useEffect(() => {
    if (!conversationId || mode !== "live") return;

    loadLiveMessages(conversationId, true);

    if (pollIntervalRef.current) {
      window.clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = window.setInterval(() => {
      loadLiveMessages(conversationId, false);
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [conversationId, loadLiveMessages, mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, liveMessages, mode]);

  const handleSendAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || aiLoading) return;

    const text = inputValue.trim();
    setInputValue("");
    setAiLoading(true);

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      text,
      isUser: true,
      timestamp: new Date(),
    };
    setAiMessages((prev) => [...prev, userMsg]);

    try {
      const history = aiMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.isUser ? ("user" as const) : ("assistant" as const),
          content: m.text,
        }));

      const response = await getChatbotResponse(
        text,
        history,
        getAiSessionId()
      );
      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          text: response.message,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId || liveLoading) return;

    const messageText = inputValue.trim();
    setInputValue("");
    setLiveLoading(true);

    const tempId = `temp-${Date.now()}`;
    const tempMessage: ChatMessage = {
      id: tempId,
      conversationId,
      senderId: identity.id,
      senderName: identity.name,
      senderAvatar: identity.avatar,
      text: messageText,
      timestamp: new Date(),
      isRead: false,
    };
    setLiveMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await fetch(`/api/chat/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ text: messageText }),
      });

      if (!response.ok) throw new Error("Send failed");

      const data = await response.json();
      if (data.success && data.message) {
        const normalized = normalizeChatMessage(data.message);
        setLiveMessages((prev) =>
          prev.map((m) => (m.id === tempId ? normalized : m))
        );
        lastMessageTimestampRef.current = new Date(normalized.timestamp);
      } else {
        setLiveMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch (error) {
      console.error("Error sending live message:", error);
      setLiveMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setLiveLoading(false);
    }
  };

  const isLoading = mode === "ai" ? aiLoading : liveLoading;
  const handleSubmit = mode === "ai" ? handleSendAI : handleSendLive;

  return (
    <div className="fixed bottom-[20px] right-[20px] z-50">
      {isOpen && (
        <div className="mb-[15px] flex h-[520px] w-[360px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-[#172036] dark:bg-[#0c1427]">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-[12px] text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Learning Platform</h3>
                <p className="text-xs text-primary-100">
                  {mode === "ai" ? "AI Assistant" : "Live Support"}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-[4px] transition-all hover:bg-primary-500/50"
                aria-label="Close chat"
              >
                <i className="material-symbols-outlined text-[20px]">close</i>
              </button>
            </div>

            {/* Mode tabs */}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setMode("ai")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                  mode === "ai"
                    ? "bg-white text-primary-600"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                <Bot size={14} />
                AI Assistant
              </button>
              <button
                type="button"
                onClick={() => setMode("live")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                  mode === "live"
                    ? "bg-white text-primary-600"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                <Headphones size={14} />
                Live Support
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-[10px] overflow-y-auto p-[15px]">
            {mode === "ai" ? (
              aiMessages.length === 0 ? (
                <p className="text-center text-sm text-gray-500">
                  Ask me anything about courses!
                </p>
              ) : (
                aiMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-[10px] text-sm ${
                        msg.isUser
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 text-black dark:bg-[#172036] dark:text-gray-300"
                      }`}
                    >
                      {!msg.isUser && (
                        <p className="mb-1 text-xs font-semibold text-primary-500">
                          AI Assistant
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                  </div>
                ))
              )
            ) : liveMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-500 dark:text-gray-400">
                <Headphones size={28} className="mb-2 text-primary-500" />
                <p>Connect with our support team.</p>
                <p className="mt-1 text-xs">Messages appear in the admin dashboard.</p>
              </div>
            ) : (
              liveMessages.map((msg) => {
                const isMine = msg.senderId === identity.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-[10px] text-sm ${
                        isMine
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 dark:bg-[#172036] dark:text-gray-300"
                      }`}
                    >
                      <p className="mb-1 text-xs font-semibold">{msg.senderName}</p>
                      <p className="break-words">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs dark:bg-[#172036]">
                  <Loader2 size={14} className="animate-spin" />
                  {mode === "ai" ? "Thinking..." : "Sending..."}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-[8px] border-t border-gray-200 p-[12px] dark:border-[#172036]"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                mode === "ai"
                  ? "Ask about courses..."
                  : "Message support team..."
              }
              disabled={isLoading || (mode === "live" && !conversationId)}
              className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-[12px] py-[8px] text-sm text-black focus:border-primary-500 focus:outline-none disabled:opacity-50 dark:border-[#172036] dark:bg-[#15203c] dark:text-white"
            />
            <button
              type="submit"
              disabled={
                isLoading ||
                !inputValue.trim() ||
                (mode === "live" && !conversationId)
              }
              className="rounded-md bg-primary-500 px-[12px] py-[8px] text-white transition-all hover:bg-primary-600 disabled:opacity-50"
            >
              <i className="material-symbols-outlined text-[18px]">send</i>
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-[56px] w-[56px] animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label="Open chat"
        title="Chat with us"
      >
        <i className="material-symbols-outlined !text-[24px]">chat</i>
      </button>

      {isOpen && mode === "live" && (
        <div className="absolute bottom-[70px] right-0 rounded border border-gray-200 bg-white p-[8px] text-center shadow-lg dark:border-[#172036] dark:bg-[#0c1427]">
          <Link
            href={
              session
                ? "/dashboard/chats"
                : "/auth/signin?callbackUrl=/dashboard/chats"
            }
            className="whitespace-nowrap text-xs font-medium text-primary-500 transition-all hover:text-primary-600"
          >
            {session ? "Admin dashboard →" : "Sign in for full chat →"}
          </Link>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot;
