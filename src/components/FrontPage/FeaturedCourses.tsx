"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { Course } from "@/data/courses";
import { BookOpen, Users, ArrowRight } from "lucide-react";

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
          // Limit to first 8 courses for featured section
          setCourses(result.data.slice(0, 8));
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
      <section className="py-16 md:py-20 lg:py-24 bg-gray-50 dark:bg-[#0c1427]">
        <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
          <div className="text-center">
            <div className="inline-block animate-pulse">
              <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-12 w-96 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#0c1427] rounded-xl shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || courses.length === 0) {
    return (
      <section className="py-16 md:py-20 lg:py-24 bg-gray-50 dark:bg-[#0c1427]">
        <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {error || "No courses available at the moment"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-[#0c1427] dark:to-[#0a1120] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container 2xl:max-w-[1320px] mx-auto px-[12px] relative z-[1]">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-block relative mb-6">
            <span className="absolute top-[4.5px] w-[5px] h-[5px] ltr:-left-[3.6px] rtl:-right-[3.6px] bg-purple-600 dark:bg-purple-500 -rotate-[6.536deg]"></span>
            <span className="absolute -top-[9.5px] w-[5px] h-[5px] ltr:right-0 rtl:left-0 bg-purple-600 dark:bg-purple-500 -rotate-[6.536deg]"></span>
            <span className="inline-block relative text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-500 py-[6px] px-[20px] -rotate-[6.536deg] font-semibold text-sm uppercase tracking-wider">
              Featured Courses
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Explore Our Featured Courses
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover expertly crafted courses designed to help you achieve your
            learning goals
          </p>
        </div>

        {/* Courses Slider */}
        <div className="relative" id="frontPageCoursesSlides">
          <div className="grid grid-cols-1 lg:grid-cols-2  2xl:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <div key={course.slug || index} className="h-auto">
                <div className="group bg-white dark:bg-[#0c1427] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 h-full flex flex-col transform hover:-translate-y-2">
                  {/* Course Image */}
                  <div className="relative overflow-hidden">
                    <Image
                      src={course.image || "/images/courses/course1.jpg"}
                      alt={course.title}
                      className="w-full h-90 object-cover transition-transform duration-500 group-hover:scale-110"
                      width={400}
                      height={224}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                      {course.price}
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6 flex-grow flex flex-col">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {course.title}
                    </h3>

                    {/* Instructor */}
                    <div className="flex items-center mb-4">
                      <div className="relative">
                        <Image
                          src={course.tutorImage || "/images/users/user1.jpg"}
                          alt={course.tutor}
                          className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md"
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {course.tutor}
                        </p>
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <BookOpen
                          size={16}
                          className="text-purple-600 dark:text-purple-400"
                        />
                        <span className="font-medium">
                          {course.lessons} Lessons
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users
                          size={16}
                          className="text-purple-600 dark:text-purple-400"
                        />
                        <span className="font-medium">
                          {course.students} Students
                        </span>
                      </div>
                    </div>

                    {/* Description Preview */}
                    {course.description && (
                      <div
                        className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-grow prose prose-sm max-w-none prose-p:text-sm prose-p:m-0 prose-strong:text-gray-900 dark:prose-strong:text-gray-100"
                        dangerouslySetInnerHTML={{
                          __html:
                            course.description
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 150) + "...",
                        }}
                      />
                    )}

                    {/* Action Buttons */}
                    <div className="mt-auto pt-4 space-y-2 border-t border-gray-100 dark:border-gray-800">
                      <Link
                        href={`/courses/enroll/${course.slug}`}
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        <span>Enroll Now</span>
                        <ArrowRight
                          size={18}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </Link>
                      <Link
                        href={`/courses/${course.slug}`}
                        className="flex items-center justify-center gap-2 bg-transparent border-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold px-4 py-2.5 rounded-lg transition-all duration-200"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Courses Link */}
        <div className="text-center mt-12">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold hover:gap-3 transition-all group"
          >
            <span>View All Courses</span>
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .swiper-button-prev-custom::after,
        .swiper-button-next-custom::after {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturedCourses;
