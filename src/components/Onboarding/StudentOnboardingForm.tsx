"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Briefcase, Loader, MapPin, Phone, Target } from "lucide-react";
import { FormField, SelectInput, TextInput } from "@/components/ui/FormField";
import { bangladeshDivisions } from "@/components/Enrollment/enrollmentConstants";
import { normalizePhoneInput } from "@/lib/formValidation";
import { CareerGoal } from "@/models/User";

import { getPostLoginPath } from "@/lib/authRedirect";

const CAREER_GOALS: { value: CareerGoal; label: string }[] = [
  { value: "freelance", label: "Start freelancing" },
  { value: "abroad", label: "Work abroad" },
  { value: "job", label: "Land a local job" },
  { value: "remote-job", label: "Get a remote job" },
];

export default function StudentOnboardingForm() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    phone: "",
    currentJob: "",
    careerGoal: "" as CareerGoal | "",
    division: "",
    district: "",
  });

  const districts = form.division ? bangladeshDivisions[form.division] || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to save profile");
        return;
      }

      await update({ onboardingCompleted: true });
      const destination = getPostLoginPath(session?.user?.role, true);
      router.push(destination);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4 dark:border-violet-900/40 dark:bg-violet-950/30">
        <p className="text-sm text-violet-900 dark:text-violet-100">
          A few details help us personalize your courses and career
          recommendations.
        </p>
      </div>

      <FormField label="Phone Number" name="phone" required icon={Phone}>
        <TextInput
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: normalizePhoneInput(e.target.value) })
          }
          placeholder="01XXXXXXXXX"
        />
      </FormField>

      <FormField
        label="Current Job / Occupation"
        name="currentJob"
        required
        icon={Briefcase}
      >
        <TextInput
          id="currentJob"
          name="currentJob"
          value={form.currentJob}
          onChange={(e) => setForm({ ...form, currentJob: e.target.value })}
          placeholder="e.g. Software Developer, Student"
        />
      </FormField>

      <FormField
        label="Career Goal"
        name="careerGoal"
        required
        icon={Target}
      >
        <SelectInput
          id="careerGoal"
          name="careerGoal"
          value={form.careerGoal}
          onChange={(e) =>
            setForm({
              ...form,
              careerGoal: e.target.value as CareerGoal,
            })
          }
        >
          <option value="">Select your goal</option>
          {CAREER_GOALS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Division" name="division" required icon={MapPin}>
          <SelectInput
            id="division"
            name="division"
            value={form.division}
            onChange={(e) =>
              setForm({ ...form, division: e.target.value, district: "" })
            }
          >
            <option value="">Select division</option>
            {Object.keys(bangladeshDivisions).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="District" name="district" required icon={MapPin}>
          <SelectInput
            id="district"
            name="district"
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
            disabled={!form.division}
          >
            <option value="">Select district</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
      >
        {loading && <Loader size={18} className="animate-spin" />}
        Complete setup
      </button>
    </form>
  );
}
