import React from "react";
import { notFound, redirect } from "next/navigation";
import { Course } from "@/data/courses";
import EnrolledCourseClient from "./EnrolledCourseClient";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { EnrollmentDocument } from "@/models/Enrollment";
import { ObjectId } from "mongodb";
import { serializeEnrollment } from "@/lib/serialize";

export const dynamic = "force-dynamic";

const EnrolledCoursePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect(`/authentication/sign-in?callbackUrl=/mycourses/${slug}`);
  }

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
    } else {
      notFound();
    }
  } catch (error) {
    console.error("Failed to fetch course:", error);
    notFound();
  }

  if (!course) {
    notFound();
  }

  // Fetch enrollment data
  let enrollment:
    | (Omit<EnrollmentDocument, "_id" | "userId"> & {
        _id?: string;
        userId: string;
      })
    | null = null;
  try {
    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const enrollmentDoc = await db
      .collection<EnrollmentDocument>("enrollments")
      .findOne({
        userId: userId,
        courseSlug: slug,
      });

    // Serialize MongoDB document to plain object (convert ObjectIds to strings)
    enrollment = serializeEnrollment(enrollmentDoc);
    if (enrollment && !enrollment.userId) {
      enrollment.userId = session.user.id;
    }
  } catch (error) {
    console.error("Failed to fetch enrollment:", error);
  }

  // Check if user is enrolled and approved
  if (!enrollment || enrollment.status !== "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {!enrollment
              ? "Not Enrolled"
              : enrollment.status === "pending"
              ? "Enrollment Pending"
              : "Enrollment Rejected"}
          </h2>
          <p className="text-gray-600 mb-6">
            {!enrollment
              ? "You are not enrolled in this course. Please enroll to access the course materials."
              : enrollment.status === "pending"
              ? "Your enrollment request is pending approval. You will receive an email notification once it's approved."
              : "Your enrollment request was rejected. Please contact support if you believe this is an error."}
          </p>
          <div className="flex gap-4 justify-center">
            {!enrollment && (
              <a
                href={`/courses/enroll/${slug}`}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Enroll Now
              </a>
            )}
            <a
              href={`/courses/${slug}`}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              View Course Details
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <EnrolledCourseClient course={course} enrollment={enrollment} />;
};

export default EnrolledCoursePage;
