"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import { getPostLoginPath } from "@/lib/authRedirect";

interface ProfileData {
  name: string;
  email: string;
  image: string;
  bio: string;
  headline: string;
  expertise: string;
  status: "none" | "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

export default function TeacherOnboardingForm() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProfileData>({
    name: "",
    email: "",
    image: "",
    bio: "",
    headline: "",
    expertise: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/instructor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, submitForApproval: true }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to submit profile");
        return;
      }

      await update({ onboardingCompleted: true });
      const destination = getPostLoginPath(session?.user?.role, true);
      router.push(destination);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
        <Loader className="animate-spin" size={18} />
        Loading...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          Complete your instructor profile to get started. An admin will review
          your application before you can publish courses.
        </p>
      </div>

      <div>
        <label className="mb-2 block font-medium text-black dark:text-white">
          Full Name *
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="h-[50px] w-full rounded-md border border-gray-200 bg-white px-4 dark:border-[#172036] dark:bg-[#0c1427]"
        />
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
          className="h-[50px] w-full rounded-md border border-gray-200 bg-white px-4 dark:border-[#172036] dark:bg-[#0c1427]"
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
          className="h-[50px] w-full rounded-md border border-gray-200 bg-white px-4 dark:border-[#172036] dark:bg-[#0c1427]"
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
          className="w-full rounded-md border border-gray-200 bg-white p-4 dark:border-[#172036] dark:bg-[#0c1427]"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
      >
        {saving && <Loader size={18} className="animate-spin" />}
        Submit profile & continue
      </button>
    </form>
  );
}
