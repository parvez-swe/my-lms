"use client";

import React from "react";
import Image from "next/image";

interface ChatMessage {
  id: number;
  text: string;
  isSender: boolean;
  timestamp: string;
  avatar?: string;
  senderName?: string;
}

interface ChatbotProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = React.useState("");

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0c1427] rounded-md">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-[20px] space-y-[15px]">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-6xl mb-[15px]">💬</div>
              <p className="text-gray-500 dark:text-gray-400">
                No messages yet. Start a conversation!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-[10px] ${
                msg.isSender ? "justify-end" : "justify-start"
              }`}
            >
              {!msg.isSender && msg.avatar && (
                <Image
                  src={msg.avatar}
                  alt={msg.senderName || "chatbot"}
                  width={35}
                  height={35}
                  className="rounded-full"
                />
              )}
              <div
                className={`max-w-[70%] ${
                  msg.isSender ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block px-[15px] py-[10px] rounded-md ${
                    msg.isSender
                      ? "bg-primary-500 text-white rounded-bl-md"
                      : "bg-gray-100 dark:bg-[#15203c] text-black dark:text-white rounded-br-md"
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mt-[5px]">
                  {msg.timestamp}
                </span>
              </div>
              {msg.isSender && msg.avatar && (
                <Image
                  src={msg.avatar}
                  alt="You"
                  width={35}
                  height={35}
                  className="rounded-full"
                />
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-[10px] justify-start">
            <div className="flex items-center gap-[5px] px-[15px] py-[10px] bg-gray-100 dark:bg-[#15203c] rounded-md">
              <div className="w-[8px] h-[8px] rounded-full bg-primary-500 animate-bounce"></div>
              <div className="w-[8px] h-[8px] rounded-full bg-primary-500 animate-bounce delay-100"></div>
              <div className="w-[8px] h-[8px] rounded-full bg-primary-500 animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 dark:border-[#172036] p-[20px]">
        <div className="flex gap-[10px]">
          <div className="flex gap-[10px] items-center">
            <button
              type="button"
              className="inline-block transition-all hover:text-primary-500 text-gray-500 dark:text-gray-400"
            >
              <i className="material-symbols-outlined !text-md">
                sentiment_satisfied
              </i>
            </button>
            <button
              type="button"
              className="inline-block transition-all hover:text-primary-500 text-gray-500 dark:text-gray-400"
            >
              <i className="material-symbols-outlined !text-md">attach_file</i>
            </button>
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="w-full px-[15px] py-[10px] rounded-md bg-gray-50 dark:bg-[#15203c] border border-gray-200 dark:border-[#172036] text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-0 transition-all focus:border-primary-500 disabled:opacity-50"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              type="button"
              className="absolute right-[10px] top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-400 disabled:text-gray-300 transition-all"
            >
              <i className="material-symbols-outlined !text-[20px]">send</i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
