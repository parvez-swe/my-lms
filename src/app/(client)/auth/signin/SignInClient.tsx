"use client";

import React, { useEffect, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader, Lock, Mail } from "lucide-react";
import { getPostLoginPath } from "@/lib/authRedirect";
import { BRAND } from "@/lib/brand";
import { FormField, TextInput } from "@/components/ui/FormField";

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitCallback = searchParams.get("callbackUrl");
  const verified = searchParams.get("verified") === "true";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (verified) {
      setInfo("Email verified successfully. You can sign in now.");
    } else if (authError === "CredentialsSignin") {
      setError("Invalid email or password.");
    }
  }, [verified, authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setNeedsVerification(false);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const verifyRes = await fetch("/api/auth/check-email-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const verifyData = await verifyRes.json().catch(() => null);

        if (verifyData?.exists && !verifyData?.verified) {
          setNeedsVerification(true);
          setError(
            "Your email is not verified yet. Enter the code we sent you, or request a new one."
          );
        } else {
          setError("Invalid email or password.");
        }
      } else if (result?.ok) {
        const session = await getSession();
        const destination = getPostLoginPath(
          session?.user?.role,
          session?.user?.onboardingCompleted === false ? false : true,
          explicitCallback
        );
        router.push(destination);
        router.refresh();
      } else {
        setError("Sign in failed. Please try again.");
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError(
        "Could not reach the sign-in service. Restart the dev server if you just changed config, then try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0c1427] px-4 py-16">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-[#15203b] shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="bg-gradient-to-br from-violet-700 to-indigo-800 px-8 py-10 text-white">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="mt-2 text-violet-100">
              Sign in to {BRAND.name} to continue learning and manage your
              courses.
            </p>
          </div>

          <form className="space-y-5 p-8" onSubmit={handleSubmit}>
            {info && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {info}
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
                {needsVerification && (
                  <Link
                    href={`/auth/verify-email?email=${encodeURIComponent(email)}`}
                    className="mt-2 block font-semibold text-violet-700 hover:text-violet-600"
                  >
                    Go to email verification →
                  </Link>
                )}
              </div>
            )}

            <FormField label="Email" name="email" required icon={Mail}>
              <TextInput
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </FormField>

            <FormField label="Password" name="password" required icon={Lock}>
              <TextInput
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              Sign in
            </button>

            <p className="text-center text-sm text-slate-600">
              Need to verify your email?{" "}
              <Link
                href={
                  email
                    ? `/auth/verify-email?email=${encodeURIComponent(email)}`
                    : "/auth/verify-email"
                }
                className="font-semibold text-violet-600 hover:text-violet-500"
              >
                Enter verification code
              </Link>
            </p>

            <p className="text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-violet-600 hover:text-violet-500"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
