"use client";

import React from "react";
import Image from "next/image";
import { Course } from "@/data/courses";

interface CourseInstructorProps {
  course: Course;
}

const CourseInstructor: React.FC<CourseInstructorProps> = ({ course }) => {
  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
          <div className="trezo-card-title">
            <h5 className="!mb-0">Course Instructor</h5>
          </div>
        </div>
        <div className="trezo-card-content">
          <div className="flex items-center">
            <Image
              src={course.tutorImage}
              alt="user-image"
              className="rounded-full w-[100px]"
              width={100}
              height={100}
            />
            <div className="ltr:ml-[15px] rtl:mr-[15px]">
              <span className="block text-black dark:text-white text-[17px] mb-[2px] font-medium">
                {course.tutor}
              </span>
            </div>
          </div>
          {course.tutorBio && (
            <>
              <span className="text-black dark:text-white font-medium block mb-[7px] mt-[22px]">
                Bio
              </span>
              <p>{course.tutorBio}</p>
            </>
          )}
          <span className="text-black dark:text-white font-medium block mb-[7px] mt-[22px]">
            Course Description
          </span>
          <p>{course.description}</p>
        </div>
      </div>
    </>
  );
};

export default CourseInstructor;
