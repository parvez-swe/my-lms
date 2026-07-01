"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface PageHeroProps {
  badge?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function PageHero({
  badge = "Learning Platform",
  title,
  subtitle,
  children,
}: PageHeroProps) {
  return (
    <section className="hero-dark relative overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-900 pt-28 pb-16 md:pb-20 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-400/30 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-indigo-400/25 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Sparkles size={14} className="text-amber-300" />
            {badge}
          </span>
          <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-violet-100/90 md:text-xl">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
