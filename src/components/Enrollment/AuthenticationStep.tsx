"use client";

import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader,
  Lock,
  Mail,
} from "lucide-react";
import { FormField, TextInput } from "@/components/ui/FormField";
import {
  EnrollmentFormData,
  EnrollmentFormErrors,
} from "./enrollmentTypes";

interface AuthenticationStepProps {
  isAuthenticated: boolean;
  accountEmail?: string;
  formData: EnrollmentFormData;
  errors: EnrollmentFormErrors;
  signInEmail: string;
  signInPassword: string;
  signInError: string;
  signInLoading: boolean;
  showSignInPassword: boolean;
  showPassword: boolean;
  loading: boolean;
  verificationStep: "form" | "otp";
  otp: string;
  otpLoading: boolean;
  otpError: string;
  otpSent: boolean;
  otpEmail: string;
  remainingAttempts: number;
  onSignIn: (e: React.FormEvent) => void;
  onSignInEmailChange: (value: string) => void;
  onSignInPasswordChange: (value: string) => void;
  onToggleSignInPassword: () => void;
  onTogglePassword: () => void;
  onHasAccountChange: (hasAccount: boolean) => void;
  onFormChange: <K extends keyof EnrollmentFormData>(
    field: K,
    value: EnrollmentFormData[K]
  ) => void;
  onRegister: () => void;
  onVerifyOtp: () => void;
  onResendOtp: () => void;
  onOtpChange: (value: string) => void;
  onContinue: () => void;
}

export default function AuthenticationStep({
  isAuthenticated,
  accountEmail,
  formData,
  errors,
  signInEmail,
  signInPassword,
  signInError,
  signInLoading,
  showSignInPassword,
  showPassword,
  loading,
  verificationStep,
  otp,
  otpLoading,
  otpError,
  otpSent,
  otpEmail,
  remainingAttempts,
  onSignIn,
  onSignInEmailChange,
  onSignInPasswordChange,
  onToggleSignInPassword,
  onTogglePassword,
  onHasAccountChange,
  onFormChange,
  onRegister,
  onVerifyOtp,
  onResendOtp,
  onOtpChange,
  onContinue,
}: AuthenticationStepProps) {
  if (isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="font-semibold text-emerald-900">You&apos;re signed in</p>
            <p className="text-sm text-emerald-700">{accountEmail}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-500"
        >
          Continue to profile details
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-slate-600 dark:text-gray-400">
        Sign in to your account or create a new one to enroll in this course.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onHasAccountChange(true)}
          className={`rounded-xl border-2 p-4 text-left font-semibold transition ${
            formData.hasAccount === true
              ? "border-violet-500 bg-violet-50 text-violet-900"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          I have an account
        </button>
        <button
          type="button"
          onClick={() => onHasAccountChange(false)}
          className={`rounded-xl border-2 p-4 text-left font-semibold transition ${
            formData.hasAccount === false
              ? "border-violet-500 bg-violet-50 text-violet-900"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          Create new account
        </button>
      </div>

      {formData.hasAccount === true && (
        <form onSubmit={onSignIn} className="space-y-4 border-t border-slate-100 pt-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sign in</h3>
          <FormField label="Email" name="signInEmail" icon={Mail}>
            <TextInput
              id="signInEmail"
              name="signInEmail"
              type="email"
              autoComplete="email"
              value={signInEmail}
              onChange={(e) => onSignInEmailChange(e.target.value)}
              placeholder="you@example.com"
            />
          </FormField>
          <FormField label="Password" name="signInPassword" icon={Lock}>
            <div className="relative">
              <TextInput
                id="signInPassword"
                name="signInPassword"
                type={showSignInPassword ? "text" : "password"}
                autoComplete="current-password"
                value={signInPassword}
                onChange={(e) => onSignInPasswordChange(e.target.value)}
                placeholder="••••••••"
                className="pr-12"
              />
              <button
                type="button"
                onClick={onToggleSignInPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>
          {signInError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle size={16} />
              {signInError}
            </div>
          )}
          <button
            type="submit"
            disabled={signInLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {signInLoading && <Loader size={18} className="animate-spin" />}
            Sign In
          </button>
        </form>
      )}

      {formData.hasAccount === false && (
        <div className="space-y-4 border-t border-slate-100 pt-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create account</h3>
          <FormField
            label="Email"
            name="registerEmail"
            required
            icon={Mail}
            error={errors.email}
          >
            <TextInput
              id="registerEmail"
              name="registerEmail"
              type="email"
              autoComplete="email"
              value={formData.email || ""}
              onChange={(e) =>
                onFormChange("email", e.target.value.trim().toLowerCase())
              }
              placeholder="you@example.com"
              error={Boolean(errors.email)}
            />
          </FormField>
          <FormField
            label="Password"
            name="registerPassword"
            required
            icon={Lock}
            error={errors.password}
            hint="At least 6 characters"
          >
            <div className="relative">
              <TextInput
                id="registerPassword"
                name="registerPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.password || ""}
                onChange={(e) => onFormChange("password", e.target.value)}
                placeholder="••••••••"
                className="pr-12"
                error={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.confirmPassword || ""}
              onChange={(e) => onFormChange("confirmPassword", e.target.value)}
              placeholder="••••••••"
              error={Boolean(errors.confirmPassword)}
            />
          </FormField>
          <button
            type="button"
            disabled={loading}
            onClick={onRegister}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {loading && <Loader size={18} className="animate-spin" />}
            Create Account &amp; Verify Email
          </button>

          {verificationStep === "otp" && otpSent && (
            <div className="space-y-4 rounded-2xl border border-violet-100 bg-violet-50/50 p-5">
              <p className="text-sm text-violet-900">
                Enter the 6-digit code sent to <strong>{otpEmail}</strong>
              </p>
              <TextInput
                id="otp"
                name="otp"
                inputMode="numeric"
                value={otp}
                onChange={(e) =>
                  onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl font-mono tracking-[0.5em]"
              />
              {otpError && (
                <div className="flex items-start gap-2 text-sm text-rose-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <p>{otpError}</p>
                    {remainingAttempts < 5 && (
                      <p className="mt-1 text-xs">
                        Remaining attempts: {remainingAttempts}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <button
                type="button"
                disabled={otpLoading || otp.length !== 6}
                onClick={onVerifyOtp}
                className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {otpLoading && <Loader size={18} className="inline animate-spin" />}
                Verify Code
              </button>
              <button
                type="button"
                disabled={otpLoading}
                onClick={onResendOtp}
                className="w-full text-sm font-semibold text-violet-600 hover:text-violet-500"
              >
                Resend code
              </button>
            </div>
          )}
        </div>
      )}

      {errors.hasAccount && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle size={16} />
          {errors.hasAccount}
        </div>
      )}
    </div>
  );
}
