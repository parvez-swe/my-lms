"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Course } from "@/data/courses";

const CoursesListTable: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>("All Courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        const result = await response.json();
        if (result.success) {
          setCourses(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleSelect = (option: string) => {
    setSelectedOption(option);
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tutor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalCourses = filteredCourses.length;
  const totalPages = Math.ceil(totalCourses / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const coursesToDisplay = filteredCourses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const deleteCourse = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${slug}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        setCourses(courses.filter((course) => course.slug !== slug));
      } else {
        alert("Failed to delete course");
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
      alert("Failed to delete course");
    }
  };

  if (loading) {
    return (
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <p className="text-center">Loading courses...</p>
      </div>
    );
  }

  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] sm:flex items-center justify-between">
          <div className="trezo-card-title">
            <form className="relative sm:w-[265px]">
              <label className="leading-none absolute ltr:left-[13px] rtl:right-[13px] text-black dark:text-white mt-px top-1/2 -translate-y-1/2">
                <i className="material-symbols-outlined !text-[20px]">search</i>
              </label>
              <input
                type="text"
                placeholder="Search course here..."
                value={searchTerm}
                onChange={handleSearch}
                className="bg-gray-50 border border-gray-50 h-[36px] text-xs rounded-md w-full block text-black pt-[11px] pb-[12px] ltr:pl-[38px] rtl:pr-[38px] ltr:pr-[13px] ltr:md:pr-[16px] rtl:pl-[13px] rtl:md:pl-[16px] placeholder:text-gray-500 outline-0 dark:bg-[#15203c] dark:text-white dark:border-[#15203c] dark:placeholder:text-gray-400"
              />
            </form>
          </div>
          <div className="trezo-card-subtitle mt-[15px] sm:mt-0">
            <Menu as="div" className="trezo-card-dropdown relative">
              <MenuButton className="trezo-card-dropdown-btn inline-block rounded-md border border-gray-100 py-[5px] md:py-[6.5px] px-[12px] md:px-[19px] transition-all hover:bg-gray-50 dark:border-[#172036] dark:hover:bg-[#0a0e19]">
                <span className="inline-block relative ltr:pr-[17px] ltr:md:pr-[20px] rtl:pl-[17px] rtl:ml:pr-[20px]">
                  {selectedOption}
                  <i className="ri-arrow-down-s-line text-lg absolute ltr:-right-[3px] rtl:-left-[3px] top-1/2 -translate-y-1/2"></i>
                </span>
              </MenuButton>

              <MenuItems
                transition
                className="transition-all bg-white shadow-3xl rounded-md top-full py-[15px] absolute ltr:right-0 rtl:left-0 w-[195px] z-[50] dark:bg-dark dark:shadow-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                {["Paid", "Free", "Top Rated", "Best Seller"].map((option) => (
                  <MenuItem
                    key={option}
                    as="div"
                    className={`block w-full transition-all text-black cursor-pointer ltr:text-left rtl:text-right relative py-[8px] px-[20px] hover:bg-gray-50 dark:text-white dark:hover:bg-black ${
                      selectedOption === option ? "font-semibold" : ""
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {option}
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>
        </div>

        <div className="trezo-card-content -mx-[20px] md:-mx-[25px]">
          <div className="table-responsive overflow-x-auto">
            <table className="w-full">
              <thead className="text-black dark:text-white">
                <tr>
                  <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                    ID
                  </th>
                  <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                    Course Name
                  </th>
                  <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                    Category
                  </th>
                  <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                    Instructor
                  </th>
                  <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                    Enrolled
                  </th>
                  <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                    Start Date
                  </th>
                  <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                    End Date
                  </th>
                  <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                    Price
                  </th>
                  <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="text-black dark:text-white">
                {coursesToDisplay.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="ltr:text-left rtl:text-right px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] text-center"
                    >
                      <span className="text-gray-500 dark:text-gray-400">
                        No courses found
                      </span>
                    </td>
                  </tr>
                ) : (
                  coursesToDisplay.map((course) => (
                    <tr key={course.slug}>
                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                        <span className="text-gray-500 dark:text-gray-400">
                          {course.slug.substring(0, 8)}
                        </span>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                        <Link
                          href={`/dashboard/courses/details/${course.slug}`}
                          className="inline-block font-medium transition-all text-gray-500 dark:text-gray-400 hover:text-primary-500"
                        >
                          {course.title}
                        </Link>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                        Technology
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                        <div className="flex items-center">
                          <div className="rounded-full w-[40px]">
                            <Image
                              src={course.tutorImage}
                              className="inline-block rounded-full"
                              alt="user-image"
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className="ltr:ml-[12px] rtl:mr-[12px]">
                            <span className="block font-medium">
                              {course.tutor}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                        <span className="text-gray-500 dark:text-gray-400">
                          {course.students}
                        </span>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                        <span className="text-gray-500 dark:text-gray-400">
                          -
                        </span>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                        <span className="text-gray-500 dark:text-gray-400">
                          -
                        </span>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                        <span className="text-gray-500 dark:text-gray-400">
                          {course.price}
                        </span>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                        <div className="flex items-center gap-[9px]">
                          <div className="relative group">
                            <Link
                              href={`/dashboard/courses/details/${course.slug}`}
                              className="text-primary-500 leading-none"
                            >
                              <i className="material-symbols-outlined !text-md">
                                visibility
                              </i>
                            </Link>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              View
                              {/* Arrow */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-white dark:border-[#172036] border-t-gray-800 dark:border-t-gray-800"></div>
                            </div>
                          </div>

                          <div className="relative group">
                            <Link
                              href={`/dashboard/courses/update/${course.slug}`}
                              className="text-gray-500 leading-none"
                            >
                              <i className="material-symbols-outlined !text-md">
                                edit
                              </i>
                            </Link>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Edit
                              {/* Arrow */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-white dark:border-[#172036] border-t-gray-800 dark:border-t-gray-800"></div>
                            </div>
                          </div>

                          <div className="relative group">
                            <button
                              type="button"
                              className="text-danger-500 leading-none"
                              onClick={() => deleteCourse(course.slug)}
                            >
                              <i className="material-symbols-outlined !text-md">
                                delete
                              </i>
                            </button>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Delete
                              {/* Arrow */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-white dark:border-[#172036] border-t-gray-800 dark:border-t-gray-800"></div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-[20px] py-[12px] md:py-[14px] rounded-b-md border-l border-r border-b border-gray-100 dark:border-[#172036] sm:flex sm:items-center justify-between">
            <p className="!mb-0 !text-sm">
              Showing {startIndex + 1} to {Math.min(endIndex, totalCourses)} of{" "}
              {totalCourses} results
            </p>

            <ol className="mt-[10px] sm:mt-0">
              <li className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500"
                >
                  <span className="opacity-0">0</span>
                  <i className="material-symbols-outlined left-0 right-0 absolute top-1/2 -translate-y-1/2">
                    chevron_left
                  </i>
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, index) => (
                <li
                  key={index}
                  className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0"
                >
                  <button
                    onClick={() => handlePageChange(index + 1)}
                    className={`w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500 ${
                      currentPage === index + 1
                        ? "border-primary-500 bg-primary-500 text-white"
                        : ""
                    }`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}

              <li className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500"
                >
                  <span className="opacity-0">0</span>
                  <i className="material-symbols-outlined left-0 right-0 absolute top-1/2 -translate-y-1/2">
                    chevron_right
                  </i>
                </button>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursesListTable;
