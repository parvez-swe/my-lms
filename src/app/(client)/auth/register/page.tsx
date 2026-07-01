"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader, Lock, Mail, User, GraduationCap, Presentation } from "lucide-react";
import { FormField, TextInput } from "@/components/ui/FormField";
import { isValidEmail } from "@/lib/formValidation";
import { BRAND } from "@/lib/brand";

type AccountType = "student" | "teacher";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "student" as AccountType,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!isValidEmail(formData.email)) newErrors.email = "Valid email is required";
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.accountType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(formData.email)}`
        );
      } else {
        setErrors({ form: result.error || "Registration failed" });
      }
    } catch {
      setErrors({ form: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0c1427] px-4 py-16">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-[#15203b] shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="bg-gradient-to-br from-violet-700 to-indigo-800 px-8 py-10 text-white">
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="mt-2 text-violet-100">
              Join {BRAND.name} and start your learning journey today.
            </p>
          </div>

          <form className="space-y-5 p-8" onSubmit={handleSubmit}>
            {errors.form && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errors.form}
              </div>
            )}

            <fieldset>
              <legend className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                I want to join as
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, accountType: "student" })
                  }
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                    formData.accountType === "student"
                      ? "border-violet-600 bg-violet-50 dark:bg-violet-950/30"
                      : "border-slate-200 hover:border-slate-300 dark:border-gray-700"
                  }`}
                >
                  <GraduationCap
                    size={28}
                    className={
                      formData.accountType === "student"
                        ? "text-violet-600"
                        : "text-slate-400"
                    }
                  />
                  <span className="text-sm font-semibold">Student</span>
                  <span className="text-xs text-slate-500">Learn courses</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, accountType: "teacher" })
                  }
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                    formData.accountType === "teacher"
                      ? "border-violet-600 bg-violet-50 dark:bg-violet-950/30"
                      : "border-slate-200 hover:border-slate-300 dark:border-gray-700"
                  }`}
                >
                  <Presentation
                    size={28}
                    className={
                      formData.accountType === "teacher"
                        ? "text-violet-600"
                        : "text-slate-400"
                    }
                  />
                  <span className="text-sm font-semibold">Instructor</span>
                  <span className="text-xs text-slate-500">Teach courses</span>
                </button>
              </div>
            </fieldset>

            <FormField
              label="Full Name"
              name="name"
              required
              icon={User}
              error={errors.name}
            >
              <TextInput
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Your name"
                error={Boolean(errors.name)}
              />
            </FormField>

            <FormField
              label="Email"
              name="email"
              required
              icon={Mail}
              error={errors.email}
            >
              <TextInput
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="you@example.com"
                error={Boolean(errors.email)}
              />
            </FormField>

            <FormField
              label="Password"
              name="password"
              required
              icon={Lock}
              error={errors.password}
            >
              <TextInput
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="At least 6 characters"
                error={Boolean(errors.password)}
              />
            </FormField>

            <FormField
              label="Confirm Password"
              name="confirmPassword"
              required
              icon={Lock}
              error={errors.confirmPassword}
            >
              <TextInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Repeat password"
                error={Boolean(errors.confirmPassword)}
              />
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              Create account
            </button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-semibold text-violet-600 hover:text-violet-500"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
