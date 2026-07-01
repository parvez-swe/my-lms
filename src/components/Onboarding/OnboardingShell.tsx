"use client";

import React from "react";
import Image from "next/image";
import { BRAND } from "@/lib/brand";

interface OnboardingShellProps {
  title: string;
  subtitle: string;
  step?: string;
  children: React.ReactNode;
}

export default function OnboardingShell({
  title,
  subtitle,
  step,
  children,
}: OnboardingShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c1427] px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src={BRAND.logo}
            alt={BRAND.name}
            width={56}
            height={56}
            className="mb-4 rounded-xl"
          />
          {step && (
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-violet-600">
              {step}
            </p>
          )}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-lg text-slate-600 dark:text-slate-300">
            {subtitle}
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 dark:border-gray-700 dark:bg-[#15203b] dark:shadow-none">
          <div className="p-6 sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
