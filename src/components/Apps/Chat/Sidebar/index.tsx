"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Image from "next/image";
import { Conversation, User } from "@/types/chat";
import { useSession } from "next-auth/react";

interface SidebarProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversation: Conversation | null;
}

const normalizeConversation = (raw: Conversation): Conversation => {
  return {
    ...raw,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
    lastMessageTime: raw.lastMessageTime
      ? new Date(raw.lastMessageTime)
      : undefined,
  };
};

const Sidebar: React.FC<SidebarProps> = ({
  onSelectConversation,
  selectedConversation,
}) => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentUserId =
    session?.user?.id || session?.user?.email || "admin-1";
  const currentUserRole = session?.user?.role || "admin";
  const currentUserName = session?.user?.name || "Admin";
  const currentUserAvatar =
    session?.user?.image || "/images/users/user1.jpg";

  const authHeaders = useCallback(() => {
    return {
      "x-user-id": currentUserId,
      "x-user-role": currentUserRole,
      "x-user-name": currentUserName,
      "x-user-avatar": currentUserAvatar,
    };
  }, [currentUserAvatar, currentUserId, currentUserName, currentUserRole]);

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/conversations", {
        headers: authHeaders(),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const normalized = (data.conversations || []).map((conv: Conversation) =>
        normalizeConversation(conv)
      );

      // Update conversations, preserving order and avoiding unnecessary re-renders
      setConversations((prev) => {
        // If conversations haven't changed, don't update
        if (
          prev.length === normalized.length &&
          prev.every(
            (p, i) =>
              p.id === normalized[i]?.id &&
              p.updatedAt?.getTime() === normalized[i]?.updatedAt?.getTime() &&
              p.unreadCount === normalized[i]?.unreadCount
          )
        ) {
          return prev;
        }
        return normalized;
      });
    } catch (error) {
      console.error("Error loading conversations:", error);
      // Don't throw - allow polling to continue
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/users", {
        headers: authHeaders(),
        cache: "no-store",
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  }, [authHeaders]);

  // Load conversations on mount and poll periodically
  useEffect(() => {
    loadConversations();
    loadUsers();

    // Poll every 3 seconds for conversation updates (less frequent than messages)
    const intervalId = setInterval(() => {
      loadConversations();
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [loadConversations, loadUsers]);

  // Keep selected conversation in sync when refreshed
  useEffect(() => {
    if (!selectedConversation) return;

    const updated = conversations.find(
      (conversation) => conversation.id === selectedConversation.id
    );

    if (updated) {
      // Update if conversation data changed (last message, unread count, etc.)
      if (
        updated.updatedAt?.getTime() !== selectedConversation.updatedAt?.getTime() ||
        updated.lastMessage !== selectedConversation.lastMessage ||
        updated.unreadCount !== selectedConversation.unreadCount ||
        updated.lastMessageTime?.getTime() !== selectedConversation.lastMessageTime?.getTime()
      ) {
        onSelectConversation(updated);
      }
    }
  }, [conversations, onSelectConversation, selectedConversation]);

  const handleStartConversation = async (user: User) => {
    try {
      const response = await fetch("/api/chat/create-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          recipientId: user.id,
          recipientName: user.name,
          recipientAvatar: user.avatar,
          recipientRole: user.role,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const normalizedConversation = normalizeConversation(data.conversation);
        setConversations((prev) => {
          const exists = prev.some(
            (conv) => conv.id === normalizedConversation.id
          );
          return exists ? prev : [normalizedConversation, ...prev];
        });
        onSelectConversation(normalizedConversation);
        setActiveTab(0); // Switch to All Messages tab
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) =>
      conv.participantNames.some((name) =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [conversations, searchQuery]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  const getConversationDisplay = (conversation: Conversation) => {
    const participantIndex = conversation.participantIds.findIndex(
      (participantId) => participantId !== currentUserId
    );

    const name =
      participantIndex >= 0
        ? conversation.participantNames[participantIndex]
        : conversation.participantNames[0];

    const avatar =
      (participantIndex >= 0 &&
        conversation.participantAvatars?.[participantIndex]) ||
      "/images/users/user31.jpg";

    return { name, avatar };
  };

  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] flex items-center justify-between">
          <div className="trezo-card-title">
            <h5 className="!mb-0 !text-md !font-medium">Messages</h5>
          </div>
        </div>

        <div className="trezo-card-content">
          <form className="relative mb-[20px]">
            <label className="absolute ltr:left-[13px] rtl:right-[13px] mt-[2px] text-black dark:text-white top-1/2 -translate-y-1/2">
              <i className="material-symbols-outlined !text-lg">search</i>
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md text-black dark:text-white bg-gray-50 dark:bg-[#15203c] border border-gray-50 dark:border-[#15203c] focus:border-primary-500 h-[40px] outline-0 transition-all text-xs placeholder:text-gray-500 dark:placeholder:text-gray-400 ltr:pl-[38px] rtl:pr-[38px] ltr:pr-[15px] rtl:pl-[15px]"
              placeholder="Search conversations..."
            />
          </form>

          <div className="trezo-tabs">
            {/* Tabs navs */}
            <ul className="chat-sidebar-navs flex border-b border-gray-100 dark:border-[#172036] mb-[20px]">
              <li className="nav-item ltr:mr-[19px] rtl:ml-[19px] xl:ltr:mr-[30px] xl:rtl:ml-[30px] ltr:last:mr-0 rtl:last:ml-0">
                <button
                  onClick={() => setActiveTab(0)}
                  className={`nav-link font-medium relative pb-[8px] transition-all ${
                    activeTab === 0 ? "active text-primary-500" : ""
                  }`}
                >
                  Messages ({conversations.length})
                </button>
              </li>
              <li className="nav-item ltr:mr-[19px] rtl:ml-[19px] xl:ltr:mr-[30px] xl:rtl:ml-[30px] ltr:last:mr-0 rtl:last:ml-0">
                <button
                  onClick={() => setActiveTab(1)}
                  className={`nav-link font-medium relative pb-[8px] transition-all ${
                    activeTab === 1 ? "active text-primary-500" : ""
                  }`}
                >
                  Users ({users.length})
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            <div className="chat-sidebar-tab-content">
              {/* All Conversations */}
              {activeTab === 0 && (
                <div className="ltr:-mr-[20px] rtl:-ml-[20px] md:ltr:-mr-[25px] md:rtl:-ml-[25px]">
                  <div className="overflow-y-auto h-[400px] md:h-[550px] lg:h-[700px] ltr:pr-[20px] rtl:pl-[20px] md:ltr:pr-[25px] md:rtl:pl-[25px]">
                    {filteredConversations.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                          No conversations yet. <br /> Start a new conversation!
                        </p>
                      </div>
                    ) : (
                      <>
                        {isLoading && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-[10px]">
                            Refreshing conversations...
                          </p>
                        )}
                        {filteredConversations.map((conv) => {
                        const display = getConversationDisplay(conv);
                        return (
                          <div
                            key={conv.id}
                            onClick={() => onSelectConversation(conv)}
                            className={`flex items-center justify-between mb-[15px] pb-[15px] px-[12px] py-[10px] border border-transparent rounded-md cursor-pointer transition-all ${
                              selectedConversation?.id === conv.id
                                ? "bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700"
                                : "hover:bg-gray-50 dark:hover:bg-[#172036]"
                            } last:border-0 last:pb-0 last:mb-0`}
                          >
                            <div className="flex items-center gap-[12px] flex-1 min-w-0">
                              <Image
                                src={display.avatar}
                                alt={display.name}
                                className="rounded-full w-[40px] h-[40px] flex-shrink-0"
                                width={40}
                                height={40}
                              />
                              <div className="flex-1 min-w-0">
                                <h6 className="font-semibold text-sm text-black dark:text-white truncate">
                                  {display.name}
                                </h6>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {conv.lastMessage || "No messages yet"}
                                </p>
                              </div>
                            </div>
                            {conv.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center bg-primary-500 text-white text-xs font-medium rounded-full w-[20px] h-[20px] flex-shrink-0">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Users List */}
              {activeTab === 1 && (
                <div className="ltr:-mr-[20px] rtl:-ml-[20px] md:ltr:-mr-[25px] md:rtl:-ml-[25px]">
                  <div className="overflow-y-auto h-[400px] md:h-[550px] lg:h-[700px] ltr:pr-[20px] rtl:pl-[20px] md:ltr:pr-[25px] md:rtl:pl-[25px]">
                    {filteredUsers.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No users found
                        </p>
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between mb-[15px] pb-[15px] px-[12px] py-[10px] border border-transparent rounded-md hover:bg-gray-50 dark:hover:bg-[#172036] transition-all"
                        >
                          <div className="flex items-center gap-[12px]">
                            <div className="relative">
                              <Image
                                src={user.avatar}
                                alt={user.name}
                                className="rounded-full w-[40px] h-[40px]"
                                width={40}
                                height={40}
                              />
                              <span
                                className={`absolute w-[10px] h-[10px] rounded-full border-[2px] border-white dark:border-[#0c1427] bottom-0 ltr:right-0 rtl:left-0 ${
                                  user.status === "online"
                                    ? "bg-success-500"
                                    : user.status === "away"
                                    ? "bg-yellow-500"
                                    : "bg-gray-400"
                                }`}
                              ></span>
                            </div>
                            <div>
                              <h6 className="font-semibold text-sm text-black dark:text-white">
                                {user.name}
                              </h6>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.role}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleStartConversation(user)}
                            className="px-[12px] py-[6px] bg-primary-500 text-white text-xs font-medium rounded-md hover:bg-primary-400 transition-all"
                          >
                            Chat
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
