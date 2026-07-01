"use client";

import React from "react";
import { AlertCircle, LucideIcon } from "lucide-react";

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function FormField({
  label,
  name,
  error,
  hint,
  required,
  icon: Icon,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-700"
      >
        {Icon && <Icon size={15} className="text-violet-500" />}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-sm text-rose-600" role="alert">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed";

export function TextInput({
  error,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={`${inputBase} ${error ? "border-rose-400" : "border-slate-200"} ${className}`}
      {...props}
    />
  );
}

export function SelectInput({
  error,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      className={`${inputBase} ${error ? "border-rose-400" : "border-slate-200"} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
