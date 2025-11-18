import React from "react";
import { courses } from "@/data/courses";
import EnrollmentForm from "./EnrollmentClientPage";

// Generate static params for all courses
export async function generateStaticParams() {
  return courses.map((course) => ({
    slug: course.slug,
  }));
}

// Server component that fetches course data and passes it to the client component
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Course not found.</p>
      </div>
    );
  }

  return <EnrollmentForm course={course} />;
}
