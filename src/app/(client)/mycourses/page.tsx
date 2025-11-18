"use client";
import React from "react";
import Image from "next/image";
import { Clock, BookOpen, AlertCircle } from "lucide-react";
import Link from "next/link";

// Mock data - replace with actual data from your backend/context
const enrolledCourses = [
  {
    id: "1",
    title: "Advanced Web Development",
    slug: "advanced-web-development",
    tutor: "Jane Smith",
    image: "/images/courses/course-1.jpg",
    progress: 80,
    status: "active",
  },
  {
    id: "2",
    title: "React for Beginners",
    slug: "react-for-beginners",
    tutor: "Peter Jones",
    image: "/images/courses/course-2.jpg",
    progress: 100,
    status: "active",
  },
  {
    id: "3",
    title: "UI/UX Design Fundamentals",
    slug: "ui-ux-design-fundamentals",
    tutor: "Emily White",
    image: "/images/courses/course-3.jpg",
    status: "pending",
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
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-gray-600">
            Continue your learning journey and manage your enrollments.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {/* Pending Courses Section */}
        {pendingCourses.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <AlertCircle className="mr-3 text-yellow-500" />
              Pending Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden opacity-75"
                >
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={400}
                    height={225}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      By {course.tutor}
                    </p>
                    <div className="flex items-center justify-between bg-yellow-100 text-yellow-800 p-3 rounded-md">
                      <div className="flex items-center">
                        <Clock size={18} className="mr-2" />
                        <span className="font-semibold">
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
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <BookOpen className="mr-3 text-purple-600" />
            My Active Courses
          </h2>
          {activeCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
                >
                  <Link href={`/mycourses/${course.slug}`}>
                    <Image
                      src={course.image}
                      alt={course.title}
                      width={400}
                      height={225}
                      className="w-full h-48 object-cover cursor-pointer"
                    />
                  </Link>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      By {course.tutor}
                    </p>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-purple-600 h-2.5 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <Link
                      href={`/mycourses/${course.slug}`}
                      className="w-full text-center bg-purple-600 text-white py-2 rounded-md font-semibold hover:bg-purple-700 transition-colors block"
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
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">
                No Active Courses
              </h3>
              <p className="text-gray-600 mb-6">
                You are not enrolled in any active courses yet.
              </p>
              <Link
                href="/courses"
                className="bg-purple-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-purple-700 transition-colors"
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