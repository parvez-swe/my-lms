"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Clock, BookOpen, AlertCircle, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Course } from "@/data/courses";
import { EnrollmentDocument } from "@/models/Enrollment";

interface EnrollmentWithCourse extends EnrollmentDocument {
  course?: Course;
}

const MyCoursesPage = () => {
  const { status } = useSession();
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchEnrollments();
    }
  }, [status]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/enrollments");
      const result = await response.json();

      if (result.success) {
        setEnrollments(result.data || []);
      } else {
        setError(result.error || "Failed to fetch enrollments");
      }
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
      setError("An error occurred while fetching your courses");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-slate-800 mb-4">{error}</p>
          <button
            onClick={fetchEnrollments}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const activeCourses = enrollments.filter(
    (enrollment) => enrollment.status === "approved" && enrollment.course
  );
  const pendingCourses = enrollments.filter(
    (enrollment) => enrollment.status === "pending" && enrollment.course
  );
  const rejectedCourses = enrollments.filter(
    (enrollment) => enrollment.status === "rejected" && enrollment.course
  );

  const calculateProgress = (enrollment: EnrollmentWithCourse) => {
    if (!enrollment.course) return 0;
    const totalLessons = enrollment.course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    );
    const completedLessons = enrollment.progress?.completedLessons?.length || 0;
    return totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">My Courses</h1>
          <p className="text-slate-500 mt-1">
            Continue your learning journey and manage your enrollments.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {/* Rejected Courses Section */}
        {rejectedCourses.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center text-slate-900">
              <AlertCircle className="mr-3 text-red-500" />
              Rejected Enrollments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rejectedCourses.map((enrollment) => {
                const course = enrollment.course!;
                return (
                  <div
                    key={enrollment._id?.toString()}
                    className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden"
                  >
                    <Image
                      src={course.image}
                      alt={course.title}
                      width={400}
                      height={225}
                      className="w-full h-48 object-cover grayscale"
                    />
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2 text-slate-800">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">
                        By {course.tutor}
                      </p>
                      <div className="flex items-center justify-between bg-red-100 text-red-800 p-3 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle size={18} className="mr-2" />
                          <span className="font-semibold text-sm">
                            Enrollment Rejected
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/courses/${course.slug}`}
                        className="mt-4 block text-center text-purple-600 hover:underline text-sm font-semibold"
                      >
                        View Course Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Pending Courses Section */}
        {pendingCourses.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center text-slate-900">
              <AlertCircle className="mr-3 text-amber-500" />
              Pending Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCourses.map((enrollment) => {
                const course = enrollment.course!;
                return (
                  <div
                    key={enrollment._id?.toString()}
                    className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
                  >
                    <Image
                      src={course.image}
                      alt={course.title}
                      width={400}
                      height={225}
                      className="w-full h-48 object-cover grayscale"
                    />
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2 text-slate-800">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">
                        By {course.tutor}
                      </p>
                      <div className="flex items-center justify-between bg-amber-100 text-amber-800 p-3 rounded-lg">
                        <div className="flex items-center">
                          <Clock size={18} className="mr-2" />
                          <span className="font-semibold text-sm">
                            Pending Approval
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-3">
                        Enrolled on{" "}
                        {enrollment.enrolledAt
                          ? new Date(enrollment.enrolledAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Active Courses Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center text-slate-900">
            <BookOpen className="mr-3 text-indigo-600" />
            My Active Courses
          </h2>
          {activeCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCourses.map((enrollment) => {
                const course = enrollment.course!;
                const progress = calculateProgress(enrollment);
                const hasFeedback = Boolean(enrollment.feedback);
                const ctaLabel =
                  progress === 100
                    ? hasFeedback
                      ? "View Course"
                      : "Leave Feedback"
                    : "Continue Learning";
                return (
                  <div
                    key={enrollment._id?.toString()}
                    className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <Link href={`/mycourses/${course.slug}`}>
                      <Image
                        src={course.image}
                        alt={course.title}
                        width={400}
                        height={225}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                    <div className="p-5">
                      <Link href={`/mycourses/${course.slug}`}>
                        <h3 className="font-bold text-lg mb-2 text-slate-900 hover:text-indigo-600 transition-colors">
                          {course.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-500 mb-4">
                        By {course.tutor}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            course.pricingType === "free"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {course.pricingType === "free" ? "Free Course" : "Paid Course"}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 text-sm">
                          <Star
                            size={16}
                            className={
                              course.ratingCount && course.ratingCount > 0
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }
                          />
                          <span className="font-semibold text-slate-800">
                            {course.ratingCount && course.ratingCount > 0
                              ? (course.ratingAverage ?? 0).toFixed(1)
                              : "New"}
                          </span>
                          {course.ratingCount && (
                            <span className="text-slate-400">
                              ({course.ratingCount})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                          <span>Progress</span>
                          <span className="font-semibold">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <Link
                        href={`/mycourses/${course.slug}`}
                        className="w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors block"
                      >
                        {ctaLabel}
                      </Link>
                      {progress === 100 && !hasFeedback && (
                        <p className="text-xs text-amber-600 mt-2 text-center">
                          Completed! Leave a quick review to help others.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
              <BookOpen size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-slate-800">
                No Active Courses
              </h3>
              <p className="text-slate-500 mb-6">
                You are not enrolled in any active courses yet.
              </p>
              <Link
                href="/courses"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MyCoursesPage;
