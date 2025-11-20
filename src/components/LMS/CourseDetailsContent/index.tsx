"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Course } from "@/data/courses";
import CourseInstructor from "./CourseInstructor";
import EnrolledStudents from "./EnrolledStudents";
import OverallReviews from "./OverallReviews";
import ManageReviews from "./ManageReviews";

interface CourseDetailsContentProps {
  courseId: string;
}

const CourseDetailsContent: React.FC<CourseDetailsContentProps> = ({
  courseId,
}) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        const result = await response.json();
        if (result.success) {
          setCourse(result.data);
        } else {
          console.error("Failed to fetch course:", result.error);
        }
      } catch (error) {
        console.error("Failed to fetch course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  if (loading) {
    return (
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <p className="text-center">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <p className="text-center text-danger-500">Course not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
          <div className="trezo-card-title">
            <h5 className="!mb-0">Course</h5>
          </div>
          <Link
            href={`/dashboard/courses/update/${course.slug}`}
            className="text-primary-500 hover:underline text-sm"
          >
            Edit Course
          </Link>
        </div>
        <div className="trezo-card-content -mx-[20px] md:-mx-[25px]">
          <div className="table-responsive overflow-x-auto">
            <table className="w-full">
              <thead className="text-black dark:text-white">
                <tr>
                  <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                    Field
                  </th>
                  <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="text-black dark:text-white">
                <tr>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      Title
                    </span>
                  </td>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                    <span className="text-gray-500 dark:text-gray-400">
                      {course.title}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      Price
                    </span>
                  </td>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                    <span className="text-gray-500 dark:text-gray-400">
                      {course.price}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      Tutor
                    </span>
                  </td>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                    <span className="text-gray-500 dark:text-gray-400">
                      {course.tutor}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      Students Enrolled
                    </span>
                  </td>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                    <span className="text-gray-500 dark:text-gray-400">
                      {course.students}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      Total Lessons
                    </span>
                  </td>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                    <span className="text-gray-500 dark:text-gray-400">
                      {course.lessons}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      Description
                    </span>
                  </td>
                  <td className="ltr:text-left rtl:text-right px-[20px] py-[15px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                    <span className="text-gray-500 dark:text-gray-400">
                      {course.description}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
          <div className="trezo-card-title">
            <h5 className="!mb-0">Tables Of Content</h5>
          </div>
        </div>

        <div className="trezo-card-content">
          <div className="lg:grid lg:grid-cols-3 gap-[25px] items-center">
            <div className="lg:col-span-2">
              <div className="2xl:ltr:pr-[120px] 2xl:rtl:pl-[120px]">
                <div className="toc-accordion" id="tablesOfContentAccordion">
                  {course.modules.map((module, moduleIndex) => (
                    <div
                      key={moduleIndex}
                      className="toc-accordion-item bg-gray-50 dark:bg-[#15203c] rounded-md text-black dark:text-white mb-[10px] last:mb-0"
                    >
                      <button
                        className={`toc-accordion-button open text-base md:text-[15px] py-[19px] px-[20px] md:px-[25px] block w-full ltr:text-left rtl:text-right font-semibold relative ${
                          openIndex === moduleIndex ? "open" : ""
                        }`}
                        type="button"
                        onClick={() => toggleAccordion(moduleIndex)}
                      >
                        {module.title}
                        <i className="ri-arrow-down-s-line absolute top-1/2 -translate-y-1/2 ltr:right-[20px] rtl:left-[20px] md:ltr:right-[25px] md:rtl:left-[25px] text-[20px]"></i>
                      </button>

                      <div
                        className={`toc-accordion-collapse px-[20px] md:px-[25px] pb-[18px] ${
                          openIndex === moduleIndex ? "open" : "hidden"
                        }`}
                      >
                        <ul>
                          {module.lessons.map((lesson, lessonIndex) => (
                            <li
                              key={lessonIndex}
                              className="border-b border-gray-100 sm:flex items-center justify-between py-[12px] md:py-[15px] dark:border-[#1c2846] first:pt-0 last:border-0 last:pb-0"
                            >
                              <a
                                href="javascript:void(0);"
                                className="relative inline-block text-gray-500 dark:text-gray-400 transition-all hover:text-primary-500 ltr:pl-[27px] rtl:pr-[27px]"
                              >
                                <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 !text-[20px] -mt-[.5px] text-primary-500 top-1/2 -translate-y-1/2">
                                  play_circle
                                </i>
                                {lesson.title}
                              </a>
                              <span className="block text-gray-500 dark:text-gray-400 mt-[10px] sm:mt-0">
                                {lesson.duration}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-primary-500 rounded-md text-center py-[30px] md:py-[50px] px-[20px] md:px-[30px] 2xl:ltr:-ml-[30px] 2xl:rtl:-mr-[30px] 2xl:ltr:mr-[85px] 2xl:rtl:ml-[85px] mt-[20px] md:mt-[25px] lg:mt-0">
                <h4 className="!mb-[10px] !text-white !text-lg md:!text-[21px]">
                  Course Preview
                </h4>

                <p className="mb-[20px] text-[#e3eaef]">
                  View this course on the frontend
                </p>

                <Link
                  href={`/courses/${course.slug}`}
                  className="inline-block rounded-md font-medium md:text-md py-[11px] md:py-[13px] px-[22px] mb-[15px] text-white bg-[#ffffff14] transition-all hover:bg-white hover:text-black"
                >
                  View Course
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-5 gap-[25px]">
        <div className="lg:col-span-3">
          <CourseInstructor course={course} />
        </div>

        <div className="lg:col-span-2">
          <EnrolledStudents course={course} />
        </div>
      </div>

      <OverallReviews course={course} />

      <ManageReviews course={course} />
    </>
  );
};

export default CourseDetailsContent;
