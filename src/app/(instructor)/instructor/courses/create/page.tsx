"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CreateCourseForm from "@/components/LMS/CreateCourseForm";
import { Loader } from "lucide-react";

export default function InstructorCreateCoursePage() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/instructor/profile")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setStatus(res.data.status);
      });
  }, []);

  if (status === null) {
    return (
      <p className="flex items-center gap-2 text-gray-500">
        <Loader size={16} className="animate-spin" /> Checking profile...
      </p>
    );
  }

  if (status !== "approved") {
    return (
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-8 rounded-md text-center max-w-lg mx-auto">
        <h5 className="!mb-2">Profile approval required</h5>
        <p className="text-gray-500 text-sm mb-4">
          Your instructor profile must be approved by an admin before you can
          create courses.
        </p>
        <Link
          href="/instructor/profile/"
          className="inline-block bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium"
        >
          Complete instructor profile
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-[25px]">
        <h5 className="!mb-0">Create Course</h5>
        <p className="text-sm text-gray-500 mt-1">
          Courses are submitted for admin approval before going live.
        </p>
      </div>
      <CreateCourseForm
        redirectTo="/instructor/courses/"
        lockInstructor
      />
    </>
  );
}
