"use client";

import Link from "next/link";
import { BookOpen, MessageSquare, Plus, User } from "lucide-react";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export default function InstructorDashboardPage() {
  const [profileStatus, setProfileStatus] = useState<string>("none");

  useEffect(() => {
    fetch("/api/instructor/profile")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setProfileStatus(res.data.status);
      });
  }, []);

  const statusBanner: Record<
    string,
    { text: string; href: string; color: string; icon: typeof Clock }
  > = {
    none: {
      text: "Complete your instructor profile and submit for admin approval before creating courses.",
      href: "/instructor/profile/",
      color: "bg-amber-50 border-amber-200 text-amber-800",
      icon: Clock,
    },
    pending: {
      text: "Your instructor profile is pending admin approval. You'll be able to create courses once approved.",
      href: "/instructor/profile/",
      color: "bg-blue-50 border-blue-200 text-blue-800",
      icon: Clock,
    },
    rejected: {
      text: "Your instructor profile was rejected. Please update and resubmit.",
      href: "/instructor/profile/",
      color: "bg-rose-50 border-rose-200 text-rose-800",
      icon: XCircle,
    },
    approved: {
      text: "Profile approved. Create a course — it will go live after admin approval.",
      href: "/instructor/courses/create/",
      color: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: CheckCircle2,
    },
  };

  const banner = statusBanner[profileStatus] || statusBanner.none;

  const BannerIcon = banner.icon;

  return (
    <>
      <div className="mb-[25px]">
        <h5 className="!mb-1">Instructor Dashboard</h5>
        <p className="text-gray-500 text-sm">
          Manage your profile, courses, and student communications.
        </p>
      </div>

      <div
        className={`mb-6 flex items-start gap-3 p-4 rounded-xl border ${banner.color}`}
      >
        <BannerIcon size={20} className="shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm">{banner.text}</p>
          <Link href={banner.href} className="text-sm font-semibold underline mt-1 inline-block">
            {profileStatus === "approved" ? "Create course" : "Go to profile"}
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/instructor/profile/"
          className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md hover:shadow-md transition group"
        >
          <User className="text-violet-500 mb-3" size={28} />
          <h6 className="!mb-1 group-hover:text-violet-500 transition">My Profile</h6>
          <p className="text-sm text-gray-500">Instructor bio, photo & approval</p>
        </Link>

        <Link
          href="/instructor/courses/"
          className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md hover:shadow-md transition group"
        >
          <BookOpen className="text-primary-500 mb-3" size={28} />
          <h6 className="!mb-1 group-hover:text-primary-500 transition">My Courses</h6>
          <p className="text-sm text-gray-500">View and edit your courses</p>
        </Link>

        <Link
          href={profileStatus === "approved" ? "/instructor/courses/create/" : "/instructor/profile/"}
          className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md hover:shadow-md transition group"
        >
          <Plus className="text-success-500 mb-3" size={28} />
          <h6 className="!mb-1 group-hover:text-success-500 transition">Create Course</h6>
          <p className="text-sm text-gray-500">
            {profileStatus === "approved"
              ? "Submit course for admin approval"
              : "Requires approved profile"}
          </p>
        </Link>

        <Link
          href="/dashboard/messages/"
          className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md hover:shadow-md transition group"
        >
          <MessageSquare className="text-orange-500 mb-3" size={28} />
          <h6 className="!mb-1 group-hover:text-orange-500 transition">Messages</h6>
          <p className="text-sm text-gray-500">Student inquiries and support</p>
        </Link>
      </div>
    </>
  );
}
