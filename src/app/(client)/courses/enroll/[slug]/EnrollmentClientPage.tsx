"use client";

import React, { useState } from "react";
import { CheckCircle, ChevronRight, Info } from "lucide-react";
import { Course } from "@/data/courses";
import Image from "next/image";

// Define the structure for your form data
interface FormData {
  phone: string;
  otp: string;
  name: string;
  email: string;
  gender: string;
  education: string;
  currentStatus: string;
  profileImage: File | null;
  discordId: string;
  password: string;
  bkashTransactionId: string;
  bkashPhone: string;
}

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
  value: string; // Changed from string | undefined to string
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Input field component - FIX: Ensure value is always a string, never undefined
const InputField = ({
  label,
  name,
  type,
  placeholder,
  required = true,
  value,
  disabled = false,
  onChange,
}: InputFieldProps) => (
  <div className="mb-4">
    <label
      htmlFor={name}
      className="block mb-2 text-sm font-medium text-gray-700"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value} // Now guaranteed to be a string
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="h-12 rounded-md text-black border border-gray-300 bg-gray-50 px-4 block w-full outline-0 transition-all placeholder:text-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:bg-gray-200"
    />
  </div>
);

// Mock course data for demo
// const mockCourse = {
//   title: "Advanced Web Development",
//   price: "৳5,000",
// };

const EnrollmentClientPage = ({ course }: { course: Course }) => {
  // const course = mockCourse;
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [isLoggedIn] = useState(false);

  // FIX: Initialize all string fields with empty strings, not undefined
  const [formData, setFormData] = useState<FormData>({
    phone: "",
    otp: "",
    name: isLoggedIn ? "Logged In User" : "",
    email: isLoggedIn ? "user@example.com" : "",
    gender: "",
    education: "",
    currentStatus: "student",
    discordId: "",
    password: "",
    bkashTransactionId: "",
    bkashPhone: "",
    profileImage: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, profileImage: file }));
    }
  };

  const handleFinalSubmit = () => {
    console.log("Enrolling with data:", formData);
    setIsSubmitted(true);
  };

  const Stepper = () => (
    <div className="flex justify-center items-center mb-12 space-x-2">
      <StepItem num={1} title="Verify" active={step === 1} done={step > 1} />
      <ChevronRight className="text-gray-400" />
      <StepItem num={2} title="Details" active={step === 2} done={step > 2} />
      <ChevronRight className="text-gray-400" />
      <StepItem
        num={3}
        title="Payment"
        active={step === 3}
        done={isSubmitted}
      />
    </div>
  );

  const StepItem = ({
    num,
    title,
    active,
    done,
  }: {
    num: number;
    title: string;
    active: boolean;
    done: boolean;
  }) => (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2
          ${
            active
              ? "bg-purple-100 border-purple-600 text-purple-600"
              : done
              ? "bg-green-600 border-green-600 text-white"
              : "bg-gray-100 border-gray-300 text-gray-500"
          }
        `}
      >
        {done ? <CheckCircle size={20} /> : num}
      </div>
      <span
        className={`mt-2 text-sm font-semibold ${
          active ? "text-purple-600" : "text-gray-500"
        }`}
      >
        {title}
      </span>
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Enrollment Submitted!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your request to enroll in <strong>{course.title}</strong> has been
          received. Your enrollment status is now{" "}
          <span className="font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
            PENDING
          </span>
          .
        </p>
        <p className="text-gray-600 mb-10">
          Our team will review your payment and activate your course within 24
          hours. You can check your enrollment status in your profile.
        </p>
        <button
          onClick={() => (window.location.href = "/profile")}
          className="bg-purple-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          Go to My Profile
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-lg">
          <div className="text-center mb-10">
            <h2 className="text-lg font- mb-2">Enroll in {course.title}</h2>
            <p className="text-lg text-gray-600">
              Just a few steps to get you started!
            </p>
          </div>

          <Stepper />

          <div>
            {step === 1 && (
              <section>
                <h2 className="text-2xl font-semibold mb-6 text-center">
                  Step 1: Verify Your Phone
                </h2>
                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="e.g., 01700000000"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-md font-semibold hover:bg-gray-300 mb-4"
                >
                  Send OTP
                </button>
                <InputField
                  label="Enter OTP"
                  name="otp"
                  type="text"
                  placeholder="6-digit code"
                  value={formData.otp}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-purple-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Verify & Continue
                </button>
              </section>
            )}

            {step === 2 && (
              <section>
                <h2 className="text-2xl font-semibold mb-6 text-center">
                  Step 2: Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Full Name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoggedIn}
                  />

                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoggedIn}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Phone Number"
                    placeholder="Phone "
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled
                  />

                  {!isLoggedIn && (
                    <InputField
                      label="Create Password"
                      name="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label
                      htmlFor="gender"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="h-12 rounded-md text-black border border-gray-300 bg-gray-50 px-4 block w-full outline-0 transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="education"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Education <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder="e.g., B.Sc. in CSE"
                      className="h-12 rounded-md text-black border border-gray-300 bg-gray-50 px-4 block w-full outline-0 transition-all placeholder:text-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* left */}
                  <div>
                    <div className="mb-4">
                      <label
                        htmlFor="currentStatus"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Current Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="currentStatus"
                        name="currentStatus"
                        value={formData.currentStatus}
                        onChange={handleChange}
                        className="h-12 rounded-md text-black border border-gray-300 bg-gray-50 px-4 block w-full outline-0 transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="student">Student</option>
                        <option value="job_holder">Job Holder</option>
                        <option value="job_less">Jobless</option>
                        <option value="looking_for_freelance">
                          Looking for Freelance
                        </option>
                        <option value="looking_for_job">Looking for Job</option>
                        <option value="looking_for_go_abroad">
                          Looking to Go Abroad
                        </option>
                      </select>
                    </div>
                    <div className="mb-6">
                      <label
                        htmlFor="profileImage"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Profile Image (Optional)
                      </label>
                      <input
                        type="file"
                        id="profileImage"
                        name="profileImage"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-purple-50 file:text-purple-700
                      hover:file:bg-purple-100"
                      />
                    </div>
                  </div>
                  {/* right */}
                  <div>
                    <InputField
                      label="Discord ID"
                      name="discordId"
                      type="text"
                      placeholder="e.g., username#1234"
                      value={formData.discordId}
                      onChange={handleChange}
                      required={false}
                    />
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-md flex items-start space-x-2 mb-4">
                      <Info size={20} className="flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        A Discord ID is required to join our community server.
                        Don&apos;t have one?{" "}
                        <a
                          href="https://discord.com/register"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold underline hover:text-blue-600"
                        >
                          Create an account free.
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section>
                <h2 className="text-2xl font-semibold mb-6 text-center">
                  Step 3: Complete Payment
                </h2>
                <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg mb-6">
                  <div className="flex items-center justify-center mb-4">
                    {/* <div className="text-pink-600 font-bold text-2xl">
                      bKash
                    </div> */}

                    <Image
                      src={"/payment/bkash.png"}
                      alt="bKash Logo"
                      width={80}
                      height={40}
                      className="h-32 w-auto"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-center mb-2">
                    Payment Instructions
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>
                      Open your bKash app and select &quot;Send Money&quot;.
                    </li>
                    <li>
                      Enter our bKash number:{" "}
                      <strong className="text-purple-800">01xxxxxxxxx</strong>
                    </li>
                    <li>
                      Enter the course fee:{" "}
                      <strong className="text-purple-800">
                        {course.price}
                      </strong>
                    </li>
                    <li>Complete the payment with your PIN.</li>
                    <li>
                      Take note of the <strong>Transaction ID</strong>.
                    </li>
                  </ol>
                </div>

                <InputField
                  label="bKash Transaction ID"
                  name="bkashTransactionId"
                  type="text"
                  placeholder="e.g., 9M45P8A7B2"
                  value={formData.bkashTransactionId}
                  onChange={handleChange}
                />
                <InputField
                  label="Your bKash Phone Number"
                  name="bkashPhone"
                  type="tel"
                  placeholder="The number you sent money from"
                  value={formData.bkashPhone}
                  onChange={handleChange}
                />

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Submit Enrollment
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentClientPage;
