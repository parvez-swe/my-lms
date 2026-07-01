"use client";

import NotificationBell from "@/components/Notifications/NotificationBell";

export default function Notifications() {
  return (
    <NotificationBell
      viewAllHref="/profile?tab=notifications"
      className="mx-[8px] md:mx-[10px] lg:mx-[12px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0"
    />
  );
}
