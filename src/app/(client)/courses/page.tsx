"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Course } from "@/data/courses";
import {
  BookOpen,
  Users,
  ArrowRight,
  Search,
  Filter,
  X,
  Star,
  ChevronDown,
  Grid3x3,
  List,
} from "lucide-react";

const CoursesPage = () => {
  // Main State
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">(
    "all"
  );
  const [sortBy, setSortBy] = useState<
    "newest" | "popular" | "rating" | "price-low" | "price-high"
  >("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/courses");
        const result = await response.json();

        if (result.success) {
          setCourses(result.data);
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

  // Filter & Sort Logic
  const filteredAndSortedCourses = useMemo(() => {
    let result = [...courses];

    // Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.tutor.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query)
      );
    }

    // Price Filter
    if (priceFilter !== "all") {
      result = result.filter((course) => course.pricingType === priceFilter);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.students - a.students;
        case "price-low":
          const priceA = parseInt(a.price.replace("$", "")) || 0;
          const priceB = parseInt(b.price.replace("$", "")) || 0;
          return priceA - priceB;
        case "price-high":
          const priceHigh_A = parseInt(a.price.replace("$", "")) || 0;
          const priceHigh_B = parseInt(b.price.replace("$", "")) || 0;
          return priceHigh_B - priceHigh_A;
        case "rating":
          return (b.ratingAverage || 0) - (a.ratingAverage || 0);
        case "newest":
        default:
          return 0;
      }
    });

    return result;
  }, [courses, searchQuery, priceFilter, sortBy]);

  // Stats for sidebar
  const stats = useMemo(() => {
    return {
      total: courses.length,
      free: courses.filter((c) => c.pricingType === "free").length,
      paid: courses.filter((c) => c.pricingType === "paid").length,
    };
  }, [courses]);

  // Loading Skeleton
  if (loading) {
    return (
      <div className="py-24 bg-gray-50 dark:bg-[#0c1427] min-h-screen">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
            <div className="h-12 w-full max-w-2xl bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 lg:py-24 bg-gray-50 dark:bg-[#0b1121] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container 2xl:max-w-[1320px] mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            All Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Browse our comprehensive library of web development courses. From
            MERN Stack to Next.js, find the perfect path for your career.
          </p>

          {/* Search Bar */}
          <div className="relative w-full max-w-2xl mx-auto mb-6">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search courses by title, instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-11 py-3.5 bg-white dark:bg-[#15203b] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all dark:text-white shadow-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filter & View Controls */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left Side - Results Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {filteredAndSortedCourses.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {courses.length}
              </span>{" "}
              courses
            </div>

            {/* Middle - Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "newest"
                      | "popular"
                      | "rating"
                      | "price-low"
                      | "price-high"
                  )
                }
                className="px-4 py-2.5 bg-white dark:bg-[#15203b] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10 cursor-pointer transition-all"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* Right Side - View Toggle & Filter Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-[#15203b] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-[#15203b] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="px-4 py-2.5 bg-white dark:bg-[#15203b] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {filterOpen && (
          <div className="mb-8 p-6 bg-white dark:bg-[#15203b] rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Course Type
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "All Courses", value: "all" },
                    { label: "Free Courses", value: "free" },
                    { label: "Paid Courses", value: "paid" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="price"
                        value={option.value}
                        checked={priceFilter === option.value}
                        onChange={(e) =>
                          setPriceFilter(
                            e.target.value as "all" | "free" | "paid"
                          )
                        }
                        className="w-4 h-4 cursor-pointer accent-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {option.label}
                      </span>
                      <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                        (
                        {option.value === "all"
                          ? stats.total
                          : option.value === "free"
                          ? stats.free
                          : stats.paid}
                        )
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="md:col-span-3 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setPriceFilter("all");
                    setSortBy("newest");
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg font-medium">{error}</p>
          </div>
        )}

        {/* Courses Grid/List */}
        {!loading && !error && (
          <>
            {filteredAndSortedCourses.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    : "space-y-6"
                }
              >
                {filteredAndSortedCourses.map((course, index) => (
                  <CourseCard
                    key={course.slug || index}
                    course={course}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              // Empty State
              <div className="text-center py-20">
                <div className="inline-block p-6 rounded-full bg-gray-100 dark:bg-[#15203b] mb-4">
                  <Search size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery
                    ? `We couldn't find any courses matching "${searchQuery}"`
                    : "No courses available for the selected filters"}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setPriceFilter("all");
                    setSortBy("newest");
                    setFilterOpen(false);
                  }}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  <X size={16} />
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard: React.FC<{
  course: Course;
  viewMode: "grid" | "list";
}> = ({ course, viewMode }) => {
  const rating = course.ratingAverage || 0;
  const ratingCount = course.ratingCount || 0;

  if (viewMode === "list") {
    return (
      <div className="bg-white dark:bg-[#15203b] rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col sm:flex-row group">
        {/* Image */}
        <div className="relative w-full sm:w-64 h-48 sm:h-auto overflow-hidden flex-shrink-0">
          <Image
            src={course.image || "/images/courses/course1.jpg"}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            width={300}
            height={200}
          />
        </div>

        {/* Content */}
        <div className="p-6 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {course.title}
              </h3>
              <div className="bg-purple-600 text-white px-3 py-1 rounded-full font-bold text-sm flex-shrink-0">
                {course.price}
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-2 mb-3">
              <Image
                src={course.tutorImage || "/images/users/user1.jpg"}
                alt={course.tutor}
                className="w-8 h-8 rounded-full"
                width={32}
                height={32}
              />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {course.tutor}
              </span>
            </div>

            {/* Description Preview */}
            {course.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {course.description.replace(/<[^>]*>/g, "")}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <BookOpen
                  size={16}
                  className="text-purple-600 dark:text-purple-400"
                />
                <span>{course.lessons} Lessons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users
                  size={16}
                  className="text-purple-600 dark:text-purple-400"
                />
                <span>{course.students} Students</span>
              </div>
              {rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span>{rating.toFixed(1)}</span>
                  {ratingCount > 0 && (
                    <span className="text-gray-500">({ratingCount})</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
            <Link
              href={`/courses/enroll/${course.slug}`}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <span>Enroll Now</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href={`/courses/${course.slug}`}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="group bg-white dark:bg-[#15203b] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 h-full flex flex-col transform hover:-translate-y-2">
      {/* Course Image */}
      <div className="relative overflow-hidden h-56">
        <Image
          src={course.image || "/images/courses/course1.jpg"}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          width={400}
          height={224}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg">
          {course.price}
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6 flex-grow flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {course.title}
        </h3>

        {/* Instructor Info */}
        <div className="flex items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <Image
            src={course.tutorImage || "/images/users/user1.jpg"}
            alt={course.tutor}
            className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700"
            width={40}
            height={40}
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {course.tutor}
            </p>
          </div>
        </div>

        {/* Course Stats */}
        <div className="flex items-center gap-3 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <BookOpen
              size={16}
              className="text-purple-600 dark:text-purple-400"
            />
            <span>{course.lessons} Lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} className="text-purple-600 dark:text-purple-400" />
            <span>{course.students}</span>
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1 ml-auto">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-2">
          <Link
            href={`/courses/enroll/${course.slug}`}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            <span>Enroll Now</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            href={`/courses/${course.slug}`}
            className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-[#0c1427] hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-semibold px-4 py-2.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

// 👇 ADD THIS LINE HERE
export default CoursesPage;
