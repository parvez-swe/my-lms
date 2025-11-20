"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Chatbot from "@/components/Chatbot";
import { getChatbotResponse } from "@/services/chatbotService";

interface ChatMessage {
  id: number;
  text: string;
  isSender: boolean;
  timestamp: string;
  avatar?: string;
  senderName?: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hello! 👋 I'm your AI assistant. How can I help you today?",
      isSender: false,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      avatar: "/images/users/user31.jpg",
      senderName: "Assistant",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (userMessage: string) => {
    // Add user message
    const userMessageObj: ChatMessage = {
      id: messages.length + 1,
      text: userMessage,
      isSender: true,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      avatar: "/images/users/user1.jpg",
      senderName: "You",
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setIsLoading(true);

    try {
      // Get bot response
      const response = await getChatbotResponse(userMessage);

      // Add bot response
      const botMessageObj: ChatMessage = {
        id: messages.length + 2,
        text: response.message,
        isSender: false,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        avatar: "/images/users/user31.jpg",
        senderName: "Assistant",
      };

      setMessages((prev) => [...prev, botMessageObj]);
    } catch (error) {
      console.error("Error getting response:", error);
      const errorMessageObj: ChatMessage = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error. Please try again.",
        isSender: false,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        avatar: "/images/users/user31.jpg",
        senderName: "Assistant",
      };
      setMessages((prev) => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h1 className="!mb-0 text-2xl font-semibold">Chat Assistant</h1>
        <ol className="breadcrumb mt-[12px] md:mt-0">
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              href="/"
              className="inline-block relative ltr:pl-[22px] rtl:pr-[22px] transition-all hover:text-primary-500"
            >
              <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 !text-lg -mt-px text-primary-500 top-1/2 -translate-y-1/2">
                home
              </i>
              Home
            </Link>
          </li>
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            Chat Assistant
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-1 gap-[25px]">
        <div className="trezo-card bg-white dark:bg-[#0c1427] rounded-md overflow-hidden">
          <div className="h-[600px]">
            <Chatbot
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Features Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[25px]">
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="flex items-start gap-[15px]">
              <div className="inline-flex items-center justify-center w-[50px] h-[50px] rounded-md bg-primary-50 dark:bg-primary-900">
                <i className="material-symbols-outlined text-primary-500 !text-[28px]">
                  help
                </i>
              </div>
              <div>
                <h5 className="font-semibold text-black dark:text-white mb-[5px]">
                  Ask Questions
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ask about our courses, pricing, enrollment, and more.
                </p>
              </div>
            </div>
          </div>

          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="flex items-start gap-[15px]">
              <div className="inline-flex items-center justify-center w-[50px] h-[50px] rounded-md bg-primary-50 dark:bg-primary-900">
                <i className="material-symbols-outlined text-primary-500 !text-[28px]">
                  school
                </i>
              </div>
              <div>
                <h5 className="font-semibold text-black dark:text-white mb-[5px]">
                  Course Info
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get information about our course offerings and curriculum.
                </p>
              </div>
            </div>
          </div>

          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="flex items-start gap-[15px]">
              <div className="inline-flex items-center justify-center w-[50px] h-[50px] rounded-md bg-primary-50 dark:bg-primary-900">
                <i className="material-symbols-outlined text-primary-500 !text-[28px]">
                  support_agent
                </i>
              </div>
              <div>
                <h5 className="font-semibold text-black dark:text-white mb-[5px]">
                  Instant Support
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get instant responses to your questions 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
