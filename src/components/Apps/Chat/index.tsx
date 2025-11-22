"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChatMessage, Conversation, User } from "@/types/chat";
import { useSession } from "next-auth/react";

interface ChatProps {
  selectedConversation: Conversation | null;
}

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
    senderId: message.senderId || "",
    senderName: message.senderName || "User",
    senderAvatar: message.senderAvatar || "/images/users/user31.jpg",
    text: message.text || "",
    timestamp: timestampValue,
    isRead: message.isRead ?? false,
    attachments: message.attachments || [],
  };
};

const Chat: React.FC<ChatProps> = ({
  selectedConversation: propSelectedConversation,
}) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = session?.user?.id || session?.user?.email || "admin-1";
  const currentUserName = session?.user?.name || "Admin";
  const currentUserAvatar = session?.user?.image || "/images/users/user1.jpg";
  const currentUserRole = session?.user?.role || "admin";

  const authHeaders = useCallback(() => {
    return {
      "x-user-id": currentUserId,
      "x-user-role": currentUserRole,
      "x-user-name": currentUserName,
      "x-user-avatar": currentUserAvatar,
    };
  }, [currentUserAvatar, currentUserId, currentUserName, currentUserRole]);

  // Track last message timestamp to avoid unnecessary updates
  const lastMessageTimestampRef = useRef<Date | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch messages function with deduplication
  const fetchMessages = useCallback(
    async (conversationId: string, skipTimestampCheck = false) => {
      try {
        const response = await fetch(
          `/api/chat/messages/${conversationId}?limit=50`,
          {
            headers: authHeaders(),
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const normalizedMessages = (data.messages || []).map(
          (message: unknown) => normalizeChatMessage(message)
        );

        // Check if we have new messages
        if (normalizedMessages.length > 0) {
          const latestMessage =
            normalizedMessages[normalizedMessages.length - 1];
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
              prev.forEach((msg: ChatMessage) => {
                if (!msg.id.startsWith("temp-")) {
                  messageMap.set(msg.id, msg);
                }
              });

              // Add new messages (will overwrite duplicates)
              normalizedMessages.forEach((msg: ChatMessage) => {
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
    [authHeaders]
  );

  // Load messages when conversation changes and poll for new ones
  useEffect(() => {
    if (propSelectedConversation) {
      let isMounted = true;

      // Clear any existing polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Reset timestamp tracking
      lastMessageTimestampRef.current = null;

      // Initial load
      setIsLoading(true);
      fetchMessages(propSelectedConversation.id, true).finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

      // Polling every 2 seconds for better real-time feel
      pollIntervalRef.current = setInterval(() => {
        if (isMounted && propSelectedConversation) {
          fetchMessages(propSelectedConversation.id, false);
        }
      }, 2000);

      // Refresh when tab becomes visible
      const handleVisibilityChange = () => {
        if (
          document.visibilityState === "visible" &&
          isMounted &&
          propSelectedConversation
        ) {
          fetchMessages(propSelectedConversation.id, true);
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        isMounted = false;
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        lastMessageTimestampRef.current = null;
      };
    } else {
      setMessages([]);
      lastMessageTimestampRef.current = null;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [propSelectedConversation, fetchMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    console.log(`Selected option: ${option}`);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputValue.trim() || !propSelectedConversation) return;

    const messageText = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Optimistic UI: add temporary message immediately
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: propSelectedConversation.id,
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      text: messageText,
      timestamp: new Date(),
      isRead: false,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await fetch(
        `/api/chat/messages/${propSelectedConversation.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({ text: messageText }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.message) {
        const normalized = normalizeChatMessage(data.message);

        // Replace temp message with real one
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempMessage.id);
          return [...filtered, normalized];
        });

        // Update timestamp ref
        lastMessageTimestampRef.current = new Date(normalized.timestamp);

        // Immediately fetch latest messages to ensure sync
        setTimeout(() => {
          fetchMessages(propSelectedConversation.id, true);
        }, 500);
      } else {
        // Remove temp message if send failed
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get the other participant's info
  const getOtherParticipant = (): Partial<User> | null => {
    if (!propSelectedConversation) return null;

    const participantIndex = propSelectedConversation.participantIds.findIndex(
      (participantId) => participantId !== currentUserId
    );

    if (participantIndex === -1) {
      return null;
    }

    return {
      id: propSelectedConversation.participantIds[participantIndex],
      name: propSelectedConversation.participantNames[participantIndex],
      email: "",
      avatar:
        propSelectedConversation.participantAvatars?.[participantIndex] ||
        "/images/users/user31.jpg",
      role: propSelectedConversation.participantRoles[participantIndex],
      status: "online",
      lastSeen: new Date(),
    };
  };

  const otherParticipant = getOtherParticipant();

  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        {!propSelectedConversation ? (
          <div className="h-[700px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-[20px]">💬</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Select a conversation from the sidebar to start chatting
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-[10px]">
                Or create a new conversation with a visitor/student
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="trezo-card-header sm:flex items-center justify-between mb-[20px]">
              <div className="trezo-card-title">
                <div className="flex items-center">
                  <div className="relative ltr:mr-[15px] rtl:ml-[15px]">
                    <Image
                      src={
                        otherParticipant?.avatar || "/images/users/user31.jpg"
                      }
                      alt="user-image"
                      className="rounded-full w-[75px]"
                      width={75}
                      height={75}
                    />
                    <span
                      className={`absolute w-[10px] h-[10px] rounded-full border-[2px] border-white dark:border-[#0c1427] bottom-[5px] ltr:right-[5px] rtl:left-[5px] ${
                        otherParticipant?.status === "online"
                          ? "bg-success-500"
                          : otherParticipant?.status === "away"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }`}
                    ></span>
                  </div>
                  <div>
                    <span className="font-semibold block text-black dark:text-white text-md">
                      {otherParticipant?.name || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-[2px] block">
                      {otherParticipant?.status === "online"
                        ? "Active Now"
                        : otherParticipant?.status === "away"
                        ? "Away"
                        : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="trezo-card-subtitle mt-[15px] sm:mt-0 flex items-center gap-[15px]">
                <button
                  type="button"
                  className="inline-block transition-all hover:text-primary-500"
                  title="Start a call"
                >
                  <i className="material-symbols-outlined !text-md">call</i>
                </button>

                <button
                  type="button"
                  className="inline-block transition-all hover:text-primary-500"
                  title="Start a video call"
                >
                  <i className="material-symbols-outlined !text-md">videocam</i>
                </button>

                <Menu as="div" className="trezo-card-dropdown relative">
                  <MenuButton className="trezo-card-dropdown-btn inline-block transition-all text-[20px] text-gray-500 dark:text-gray-400 relative -top-px leading-none hover:text-primary-500">
                    <i className="ri-more-fill"></i>
                  </MenuButton>

                  <MenuItems
                    transition
                    className="transition-all bg-white shadow-3xl rounded-md top-full py-[15px] absolute ltr:right-0 rtl:left-0 w-[195px] z-[50] dark:bg-dark dark:shadow-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                  >
                    {["Mute Chat", "Delete", "Block"].map((option) => (
                      <MenuItem
                        key={option}
                        as="div"
                        className={`block w-full transition-all text-black cursor-pointer ltr:text-left rtl:text-right relative py-[8px] px-[20px] hover:bg-gray-50 dark:text-white dark:hover:bg-black ${
                          selectedOption === option ? "font-semibold" : ""
                        }`}
                        onClick={() => handleSelect(option)}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </div>
            </div>

            <div className="trezo-card-content">
              <div className="border-t border-gray-100 dark:border-[#172036] mt-[20px] mb-[18px]"></div>

              <div className="chat-body h-[500px] overflow-y-auto ltr:-mr-[25px] rtl:-ml-[25px]">
                <ul className="flex flex-col gap-[15px] ltr:pl-[25px] rtl:pr-[25px] pb-[20px]">
                  {messages.length === 0 ? (
                    <li className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400">
                        No messages yet. Start the conversation!
                      </p>
                    </li>
                  ) : (
                    messages.map((msg) => {
                      const isSender = msg.senderId === currentUserId;
                      return (
                        <li
                          key={msg.id}
                          className={`flex ${
                            isSender ? "justify-end" : "justify-start"
                          } gap-[10px]`}
                        >
                          {!isSender && (
                            <Image
                              src={msg.senderAvatar}
                              alt={msg.senderName}
                              className="rounded-full w-[35px] h-[35px]"
                              width={35}
                              height={35}
                            />
                          )}
                          <div
                            className={`max-w-[70%] ${
                              isSender ? "text-right" : "text-left"
                            }`}
                          >
                            <div
                              className={`py-[10px] px-[15px] inline-block rounded-md break-words ${
                                isSender
                                  ? "bg-primary-500 text-white ltr:rounded-l-md rtl:rounded-r-md"
                                  : "bg-gray-50 dark:bg-[#15203c] text-black dark:text-white ltr:rounded-r-md rtl:rounded-l-md"
                              }`}
                            >
                              <p>{msg.text}</p>
                            </div>
                            <span className="block text-xs mt-[7px] text-gray-500 dark:text-gray-400">
                              {new Date(msg.timestamp).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </span>
                          </div>
                          {isSender && (
                            <Image
                              src={currentUserAvatar}
                              alt="You"
                              className="rounded-full w-[35px] h-[35px]"
                              width={35}
                              height={35}
                            />
                          )}
                        </li>
                      );
                    })
                  )}
                  {isLoading && (
                    <li className="flex justify-start gap-[10px]">
                      <div className="flex items-center gap-[5px] px-[15px] py-[10px] bg-gray-50 dark:bg-[#15203c] rounded-md">
                        <div className="w-[8px] h-[8px] rounded-full bg-primary-500 animate-bounce"></div>
                        <div className="w-[8px] h-[8px] rounded-full bg-primary-500 animate-bounce delay-100"></div>
                        <div className="w-[8px] h-[8px] rounded-full bg-primary-500 animate-bounce delay-200"></div>
                      </div>
                    </li>
                  )}
                  <div ref={messagesEndRef}></div>
                </ul>
              </div>

              <form
                onSubmit={handleSendMessage}
                className="md:flex gap-[20px] rounded-md p-[20px] bg-gray-50 dark:bg-[#15203c] mt-[20px]"
              >
                <div className="relative flex gap-[10px] items-center top-[2px]">
                  <button
                    className="inline-block transition-all hover:text-primary-500"
                    type="button"
                  >
                    <i className="material-symbols-outlined !text-md">
                      sentiment_satisfied
                    </i>
                  </button>
                  <button
                    className="inline-block transition-all hover:text-primary-500"
                    type="button"
                  >
                    <i className="material-symbols-outlined !text-md">
                      attach_file
                    </i>
                  </button>
                  <button
                    className="inline-block transition-all hover:text-primary-500"
                    type="button"
                  >
                    <i className="material-symbols-outlined !text-md">
                      mic_none
                    </i>
                  </button>
                  <button
                    className="inline-block transition-all hover:text-primary-500"
                    type="button"
                  >
                    <i className="material-symbols-outlined !text-md">image</i>
                  </button>
                </div>
                <div className="relative mt-[15px] md:mt-0 md:ltr:pr-[70px] md:rtl:pl-[70px] flex-auto">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="block w-full rounded-md bg-white dark:bg-[#0c1427] px-[15px] h-[55px] text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-0 disabled:opacity-50 transition-all"
                    placeholder="Type your message"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="md:absolute flex items-center justify-center ltr:right-0 rtl:left-0 rounded-sm transition-all bg-primary-500 text-white hover:bg-primary-400 disabled:bg-gray-300 disabled:hover:bg-gray-300 md:top-1/2 md:-translate-y-1/2 w-[55px] h-[55px] mt-[15px] md:mt-0"
                  >
                    <i className="material-symbols-outlined">send</i>
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Chat;
