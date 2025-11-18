"use client";
import React from "react";
import Image from "next/image";
import { Clock, BookOpen, AlertCircle } from "lucide-react";
import Link from "next/link";
import { courses } from "@/data/courses";

// import { courses } from "../../../../data/courses";

// Mock data - replace with actual data from your backend/context
const enrolledCourses = [
  {
    ...courses[0],
    id: "1",
    progress: 80,
    status: "active",
  },
  {
    ...courses[1],
    id: "2",
    progress: 100,
    status: "active",
  },
  {
    ...courses[2],
    id: "3",
    status: "pending",
    progress: 0,
  },
];

const MyCoursesPage = () => {
  const activeCourses = enrolledCourses.filter(
    (course) => course.status === "active"
  );
  const pendingCourses = enrolledCourses.filter(
    (course) => course.status === "pending"
  );

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
        {/* Pending Courses Section */}
        {pendingCourses.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center text-slate-900">
              <AlertCircle className="mr-3 text-amber-500" />
              Pending Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCourses.map((course) => (
                <div
                  key={course.id}
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
                          Pending Activation
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              {activeCourses.map((course) => (
                <div
                  key={course.id}
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
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold">
                          {course.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <Link
                      href={`/mycourses/${course.slug}`}
                      className="w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors block"
                    >
                      {course.progress === 100
                        ? "Review Course"
                        : "Continue Learning"}
                    </Link>
                  </div>
                </div>
              ))}
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
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
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
