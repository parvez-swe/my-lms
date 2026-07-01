"use client";

import React from "react";
import {
  CreditCard,
  Phone,
  Receipt,
  Smartphone,
  Globe,
  Wallet,
} from "lucide-react";
import { FormField, TextInput } from "@/components/ui/FormField";
import {
  EnrollmentFormData,
  EnrollmentFormErrors,
  PaymentMethodOption,
} from "./enrollmentTypes";
import {
  getManualPaymentNumber,
  isPaymentMethodEnabled,
} from "@/lib/payments/client";

interface PaymentStepProps {
  formData: EnrollmentFormData;
  errors: EnrollmentFormErrors;
  coursePrice: string;
  onChange: <K extends keyof EnrollmentFormData>(
    field: K,
    value: EnrollmentFormData[K]
  ) => void;
}

const PAYMENT_OPTIONS: {
  id: PaymentMethodOption;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "bkash",
    label: "bKash",
    description: "Send payment & enter TrxID",
    icon: <Wallet size={18} />,
  },
  {
    id: "nagad",
    label: "Nagad",
    description: "Send payment & enter TrxID",
    icon: <Smartphone size={18} />,
  },
  {
    id: "sslcommerz",
    label: "SSLCommerz",
    description: "Card, bKash, Nagad & mobile banking",
    icon: <Globe size={18} />,
  },
  {
    id: "stripe",
    label: "Stripe",
    description: "International cards (Visa, Mastercard)",
    icon: <CreditCard size={18} />,
  },
];

export default function PaymentStep({
  formData,
  errors,
  coursePrice,
  onChange,
}: PaymentStepProps) {
  const method = formData.paymentMethod;
  const isManual = method === "bkash" || method === "nagad";
  const manualNumber =
    method === "bkash" || method === "nagad"
      ? getManualPaymentNumber(method)
      : "";

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-violet-950 p-6 text-white dark:border-gray-700">
        <p className="text-sm text-violet-200">Amount to pay</p>
        <p className="mt-1 text-3xl font-bold">{coursePrice}</p>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-gray-300">
          Choose payment method
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PAYMENT_OPTIONS.filter((opt) =>
            isPaymentMethodEnabled(opt.id)
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange("paymentMethod", opt.id)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                method === opt.id
                  ? "border-violet-500 bg-violet-50 ring-2 ring-violet-500/30 dark:bg-violet-950/40"
                  : "border-slate-200 hover:border-violet-300 dark:border-gray-700 dark:hover:border-violet-600"
              }`}
            >
              <span className="mt-0.5 text-violet-600">{opt.icon}</span>
              <span>
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                  {opt.label}
                </span>
                <span className="block text-xs text-slate-500 dark:text-gray-400">
                  {opt.description}
                </span>
              </span>
            </button>
          ))}
        </div>
        {errors.paymentMethod && (
          <p className="mt-2 text-sm text-rose-600">{errors.paymentMethod}</p>
        )}
      </div>

      {isManual && (
        <>
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
            <p className="text-sm text-violet-800 dark:text-violet-200">
              Send payment to this {method === "bkash" ? "bKash" : "Nagad"}{" "}
              account:
            </p>
            <p className="mt-1 text-xl font-bold tracking-wide text-violet-950 dark:text-white">
              {manualNumber}
            </p>
          </div>

          <FormField
            label={`Your ${method === "bkash" ? "bKash" : "Nagad"} Number`}
            name="payerNumber"
            required
            icon={Phone}
            error={errors.payerNumber}
          >
            <TextInput
              id="payerNumber"
              name="payerNumber"
              type="tel"
              autoComplete="tel"
              value={formData.payerNumber}
              onChange={(e) => onChange("payerNumber", e.target.value.trim())}
              placeholder="01XXXXXXXXX"
              error={Boolean(errors.payerNumber)}
            />
          </FormField>

          <FormField
            label="Transaction ID (TrxID)"
            name="transactionId"
            required
            icon={Receipt}
            error={errors.transactionId}
            hint="Found in your confirmation SMS or app"
          >
            <TextInput
              id="transactionId"
              name="transactionId"
              value={formData.transactionId}
              onChange={(e) =>
                onChange("transactionId", e.target.value.trim().toUpperCase())
              }
              placeholder="e.g. 8NLKXXXX8"
              maxLength={30}
              className="font-mono uppercase"
              error={Boolean(errors.transactionId)}
            />
          </FormField>

          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            <CreditCard size={18} className="mt-0.5 shrink-0" />
            <p>
              Manual payments are verified within 24 hours. You&apos;ll receive
              email confirmation once approved.
            </p>
          </div>
        </>
      )}

      {(method === "sslcommerz" || method === "stripe") && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
          <p>
            After submitting enrollment, you&apos;ll be redirected to{" "}
            <strong>{method === "sslcommerz" ? "SSLCommerz" : "Stripe"}</strong>{" "}
            to complete payment securely.
          </p>
        </div>
      )}
    </div>
  );
}
