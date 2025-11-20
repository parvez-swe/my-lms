"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Course } from "@/data/courses";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Mail,
  Lock,
  Phone,
  Briefcase,
  DollarSign,
  AlertCircle,
  Eye,
  EyeOff,
  Loader,
} from "lucide-react";

// Types
interface EnrollmentFormData {
  // Step 1: Authentication
  email?: string;
  password?: string;
  confirmPassword?: string;
  hasAccount?: boolean;

  // Step 2: Personal Info
  phone: string;
  currentJob: string;
  careerGoal: "freelance" | "abroad" | "job" | "remote-job" | "";
  division: string;
  district: string;

  // Step 3: Payment
  bkashNumber: string;
  transactionId: string;
}

interface MultiStepEnrollmentFormProps {
  course: Course;
}

// Bangladesh Divisions and Districts
const bangladeshDivisions = {
  Dhaka: [
    "Dhaka",
    "Gazipur",
    "Narayanganj",
    "Tangail",
    "Sherpur",
    "Jashore",
    "Kishoreganj",
  ],
  Chattogram: [
    "Chattogram",
    "Comilla",
    "Cox's Bazar",
    "Feni",
    "Khagrachhari",
    "Rangamati",
    "Bandarban",
  ],
  Sylhet: ["Sylhet", "Moulvibazar", "Sunamganj", "Habiganj"],
  Khulna: ["Khulna", "Barisal", "Patuakhali", "Pirojpur", "Jhalokati", "Bhola"],
  Rajshahi: ["Rajshahi", "Bogra", "Natore", "Naogaon", "Pabna", "Sirajganj"],
  Rangpur: [
    "Rangpur",
    "Dinajpur",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Thakurgaon",
  ],
};

const MultiStepEnrollmentForm: React.FC<MultiStepEnrollmentFormProps> = ({
  course,
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<EnrollmentFormData>({
    phone: "",
    currentJob: "",
    careerGoal: "",
    division: "",
    district: "",
    bkashNumber: "",
    transactionId: "",
  });
  const [errors, setErrors] = useState<Partial<EnrollmentFormData>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState<"form" | "otp">(
    "form"
  ); // OTP verification state
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState(""); // Track which email OTP was sent to
  const [remainingAttempts, setRemainingAttempts] = useState(5);

  // Determine initial step based on authentication status
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      // Auto-fill email for authenticated users and move to step 2
      setFormData((prev) => ({ ...prev, email: session.user.email }));
      setCurrentStep(1);
    } else if (status === "unauthenticated") {
      setCurrentStep(0);
    }
  }, [status, session]);

  // Handle sign in
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
        setSignInError(result.error);
      } else if (result?.ok) {
        // Session will be updated, component will re-render
        setSignInEmail("");
        setSignInPassword("");
      }
    } catch {
      setSignInError("Sign in failed. Please try again.");
    } finally {
      setSignInLoading(false);
    }
  };

  // Handle sending OTP for new account verification
  const handleSendOTP = async (email: string) => {
    setOtpLoading(true);
    setOtpError("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    } catch (err) {
      console.error("Send OTP error:", err);
      setOtpError("Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (email: string, otpCode: string) => {
    if (otpCode.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const result = await response.json();

      if (result.success) {
        // OTP verified successfully - auto-login user
        const signInResult = await signIn("credentials", {
          email: otpEmail,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          setFormData((prev) => ({
            ...prev,
            email: otpEmail,
          }));
          setVerificationStep("form");
          setOtp("");
          setTimeout(() => {
            handleNext();
          }, 500);
        } else {
          setOtpError(
            "Email verified but auto-login failed. Please sign in manually."
          );
        }
      } else {
        const attempts = result.attempts;
        if (attempts !== undefined) {
          setRemainingAttempts(attempts);
        }
        setOtpError(result.error || "Invalid OTP");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setOtpError("Failed to verify OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form data for each step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      // Authentication step validation
      if (formData.hasAccount === undefined) {
        newErrors.hasAccount = "Please select an option";
        setErrors(newErrors as Partial<EnrollmentFormData>);
        return false;
      }
    } else if (step === 1) {
      // Personal info validation
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^[\d\s\-+()]+$/.test(formData.phone)) {
        newErrors.phone = "Invalid phone number format";
      }

      if (!formData.currentJob.trim()) {
        newErrors.currentJob = "Current job is required";
      }

      if (!formData.careerGoal) {
        newErrors.careerGoal = "Career goal is required";
      }

      if (!formData.division) {
        newErrors.division = "Division is required";
      }

      if (!formData.district) {
        newErrors.district = "District is required";
      }
    } else if (step === 2) {
      // Payment validation
      if (!formData.bkashNumber.trim()) {
        newErrors.bkashNumber = "bKash number is required";
      } else {
        // Extract only digits from bKash number
        const onlyDigits = formData.bkashNumber.replace(/\D/g, "");
        // Check if it's 10 or 11 digits (Bangladeshi numbers are typically 11 digits with leading 0, or 10 without)
        if (!/^\d{10,11}$/.test(onlyDigits)) {
          newErrors.bkashNumber = "Invalid bKash number (must be 10-11 digits)";
        } else if (onlyDigits.length === 10) {
          // If 10 digits, it should start with 1 (for +880 1XXXXXXXXX)
          if (!/^1\d{9}$/.test(onlyDigits)) {
            newErrors.bkashNumber = "Invalid bKash number format";
          }
        } else if (onlyDigits.length === 11) {
          // If 11 digits, it should start with 0 or 880 (for 01XXXXXXXXX or 8801XXXXXXXXX)
          if (!/^(0|88)/.test(onlyDigits)) {
            newErrors.bkashNumber = "Invalid bKash number format";
          }
        }
      }

      if (!formData.transactionId.trim()) {
        newErrors.transactionId = "Transaction ID is required";
      } else if (formData.transactionId.trim().length < 3) {
        newErrors.transactionId = "Invalid transaction ID format";
      }
    }

    setErrors(newErrors as Partial<EnrollmentFormData>);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    try {
      // Check if user is authenticated - verify status is authenticated
      if (status !== "authenticated" || !session?.user) {
        setErrors({
          transactionId:
            "You must be logged in to enroll. Please sign in or create an account.",
        } as Partial<EnrollmentFormData>);
        setCurrentStep(0);
        setLoading(false);
        return;
      }

      // Prepare enrollment data
      const enrollmentData = {
        courseSlug: course.slug,
        phone: formData.phone,
        currentJob: formData.currentJob,
        careerGoal: formData.careerGoal,
        address: {
          division: formData.division,
          district: formData.district,
        },
        payment: {
          method: "bkash",
          bkashNumber: formData.bkashNumber,
          transactionId: formData.transactionId,
        },
      };

      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enrollmentData),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to success page or course page
        router.push(`/courses/${course.slug}?enrolled=true`);
      } else {
        if (response.status === 401) {
          setErrors({
            transactionId: "Session expired. Please sign in again.",
          } as Partial<EnrollmentFormData>);
          setCurrentStep(0);
        } else {
          setErrors({
            transactionId: result.error || "Enrollment failed",
          } as Partial<EnrollmentFormData>);
        }
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      setErrors({
        transactionId: "An error occurred. Please try again.",
      } as Partial<EnrollmentFormData>);
    } finally {
      setLoading(false);
    }
  };

  // Step progress indicator
  const StepIndicator = () => (
    <div className="flex justify-between items-center mb-8">
      {[
        { label: "Auth", num: 0 },
        { label: "Info", num: 1 },
        { label: "Payment", num: 2 },
      ].map((step) => (
        <div key={step.num} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              currentStep === step.num
                ? "bg-purple-600 text-white"
                : currentStep > step.num
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {currentStep > step.num ? <CheckCircle2 size={24} /> : step.num + 1}
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700">
            {step.label}
          </span>
          {step.num < 2 && (
            <div
              className={`w-12 h-1 mx-2 ${
                currentStep > step.num ? "bg-green-500" : "bg-gray-200"
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );

  // Step 0: Authentication
  const AuthenticationStep = () => {
    if (status === "authenticated") {
      return (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="text-green-600" size={24} />
            <div>
              <p className="font-semibold text-green-900">Already Logged In</p>
              <p className="text-sm text-green-700">{session?.user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Continue to Personal Info
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <p className="text-gray-700">Do you have an existing account?</p>

        <div className="flex gap-4">
          <button
            onClick={() =>
              setFormData((prev) => ({ ...prev, hasAccount: true }))
            }
            className={`flex-1 p-4 border-2 rounded-lg font-semibold transition-all ${
              formData.hasAccount === true
                ? "border-purple-600 bg-purple-50 text-purple-900"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            Yes, I have an account
          </button>
          <button
            onClick={() =>
              setFormData((prev) => ({ ...prev, hasAccount: false }))
            }
            className={`flex-1 p-4 border-2 rounded-lg font-semibold transition-all ${
              formData.hasAccount === false
                ? "border-purple-600 bg-purple-50 text-purple-900"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            No, create a new account
          </button>
        </div>

        {/* Sign In Form */}
        {formData.hasAccount === true && (
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-semibold text-gray-900">Sign In</h3>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showSignInPassword ? "text" : "password"}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showSignInPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {signInError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="text-red-600" size={18} />
                  <p className="text-sm text-red-700">{signInError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={signInLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {signInLoading && <Loader size={18} className="animate-spin" />}
                Sign In
              </button>
            </form>
          </div>
        )}

        {/* Sign Up Form */}
        {formData.hasAccount === false && (
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-semibold text-gray-900">Create Account</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => {
                      const value = e.target.value.trim().toLowerCase();
                      setFormData((prev) => ({
                        ...prev,
                        email: value,
                      }));
                    }}
                    placeholder="your@email.com"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  // Validate and proceed
                  const newErrors: Record<string, string> = {};

                  if (!formData.email || !isValidEmail(formData.email)) {
                    newErrors.email = "Valid email is required";
                  }

                  if (!formData.password || formData.password.length < 6) {
                    newErrors.password =
                      "Password must be at least 6 characters";
                  }

                  if (formData.password !== formData.confirmPassword) {
                    newErrors.confirmPassword = "Passwords do not match";
                  }

                  if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors as Partial<EnrollmentFormData>);
                    return;
                  }

                  // Register user with OTP verification
                  setLoading(true);
                  try {
                    const registerResponse = await fetch(
                      "/api/users/register",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          name: formData.email?.split("@")[0] || "User",
                          email: formData.email,
                          password: formData.password,
                          role: "student",
                        }),
                      }
                    );

                    const registerResult = await registerResponse.json();

                    if (registerResult.success) {
                      // OTP has been sent automatically during registration
                      setVerificationStep("otp");
                      setOtp("");
                      setOtpEmail(formData.email!);
                      setOtpSent(true);
                      setRemainingAttempts(5);
                      setOtpError("");
                    } else {
                      setErrors({
                        email: registerResult.error || "Registration failed",
                      } as Partial<EnrollmentFormData>);
                    }
                  } catch (err) {
                    console.error("Registration error:", err);
                    setErrors({
                      email: "An error occurred. Please try again.",
                    } as Partial<EnrollmentFormData>);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader size={18} className="animate-spin" />}
                Create Account & Verify Email
              </button>

              {/* OTP Verification Section */}
              {verificationStep === "otp" && otpSent && (
                <div className="border-t pt-6 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Verification Code Sent!</strong>
                      <br />
                      We&apos;ve sent a 6-digit code to{" "}
                      <strong>{otpEmail}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Verification Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        setOtp(value);
                      }}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {otpError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle
                        className="text-red-600 flex-shrink-0"
                        size={18}
                      />
                      <div>
                        <p className="text-sm text-red-700">{otpError}</p>
                        {remainingAttempts < 5 && (
                          <p className="text-xs text-red-600 mt-1">
                            Remaining attempts: {remainingAttempts}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={otpLoading || otp.length !== 6}
                    onClick={() => handleVerifyOTP(otpEmail, otp)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {otpLoading && (
                      <Loader size={18} className="animate-spin" />
                    )}
                    Verify Code
                  </button>

                  <button
                    type="button"
                    disabled={otpLoading}
                    onClick={() => handleSendOTP(otpEmail)}
                    className="w-full text-purple-600 hover:text-purple-700 font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Didn&apos;t receive code? Resend OTP
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {errors.hasAccount && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={18} />
            <p className="text-sm text-red-700">{errors.hasAccount}</p>
          </div>
        )}
      </div>
    );
  };

  // Step 1: Personal Information
  const PersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email || session?.user?.email || ""}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Auto-filled from your account
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="+880 1XXXXXXXXX"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Job/Occupation
          </label>
          <div className="relative">
            <Briefcase
              className="absolute left-3 top-3 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={formData.currentJob}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, currentJob: e.target.value }))
              }
              placeholder="e.g., Student, Freelancer, Software Engineer"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.currentJob ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          {errors.currentJob && (
            <p className="text-red-600 text-sm mt-1">{errors.currentJob}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Career Goal
          </label>
          <select
            value={formData.careerGoal}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                careerGoal: e.target.value as
                  | "freelance"
                  | "abroad"
                  | "job"
                  | "remote-job"
                  | "",
              }))
            }
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.careerGoal ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select your career goal</option>
            <option value="freelance">Freelancer</option>
            <option value="abroad">Work Abroad</option>
            <option value="job">Get a Job</option>
            <option value="remote-job">Remote Job</option>
          </select>
          {errors.careerGoal && (
            <p className="text-red-600 text-sm mt-1">{errors.careerGoal}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Division
          </label>
          <select
            value={formData.division}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                division: e.target.value,
                district: "", // Reset district when division changes
              }))
            }
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.division ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select your division</option>
            {Object.keys(bangladeshDivisions).map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>
          {errors.division && (
            <p className="text-red-600 text-sm mt-1">{errors.division}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            District/Zila
          </label>
          <select
            value={formData.district}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, district: e.target.value }))
            }
            disabled={!formData.division}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
              errors.district ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select your district</option>
            {formData.division &&
              bangladeshDivisions[
                formData.division as keyof typeof bangladeshDivisions
              ]?.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
          </select>
          {errors.district && (
            <p className="text-red-600 text-sm mt-1">{errors.district}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Step 2: Payment
  const PaymentStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">
          Payment Instructions
        </h4>
        <p className="text-sm text-blue-800">
          Please send the course fee to the following bKash Personal Number:
        </p>
        <p className="text-lg font-bold text-blue-900 mt-2">
          {process.env.NEXT_PUBLIC_BKASH_NUMBER || "+880 1XXXXXXXXX"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your bKash Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="tel"
            value={formData.bkashNumber}
            onChange={(e) => {
              const value = e.target.value.trim();
              setFormData((prev) => ({
                ...prev,
                bkashNumber: value,
              }));
            }}
            placeholder="01XXX-XXX-XXXX or +880 1XXXXXXXXX"
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.bkashNumber ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        {errors.bkashNumber && (
          <p className="text-red-600 text-sm mt-1">{errors.bkashNumber}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          bKash Transaction ID (TrxID)
        </label>
        <div className="relative">
          <DollarSign
            className="absolute left-3 top-3 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={formData.transactionId}
            onChange={(e) => {
              const value = e.target.value.trim().toUpperCase();
              setFormData((prev) => ({
                ...prev,
                transactionId: value,
              }));
            }}
            placeholder="e.g., 8NLKXXXX8 or J00XXXXXX"
            maxLength={30}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono ${
              errors.transactionId ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        {errors.transactionId && (
          <p className="text-red-600 text-sm mt-1">{errors.transactionId}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          You can find this in your bKash transaction confirmation
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Your enrollment will be processed after we
          verify your payment. You will receive a confirmation email within 24
          hours.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 pt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Course Header */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white">
              <h1 className="text-2xl text-gray-100  font-bold">
                {course.title}
              </h1>
              <div className="flex  justify-end">
                <span className="text-gray-100">Price: </span>
                <span className="font-semibold text-gray-100">
                  {course.price}৳
                </span>
              </div>
              <div className="flex justify-end">
                <span className="text-gray-100">Instructor:</span>
                <span className="font-semibold text-gray-100">
                  {course.tutor}
                </span>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <StepIndicator />

            <div className="mt-8">
              {currentStep === 0 && <AuthenticationStep />}
              {currentStep === 1 && <PersonalInfoStep />}
              {currentStep === 2 && <PaymentStep />}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-4 pt-6 border-t">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={20} />
                  Back
                </button>
              )}

              {currentStep < 2 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Complete Enrollment
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Course Summary */}
        </div>
      </div>
    </div>
  );
};

export default MultiStepEnrollmentForm;
