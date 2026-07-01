"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Course } from "@/data/courses";
import { resolveCoursePrice } from "@/lib/currency";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Layers,
  Star,
  Users,
  Zap,
} from "lucide-react";

interface CourseCardProps {
  course: Course;
  variant?: "grid" | "list" | "featured";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export default function CourseCard({
  course,
  variant = "grid",
}: CourseCardProps) {
  const rating = course.ratingAverage ?? 0;
  const ratingCount = course.ratingCount ?? 0;
  const moduleCount = course.modules?.length ?? 0;
  const pricing = resolveCoursePrice(course);
  const priceLabel = pricing.label;
  const isFree = pricing.amount === 0;
  const description = course.description
    ? stripHtml(course.description)
    : "";

  const metaRow = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-gray-400">
      <span className="inline-flex items-center gap-1.5">
        <BookOpen size={15} className="text-violet-500" />
        {course.lessons} lessons
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Layers size={15} className="text-violet-500" />
        {moduleCount} modules
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Users size={15} className="text-violet-500" />
        {course.students.toLocaleString()} students
      </span>
      {rating > 0 && (
        <span className="inline-flex items-center gap-1">
          <Star size={15} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-slate-700 dark:text-gray-200">
            {rating.toFixed(1)}
          </span>
          {ratingCount > 0 && (
            <span className="text-slate-400 dark:text-gray-500">({ratingCount})</span>
          )}
        </span>
      )}
    </div>
  );

  const actions = (
    <div className={`flex gap-2 ${variant === "list" ? "sm:flex-row flex-col" : "flex-col"}`}>
      <Link
        href={`/courses/enroll/${course.slug}`}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-500"
      >
        Enroll Now
        <ArrowRight size={16} />
      </Link>
      <Link
        href={`/courses/${course.slug}`}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-[#15203b] px-4 py-3 text-sm font-semibold text-slate-700 dark:text-gray-200 transition hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-gray-800 hover:text-violet-700 dark:hover:text-violet-400"
      >
        View Details
      </Link>
    </div>
  );

  if (variant === "list") {
    return (
      <article className="group overflow-hidden rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-[#15203b] shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/10">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-52 w-full shrink-0 overflow-hidden sm:h-auto sm:w-72">
            <Image
              src={course.image || "/images/courses/course1.jpg"}
              alt={course.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
            <span
              className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                isFree
                  ? "bg-emerald-500 text-white"
                  : "bg-white/95 text-violet-700"
              }`}
            >
              {priceLabel}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {course.pricingType === "paid" && !isFree && (
                  <span className="rounded-full bg-violet-100 dark:bg-violet-900/40 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-300">
                    Premium
                  </span>
                )}
                {isFree && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    <Zap size={12} />
                    Free access
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white transition group-hover:text-violet-700 dark:group-hover:text-violet-400">
                {course.title}
              </h3>
              <div className="flex items-center gap-2">
                <Image
                  src={course.tutorImage || "/images/users/user1.jpg"}
                  alt={course.tutor}
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-white"
                />
                <span className="text-sm font-medium text-slate-600 dark:text-gray-400">
                  {course.tutor}
                </span>
              </div>
              {description && (
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {metaRow}
            {actions}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-[#15203b] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={course.image || "/images/courses/course1.jpg"}
          alt={course.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {isFree ? (
            <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
              Free
            </span>
          ) : (
            <span className="rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-violet-700 shadow">
              {priceLabel}
            </span>
          )}
          {variant === "featured" && (
            <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950">
              Featured
            </span>
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image
              src={course.tutorImage || "/images/users/user1.jpg"}
              alt={course.tutor}
              width={36}
              height={36}
              className="rounded-full ring-2 ring-white/80"
            />
            <div>
              <p className="text-xs text-white/80">Instructor</p>
              <p className="text-sm font-semibold text-white">{course.tutor}</p>
            </div>
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-sm text-white backdrop-blur">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 dark:text-white transition group-hover:text-violet-700 dark:group-hover:text-violet-400">
            {course.title}
          </h3>
          {description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-gray-400">
          <div className="rounded-lg bg-slate-50 dark:bg-[#0c1427] px-3 py-2">
            <p className="font-medium text-slate-400 dark:text-gray-500">Lessons</p>
            <p className="mt-0.5 font-semibold text-slate-800 dark:text-gray-200">
              {course.lessons}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-[#0c1427] px-3 py-2">
            <p className="font-medium text-slate-400 dark:text-gray-500">Modules</p>
            <p className="mt-0.5 font-semibold text-slate-800 dark:text-gray-200">{moduleCount}</p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-[#0c1427] px-3 py-2">
            <p className="font-medium text-slate-400 dark:text-gray-500">Students</p>
            <p className="mt-0.5 font-semibold text-slate-800 dark:text-gray-200">
              {course.students.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-[#0c1427] px-3 py-2">
            <p className="font-medium text-slate-400 dark:text-gray-500">Format</p>
            <p className="mt-0.5 inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-gray-200">
              <Clock size={12} />
              Self-paced
            </p>
          </div>
        </div>

        <div className="mt-auto">{actions}</div>
      </div>
    </article>
  );
}
