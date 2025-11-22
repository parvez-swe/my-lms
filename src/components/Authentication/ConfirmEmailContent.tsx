"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

const ConfirmEmailContentInner: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const pending = searchParams.get("pending");

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "pending"
  >(pending === "true" ? "pending" : token ? "loading" : "pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async (verificationToken: string) => {
      try {
        const response = await fetch(
          `/api/auth/verify-email?token=${verificationToken}`
        );
        const result = await response.json();

        if (result.success) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
          // Redirect to sign in after 3 seconds
          setTimeout(() => {
            router.push("/authentication/sign-in");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(result.error || "Verification failed");
        }
      } catch {
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    };

    if (token) {
      verifyEmail(token);
    }
  }, [token, router]);

  return (
    <>
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1">
              <Image
                src="/images/confirm-email.jpg"
                alt="confirm-email-image"
                className="rounded-[25px]"
                width={646}
                height={804}
              />
            </div>
            <div className="xl:ltr:pl-[90px] xl:rtl:pr-[90px] 2xl:ltr:pl-[120px] 2xl:rtl:pr-[120px] order-1 lg:order-2">
              <Image
                src="/images/logo-big.svg"
                alt="logo"
                className="inline-block dark:hidden"
                width={142}
                height={38}
              />
              <Image
                src="/images/white-logo-big.svg"
                alt="logo"
                className="hidden dark:inline-block"
                width={142}
                height={38}
              />

              <div className="my-[17px] md:my-[25px]">
                <h1 className="!font-semibold !text-[22px] md:!text-xl lg:!text-2xl !mb-[5px] md:!mb-[10px]">
                  {status === "pending"
                    ? "Check Your Email"
                    : status === "success"
                    ? "Email Verified!"
                    : "Verification Failed"}
                </h1>
                <p className="font-medium leading-[1.5] lg:text-md text-[#445164] dark:text-gray-400">
                  {status === "pending"
                    ? "We've sent a verification link to your email. Please check your inbox and click the link to verify your account."
                    : status === "success"
                    ? message ||
                      "Your email has been verified successfully! You can now sign in to your account."
                    : message ||
                      "There was an error verifying your email. The link may have expired or is invalid."}
                </p>
              </div>

              {status === "loading" && (
                <div className="flex items-center justify-center bg-[#f5f7f8] text-primary-500 rounded-full w-[120px] h-[120px] dark:bg-[#15203c] mb-[20px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
              )}

              {status === "success" && (
                <div className="flex items-center justify-center bg-[#f5f7f8] text-success-600 rounded-full w-[120px] h-[120px] dark:bg-[#15203c] mb-[20px]">
                  <i className="material-symbols-outlined !text-[55px]">done</i>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center justify-center bg-[#f5f7f8] text-red-600 rounded-full w-[120px] h-[120px] dark:bg-[#15203c] mb-[20px]">
                  <i className="material-symbols-outlined !text-[55px]">
                    error
                  </i>
                </div>
              )}

              {status === "pending" && (
                <div className="flex items-center justify-center bg-[#f5f7f8] text-primary-500 rounded-full w-[120px] h-[120px] dark:bg-[#15203c] mb-[20px]">
                  <i className="material-symbols-outlined !text-[55px]">mail</i>
                </div>
              )}

              {status === "success" && (
                <span className="block font-medium text-black dark:text-white md:text-md mt-[20px]">
                  Your Email Verified{" "}
                  <span className="text-success-600">Successfully!</span>
                </span>
              )}

              <div className="mt-[20px] md:mt-[25px] lg:mt-[30px]">
                {status === "success" && (
                  <Link
                    href="/authentication/sign-in"
                    className="md:text-md block w-full text-center transition-all rounded-md font-medium py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400"
                  >
                    <span className="flex items-center justify-center gap-[5px]">
                      <i className="material-symbols-outlined">login</i>
                      Sign In
                    </span>
                  </Link>
                )}

                {status === "error" && (
                  <>
                    <Link
                      href="/authentication/sign-up"
                      className="md:text-md block w-full text-center transition-all rounded-md font-medium py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400 mb-[15px]"
                    >
                      <span className="flex items-center justify-center gap-[5px]">
                        <i className="material-symbols-outlined">person_add</i>
                        Sign Up Again
                      </span>
                    </Link>
                    <Link
                      href="/authentication/sign-in"
                      className="md:text-md block w-full text-center transition-all rounded-md font-medium py-[12px] px-[25px] text-primary-500 border border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                      Back to Sign In
                    </Link>
                  </>
                )}

                {status === "pending" && (
                  <Link
                    href="/authentication/sign-in"
                    className="md:text-md block w-full text-center transition-all rounded-md font-medium py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400"
                  >
                    <span className="flex items-center justify-center gap-[5px]">
                      <i className="material-symbols-outlined">login</i>
                      Back To Sign In
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ConfirmEmailContent: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmEmailContentInner />
    </Suspense>
  );
};

export default ConfirmEmailContent;
