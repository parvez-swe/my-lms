"use client";

import React, { useEffect, useState } from "react";
import { Bot, MessageSquare, User } from "lucide-react";
import { AiChatSessionDocument } from "@/models/AiChatSession";

interface AiMessage {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  provider?: string;
  createdAt: string;
}

export default function AiChatsPage() {
  const [sessions, setSessions] = useState<AiChatSessionDocument[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetch("/api/ai-chats")
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          setSessions(result.data);
          if (result.data.length > 0) {
            setSelectedId(result.data[0].sessionId);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingMessages(true);
    fetch(`/api/ai-chats?sessionId=${encodeURIComponent(selectedId)}`)
      .then((r) => r.json())
      .then((result) => {
        if (result.success) setMessages(result.data);
      })
      .finally(() => setLoadingMessages(false));
  }, [selectedId]);

  const selected = sessions.find((s) => s.sessionId === selectedId);

  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-6">
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-0 rounded-md overflow-hidden lg:col-span-1">
        <div className="p-5 border-b border-gray-100 dark:border-[#172036]">
          <h5 className="!mb-1 flex items-center gap-2">
            <Bot size={20} className="text-primary-500" />
            AI Conversations
          </h5>
          <p className="text-sm text-gray-500">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {loading ? (
            <p className="p-5 text-gray-500 text-sm">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="p-5 text-gray-500 text-sm">No AI conversations yet.</p>
          ) : (
            sessions.map((session) => (
              <button
                key={session.sessionId}
                type="button"
                onClick={() => setSelectedId(session.sessionId)}
                className={`w-full text-left p-4 border-b border-gray-50 dark:border-[#172036] transition hover:bg-gray-50 dark:hover:bg-[#15203c] ${
                  selectedId === session.sessionId
                    ? "bg-primary-50 dark:bg-[#15203c]"
                    : ""
                }`}
              >
                <p className="font-medium text-sm text-black dark:text-white truncate">
                  {session.userName || session.userEmail || "Anonymous visitor"}
                </p>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {session.lastMessage || "No messages"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {session.messageCount} messages ·{" "}
                  {new Date(session.updatedAt).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] rounded-md lg:col-span-2 mt-6 lg:mt-0">
        <div className="p-5 border-b border-gray-100 dark:border-[#172036]">
          {selected ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-[#15203c] flex items-center justify-center">
                <User size={18} className="text-primary-500" />
              </div>
              <div>
                <h5 className="!mb-0">
                  {selected.userName || selected.userEmail || "Anonymous"}
                </h5>
                <p className="text-xs text-gray-500">
                  Session {selected.sessionId.slice(0, 12)}...
                </p>
              </div>
            </div>
          ) : (
            <h5 className="!mb-0">Select a conversation</h5>
          )}
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {loadingMessages ? (
            <p className="text-gray-500 text-sm">Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-40" />
              <p>Select a session to view the transcript</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={msg._id || i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 dark:bg-[#15203c] text-black dark:text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === "user" ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString()}
                    {msg.provider && ` · ${msg.provider}`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
