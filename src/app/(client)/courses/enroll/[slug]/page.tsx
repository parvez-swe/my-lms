import React from "react";
import { notFound } from "next/navigation";
import MultiStepEnrollmentForm from "@/components/Enrollment/MultiStepEnrollmentForm";
import { Course } from "@/data/courses";

// Server component that fetches course data and passes it to the client component
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch course from API
  let course: Course | null = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/courses/${slug}`, {
      cache: "no-store",
    });
    const result = await response.json();
    if (result.success) {
      course = result.data;
    }
  } catch (error) {
    console.error("Failed to fetch course:", error);
  }

  if (!course) {
    notFound();
  }

  return <MultiStepEnrollmentForm course={course} />;
}
