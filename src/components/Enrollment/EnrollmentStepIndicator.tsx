"use client";

import { CheckCircle2 } from "lucide-react";

interface EnrollmentStepIndicatorProps {
  currentStep: number;
}

const STEPS = [
  { label: "Account", num: 0 },
  { label: "Profile", num: 1 },
  { label: "Payment", num: 2 },
];

export default function EnrollmentStepIndicator({
  currentStep,
}: EnrollmentStepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.num} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  currentStep === step.num
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/40"
                    : currentStep > step.num
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400"
                }`}
              >
                {currentStep > step.num ? (
                  <CheckCircle2 size={22} />
                ) : (
                  step.num + 1
                )}
              </div>
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  currentStep >= step.num
                    ? "text-slate-800 dark:text-gray-200"
                    : "text-slate-400 dark:text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 rounded-full transition-colors ${
                  currentStep > step.num ? "bg-emerald-400" : "bg-slate-200 dark:bg-gray-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
