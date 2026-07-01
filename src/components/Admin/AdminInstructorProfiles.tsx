"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Check, Loader, X } from "lucide-react";

interface Profile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  headline?: string;
  expertise?: string;
  status: string;
  rejectionReason?: string;
  submittedAt?: string;
  createdAt?: string;
  onboardingCompleted?: boolean;
}

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "none", label: "Awaiting setup" },
  { value: "pending", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_LABELS: Record<string, string> = {
  none: "Awaiting setup",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function AdminInstructorProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/instructor-profiles?status=${filter}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setProfiles(res.data);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (userId: string, action: "approve" | "reject") => {
    let reason = "";
    if (action === "reject") {
      reason = prompt("Rejection reason:") || "";
      if (!reason.trim()) return;
    }
    const res = await fetch("/api/admin/instructor-profiles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, reason }),
    });
    const data = await res.json();
    if (data.success) load();
    else alert(data.error || "Action failed");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === value
                ? "bg-primary-500 text-white"
                : "bg-gray-100 dark:bg-[#15203c]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 flex items-center gap-2">
          <Loader size={16} className="animate-spin" /> Loading...
        </p>
      ) : profiles.length === 0 ? (
        <p className="text-gray-500">
          No instructor profiles found for this filter.
        </p>
      ) : (
        <div className="space-y-4">
          {profiles.map((p) => (
            <div
              key={p._id}
              className="trezo-card bg-white dark:bg-[#0c1427] p-5 rounded-md border border-gray-100 dark:border-[#172036]"
            >
              <div className="flex flex-col md:flex-row gap-4 md:items-start md:justify-between">
                <div className="flex gap-4">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-500 dark:bg-[#15203c]">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h6 className="!mb-0">{p.name}</h6>
                    <p className="text-sm text-gray-500">{p.email}</p>
                    {p.headline ? (
                      <p className="text-sm font-medium mt-1">{p.headline}</p>
                    ) : (
                      <p className="text-sm text-gray-400 mt-1 italic">
                        Profile not submitted yet
                      </p>
                    )}
                    {p.expertise && (
                      <p className="text-xs text-primary-500 mt-1">
                        {p.expertise}
                      </p>
                    )}
                    {p.bio && (
                      <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                        {p.bio}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#15203c]">
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                      {p.status === "none" && p.onboardingCompleted === false && (
                        <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                          Onboarding incomplete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {p.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => review(p._id, "approve")}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => review(p._id, "reject")}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-rose-600 text-white text-sm"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
