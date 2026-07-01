"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Course } from "@/data/courses";
import { ArrowRight } from "lucide-react";
import CourseCard from "@/components/ui/CourseCard";

const FeaturedCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/courses");
        const result = await response.json();

        if (result.success) {
          setCourses(result.data.slice(0, 6));
        } else {
          setError("Failed to load courses");
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <section className="bg-slate-50 dark:bg-[#0c1427] py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 h-10 w-64 animate-pulse rounded-xl bg-slate-200 mx-auto" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[420px] animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || courses.length === 0) {
    return (
      <section className="bg-slate-50 dark:bg-[#0c1427] py-20">
        <div className="container mx-auto px-4 text-center text-slate-500">
          {error || "No courses available at the moment"}
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-7xl px-4">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-violet-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-violet-700">
              Featured Courses
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
              Learn skills that move your career forward
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Expert-led programs with structured modules, real projects, and
              mentor support — designed for ambitious learners in Bangladesh.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700"
          >
            Browse all courses
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} variant="featured" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
