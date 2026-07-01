"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Check, Loader, X } from "lucide-react";

interface PendingCourse {
  slug: string;
  title: string;
  tutor: string;
  instructorEmail?: string;
  status: string;
  image?: string;
  submittedAt?: string;
}

export default function AdminCourseApprovals() {
  const [courses, setCourses] = useState<PendingCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/course-approvals?status=pending_approval")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCourses(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (slug: string, action: "approve" | "reject") => {
    let reason = "";
    if (action === "reject") {
      reason = prompt("Rejection reason:") || "";
      if (!reason.trim()) return;
    }
    const res = await fetch("/api/admin/course-approvals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, action, reason }),
    });
    const data = await res.json();
    if (data.success) load();
    else alert(data.error || "Action failed");
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-gray-500 flex items-center gap-2">
          <Loader size={16} className="animate-spin" /> Loading...
        </p>
      ) : courses.length === 0 ? (
        <p className="text-gray-500">No courses pending approval.</p>
      ) : (
        courses.map((c) => (
          <div
            key={c.slug}
            className="trezo-card bg-white dark:bg-[#0c1427] p-5 rounded-md flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
          >
            <div className="flex gap-4 items-center">
              {c.image && (
                <Image
                  src={c.image}
                  alt={c.title}
                  width={80}
                  height={50}
                  className="rounded object-cover"
                />
              )}
              <div>
                <h6 className="!mb-0">{c.title}</h6>
                <p className="text-sm text-gray-500">
                  {c.tutor} · {c.instructorEmail}
                </p>
                {c.submittedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted {new Date(c.submittedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => review(c.slug, "approve")}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm"
              >
                <Check size={16} /> Publish
              </button>
              <button
                type="button"
                onClick={() => review(c.slug, "reject")}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-rose-600 text-white text-sm"
              >
                <X size={16} /> Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
