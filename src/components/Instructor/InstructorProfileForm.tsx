"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader, XCircle } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

interface ProfileData {
  name: string;
  email: string;
  image: string;
  bio: string;
  headline: string;
  expertise: string;
  socialLinks: { platform: string; url: string }[];
  status: "none" | "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

const STATUS_UI = {
  none: {
    icon: Clock,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    label: "Draft — submit for admin approval",
  },
  pending: {
    icon: Clock,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    label: "Pending admin approval",
  },
  approved: {
    icon: CheckCircle2,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    label: "Approved — you can create courses",
  },
  rejected: {
    icon: XCircle,
    color: "text-rose-600 bg-rose-50 border-rose-200",
    label: "Rejected — update and resubmit",
  },
};

export default function InstructorProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileData>({
    name: "",
    email: "",
    image: "",
    bio: "",
    headline: "",
    expertise: "",
    socialLinks: [],
    status: "none",
  });

  useEffect(() => {
    fetch("/api/instructor/profile")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setForm((prev) => ({ ...prev, ...res.data }));
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async (submitForApproval: boolean) => {
    setSaving(true);
    try {
      const res = await fetch("/api/instructor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, submitForApproval }),
      });
      const data = await res.json();
      if (data.success) {
        setForm((prev) => ({
          ...prev,
          status: data.data.status,
          rejectionReason: submitForApproval ? "" : prev.rejectionReason,
        }));
        alert(data.message);
      } else {
        alert(data.error || "Failed to save profile");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 py-10">
        <Loader className="animate-spin" size={18} />
        Loading profile...
      </div>
    );
  }

  const statusUi = STATUS_UI[form.status];
  const StatusIcon = statusUi.icon;

  return (
    <div className="space-y-6">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border ${statusUi.color}`}
      >
        <StatusIcon size={22} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">{statusUi.label}</p>
          {form.status === "rejected" && form.rejectionReason && (
            <p className="text-sm mt-1">Reason: {form.rejectionReason}</p>
          )}
          {form.status === "approved" && (
            <p className="text-sm mt-1">
              You can now create courses. Each course still needs admin approval
              before it goes live.
            </p>
          )}
        </div>
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-md space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="mb-2 block font-medium text-black dark:text-white">
              Full Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-[50px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium text-black dark:text-white">
              Email
            </label>
            <input
              value={form.email}
              readOnly
              className="h-[50px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-gray-50 dark:bg-[#0a0e19] px-4 opacity-70"
            />
          </div>
        </div>

        <ImageUpload
          label="Profile Photo"
          value={form.image}
          onChange={(url) => setForm({ ...form, image: url })}
          folder="instructor-profiles"
          required
        />

        <div>
          <label className="mb-2 block font-medium text-black dark:text-white">
            Professional Headline *
          </label>
          <input
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            placeholder="e.g. Senior Frontend Engineer & Educator"
            className="h-[50px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-black dark:text-white">
            Teaching Expertise *
          </label>
          <input
            value={form.expertise}
            onChange={(e) => setForm({ ...form, expertise: e.target.value })}
            placeholder="e.g. React, TypeScript, UI/UX"
            className="h-[50px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-black dark:text-white">
            Bio * (min 40 characters)
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={5}
            className="w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] p-4"
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            disabled={saving || form.status === "pending"}
            onClick={() => save(false)}
            className="px-5 py-2.5 rounded-lg border border-gray-300 font-medium disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving || form.status === "pending"}
            onClick={() => save(true)}
            className="px-5 py-2.5 rounded-lg bg-primary-500 text-white font-medium disabled:opacity-50"
          >
            {saving ? "Submitting..." : "Submit for Approval"}
          </button>
        </div>
      </div>
    </div>
  );
}
