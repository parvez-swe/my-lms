"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatTimeAgo } from "@/lib/timeAgo";
import { NotificationType } from "@/models/Notification";

interface NotificationItem {
  _id: string;
  type: NotificationType;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<NotificationType, { icon: string; color: string }> = {
  enrollment_approved: { icon: "check_circle", color: "text-green-600" },
  enrollment_rejected: { icon: "cancel", color: "text-red-500" },
  course_update: { icon: "school", color: "text-primary-500" },
  new_message: { icon: "mail", color: "text-[#39b2de]" },
};

interface NotificationBellProps {
  viewAllHref?: string;
  dropdownLimit?: number;
  className?: string;
}

export default function NotificationBell({
  viewAllHref = "/profile?tab=notifications",
  dropdownLimit = 5,
  className = "",
}: NotificationBellProps) {
  const { status } = useSession();
  const [active, setActive] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (status !== "authenticated") return;

    try {
      const res = await fetch("/api/notifications");
      const result = await res.json();
      if (result.success) {
        setNotifications(result.data || []);
        setUnreadCount(result.unreadCount ?? 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [status]);

  useEffect(() => {
    fetchNotifications();
    if (status !== "authenticated") return;

    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [status, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  if (status !== "authenticated") return null;

  const unreadNotifications = notifications
    .filter((n) => !n.read)
    .slice(0, dropdownLimit);

  return (
    <div
      className={`relative notifications-menu ${className}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setActive((prev) => !prev)}
        className={`leading-none inline-block transition-all relative top-[2px] hover:text-primary-500 ${
          active ? "active" : ""
        }`}
        aria-label="Notifications"
      >
        <i className="material-symbols-outlined !text-[22px] md:!text-[24px]">
          notifications
        </i>
        {unreadCount > 0 && (
          <span className="top-[3px] ltr:right-[4px] rtl:left-[4px] min-w-[16px] h-[16px] px-1 rounded-full absolute bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {active && (
        <div className="notifications-menu-dropdown bg-white dark:bg-[#0c1427] transition-all shadow-3xl dark:shadow-none py-[17px] absolute mt-[17px] md:mt-[20px] w-[290px] md:w-[350px] z-[60] top-full ltr:right-0 rtl:left-0 rounded-md">
          <div className="flex items-center justify-between px-[20px] pb-[17px]">
            <span className="font-semibold text-black dark:text-white text-[15px]">
              Notifications{" "}
              {unreadCount > 0 && (
                <span className="text-gray-500 dark:text-gray-400 font-normal text-base">
                  ({unreadCount} unread)
                </span>
              )}
            </span>
          </div>

          {unreadNotifications.length === 0 ? (
            <p className="px-[20px] py-6 text-sm text-gray-500 text-center">
              No unread notifications
            </p>
          ) : (
            <ul className="mb-[18px]">
              {unreadNotifications.map((notification) => {
                const meta = TYPE_ICONS[notification.type];
                return (
                  <li
                    key={notification._id}
                    className="relative border-b border-gray-100 dark:border-[#172036] border-dashed py-[17px] ltr:pl-[75px] ltr:pr-[20px] rtl:pr-[75px] rtl:pl-[20px] first:border-t first:border-gray-100 dark:first:border-[#172036]"
                  >
                    <div
                      className={`rounded-full flex items-center justify-center absolute text-center top-1/2 -translate-y-1/2 ltr:left-[20px] rtl:right-[20px] w-[44px] h-[44px] ${meta.color} bg-[#4936f50d]`}
                    >
                      <i className="material-symbols-outlined !text-[22px]">
                        {meta.icon}
                      </i>
                    </div>
                    <span className="block mb-[3px] text-black dark:text-white text-sm">
                      {notification.message}
                    </span>
                    <span className="block text-gray-500 dark:text-gray-400 text-xs">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                    <Link
                      href={notification.link}
                      onClick={() => {
                        markAsRead(notification._id);
                        setActive(false);
                      }}
                      className="block left-0 top-0 right-0 bottom-0 z-[1] absolute"
                    />
                    <span className="inline-block rounded-full bg-primary-500 absolute w-[6px] h-[6px] right-[20px] top-1/2 -translate-y-1/2" />
                  </li>
                );
              })}
            </ul>
          )}

          <div className="text-center">
            <Link
              href={viewAllHref}
              onClick={() => setActive(false)}
              className="inline-block font-medium relative text-primary-500 transition-all hover:underline"
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
