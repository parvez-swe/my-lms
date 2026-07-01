"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Course } from "@/data/courses";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader,
  BookOpen,
  User,
} from "lucide-react";
import Image from "next/image";
import EnrollmentStepIndicator from "./EnrollmentStepIndicator";
import AuthenticationStep from "./AuthenticationStep";
import PersonalInfoStep from "./PersonalInfoStep";
import PaymentStep from "./PaymentStep";
import {
  EnrollmentFormData,
  EnrollmentFormErrors,
} from "./enrollmentTypes";
import {
  isValidBkashNumber,
  isValidEmail,
  isValidPhone,
} from "@/lib/formValidation";
import { resolveCoursePrice } from "@/lib/currency";
import { isGatewayMethod } from "@/lib/payments/client";

interface MultiStepEnrollmentFormProps {
  course: Course;
}

const MultiStepEnrollmentForm: React.FC<MultiStepEnrollmentFormProps> = ({
  course,
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<EnrollmentFormData>({
    phone: "",
    currentJob: "",
    careerGoal: "",
    division: "",
    district: "",
    paymentMethod: "bkash",
    payerNumber: "",
    transactionId: "",
    bkashNumber: "",
  });
  const [errors, setErrors] = useState<EnrollmentFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [initialized, setInitialized] = useState(false);

  const coursePricing = resolveCoursePrice(course);
  const isFreeCourse =
    course.pricingType === "free" || coursePricing.amount === 0;
  const _paymentStepIndex = isFreeCourse ? -1 : 2;
  const lastStepIndex = isFreeCourse ? 1 : 2;

  const updateField = useCallback(
    <K extends keyof EnrollmentFormData>(
      field: K,
      value: EnrollmentFormData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  useEffect(() => {
    if (status === "loading" || initialized) return;

    if (status === "authenticated" && session?.user?.email) {
      setFormData((prev) => ({ ...prev, email: session.user.email }));
      setCurrentStep(1);
    } else if (status === "unauthenticated") {
      setCurrentStep(0);
    }
    setInitialized(true);
  }, [status, session?.user?.email, initialized]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    setSignInError("");

    try {
      const result = await signIn("credentials", {
        email: signInEmail,
        password: signInPassword,
        redirect: false,
      });

      if (result?.error) {
        setSignInError("Invalid email or password");
      } else {
        setSignInEmail("");
        setSignInPassword("");
      }
    } catch {
      setSignInError("Sign in failed. Please try again.");
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSendOTP = async (email: string) => {
    setOtpLoading(true);
    setOtpError("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (result.success) {
        setOtpSent(true);
        setOtpEmail(email);
        setOtp("");
        setRemainingAttempts(5);
      } else {
        setOtpError(result.error || "Failed to send OTP");
      }
    } catch {
      setOtpError("Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, otp }),
      });
      const result = await response.json();

      if (result.success) {
        const signInResult = await signIn("credentials", {
          email: otpEmail,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          setFormData((prev) => ({ ...prev, email: otpEmail }));
          setVerificationStep("form");
          setOtp("");
          setCurrentStep(1);
        } else {
          setOtpError(
            "Email verified but auto-login failed. Please sign in manually."
          );
        }
      } else {
        if (result.attempts !== undefined) setRemainingAttempts(result.attempts);
        setOtpError(result.error || "Invalid OTP");
      }
    } catch {
      setOtpError("Failed to verify OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: EnrollmentFormErrors = {};

    if (step === 0) {
      if (formData.hasAccount === undefined) {
        newErrors.hasAccount = "Please select an option";
      }
    } else if (step === 1) {
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!isValidPhone(formData.phone)) {
        newErrors.phone = "Enter a valid phone number (10–14 digits)";
      }
      if (!formData.currentJob.trim()) {
        newErrors.currentJob = "Current job is required";
      }
      if (!formData.careerGoal) {
        newErrors.careerGoal = "Career goal is required";
      }
      if (!formData.division) newErrors.division = "Division is required";
      if (!formData.district) newErrors.district = "District is required";
    } else if (step === 2 && !isFreeCourse) {
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = "Select a payment method";
      }
      const isManual =
        formData.paymentMethod === "bkash" ||
        formData.paymentMethod === "nagad";
      if (isManual) {
        if (!formData.payerNumber.trim()) {
          newErrors.payerNumber = "Wallet number is required";
        } else if (!isValidBkashNumber(formData.payerNumber)) {
          newErrors.payerNumber = "Invalid number (10–11 digits)";
        }
        if (!formData.transactionId.trim()) {
          newErrors.transactionId = "Transaction ID is required";
        } else if (formData.transactionId.trim().length < 3) {
          newErrors.transactionId = "Invalid transaction ID";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    const newErrors: EnrollmentFormErrors = {};

    if (!formData.email || !isValidEmail(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const registerResponse = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.email?.split("@")[0] || "User",
          email: formData.email,
          password: formData.password,
        }),
      });
      const registerResult = await registerResponse.json();

      if (registerResult.success) {
        setVerificationStep("otp");
        setOtpEmail(formData.email!);
        setOtpSent(true);
        setRemainingAttempts(5);
        setOtpError("");
      } else {
        setErrors({ email: registerResult.error || "Registration failed" });
      }
    } catch {
      setErrors({ email: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      if (status !== "authenticated" || !session?.user) {
        setErrors({
          transactionId:
            "You must be logged in to enroll. Please sign in or create an account.",
        });
        setCurrentStep(0);
        return;
      }

      const paymentPayload = isFreeCourse
        ? undefined
        : {
            method: formData.paymentMethod,
            transactionId: formData.transactionId || "gateway-pending",
            ...(formData.paymentMethod === "bkash"
              ? { bkashNumber: formData.payerNumber }
              : {}),
            ...(formData.paymentMethod === "nagad"
              ? { nagadNumber: formData.payerNumber }
              : {}),
            amount: coursePricing.amount,
            currency: coursePricing.currency,
          };

      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: course.slug,
          phone: formData.phone,
          currentJob: formData.currentJob,
          careerGoal: formData.careerGoal,
          address: {
            division: formData.division,
            district: formData.district,
          },
          ...(paymentPayload ? { payment: paymentPayload } : {}),
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (
          !isFreeCourse &&
          isGatewayMethod(formData.paymentMethod)
        ) {
          const payRes = await fetch("/api/payments/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              courseSlug: course.slug,
              method: formData.paymentMethod,
            }),
          });
          const payData = await payRes.json();
          if (payData.redirectUrl) {
            window.location.href = payData.redirectUrl;
            return;
          }
        }
        router.push(`/courses/${course.slug}?enrolled=true`);
      } else if (response.status === 401) {
        setErrors({ transactionId: "Session expired. Please sign in again." });
        setCurrentStep(0);
      } else {
        setErrors({
          transactionId: result.error || "Enrollment failed",
        });
      }
    } catch {
      setErrors({ transactionId: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c1427]">
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-[#15203b] shadow-xl shadow-slate-200/50 dark:shadow-none">
          {/* Course header */}
          <div className="hero-dark relative overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-900 p-8 text-white">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl ring-2 ring-white/30">
                <Image
                  src={course.image || "/images/courses/course1.jpg"}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-violet-200">
                  Course enrollment
                </p>
                <h1 className="mb-0 text-2xl font-bold text-white md:text-3xl">
                  {course.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-violet-100">
                  <span className="inline-flex items-center gap-1.5">
                    <User size={15} />
                    {course.tutor}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen size={15} />
                    {course.lessons} lessons
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-0.5 font-bold">
                    {coursePricing.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <EnrollmentStepIndicator currentStep={currentStep} />

            <div className="min-h-[320px]">
              {currentStep === 0 && (
                <AuthenticationStep
                  isAuthenticated={status === "authenticated"}
                  accountEmail={session?.user?.email}
                  formData={formData}
                  errors={errors}
                  signInEmail={signInEmail}
                  signInPassword={signInPassword}
                  signInError={signInError}
                  signInLoading={signInLoading}
                  showSignInPassword={showSignInPassword}
                  showPassword={showPassword}
                  loading={loading}
                  verificationStep={verificationStep}
                  otp={otp}
                  otpLoading={otpLoading}
                  otpError={otpError}
                  otpSent={otpSent}
                  otpEmail={otpEmail}
                  remainingAttempts={remainingAttempts}
                  onSignIn={handleSignIn}
                  onSignInEmailChange={setSignInEmail}
                  onSignInPasswordChange={setSignInPassword}
                  onToggleSignInPassword={() =>
                    setShowSignInPassword((p) => !p)
                  }
                  onTogglePassword={() => setShowPassword((p) => !p)}
                  onHasAccountChange={(hasAccount) =>
                    updateField("hasAccount", hasAccount)
                  }
                  onFormChange={updateField}
                  onRegister={handleRegister}
                  onVerifyOtp={handleVerifyOTP}
                  onResendOtp={() => handleSendOTP(otpEmail)}
                  onOtpChange={setOtp}
                  onContinue={handleNext}
                />
              )}
              {currentStep === 1 && (
                <PersonalInfoStep
                  formData={formData}
                  errors={errors}
                  accountEmail={session?.user?.email}
                  onChange={updateField}
                />
              )}
              {currentStep === 2 && !isFreeCourse && (
                <PaymentStep
                  formData={formData}
                  errors={errors}
                  coursePrice={coursePricing.label}
                  onChange={updateField}
                />
              )}
            </div>

            <div className="mt-8 flex gap-3 border-t border-slate-100 pt-6">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-gray-700 py-3.5 font-semibold text-slate-700 dark:text-gray-300 transition hover:bg-slate-50 dark:hover:bg-gray-800"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
              )}
              {currentStep < lastStepIndex ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500"
                >
                  Continue
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Complete Enrollment
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepEnrollmentForm;
