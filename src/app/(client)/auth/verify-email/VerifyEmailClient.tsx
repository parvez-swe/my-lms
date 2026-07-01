"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader, Mail, ShieldCheck } from "lucide-react";
import { FormField, TextInput } from "@/components/ui/FormField";
import { BRAND } from "@/lib/brand";

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Verification failed");
        return;
      }

      setSuccess("Email verified! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/auth/signin?verified=true");
      }, 1200);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Enter your email first");
      return;
    }

    setError("");
    setSuccess("");
    setResending(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to resend code");
        return;
      }

      setSuccess("A new verification code was sent to your email.");
    } catch {
      setError("Could not resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0c1427] px-4 py-16">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-[#15203b] shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="bg-gradient-to-br from-violet-700 to-indigo-800 px-8 py-10 text-white">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-2xl font-bold">Verify your email</h2>
            <p className="mt-2 text-violet-100">
              Enter the 6-digit code sent to your email to activate your{" "}
              {BRAND.name} account.
            </p>
          </div>

          <form className="space-y-5 p-8" onSubmit={handleVerify}>
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {success}
              </div>
            )}

            <FormField label="Email" name="email" required icon={Mail}>
              <TextInput
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </FormField>

            <FormField label="Verification code" name="otp" required>
              <TextInput
                id="otp"
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                className="tracking-[0.3em] text-center text-lg"
              />
            </FormField>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              Verify email
            </button>

            <button
              type="button"
              disabled={resending}
              onClick={handleResend}
              className="w-full text-sm font-medium text-violet-600 hover:text-violet-500 disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend verification code"}
            </button>

            <p className="text-center text-sm text-slate-600">
              Already verified?{" "}
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
