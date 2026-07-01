"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Course } from "@/data/courses";
import CourseCard from "@/components/ui/CourseCard";
import {
  Search,
  Filter,
  X,
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
      <div className="pb-24 bg-gray-50 dark:bg-[#0c1427] min-h-screen">
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
    <div className="min-h-screen pb-20 lg:pb-24 bg-gray-50 dark:bg-[#0b1121] relative overflow-hidden">
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
                    variant={viewMode === "grid" ? "grid" : "list"}
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

// Course listing page
export default CoursesPage;
