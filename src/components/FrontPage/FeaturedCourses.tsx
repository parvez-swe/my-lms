"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { courses } from "@/data/courses";

const FeaturedCourses: React.FC = () => {
  return (
    <>
      <div className="container 2xl:max-w-[1320px] mx-auto px-[12px] relative z-[1]">
        <div className="md:max-w-[500px] lg:max-w-[630px] mb-[35px] md:mb-[50px] lg:mb-[65px] xl:mb-[90px]">
          <div className="inline-block relative mt-[10px] mb-[20px]">
            <span className="absolute top-[4.5px] w-[5px] h-[5px] ltr:-left-[3.6px] rtl:-right-[3.6px] bg-purple-600 -rotate-[6.536deg]"></span>
            <span className="absolute -top-[9.5px] w-[5px] h-[5px] ltr:right-0 rtl:left-0 bg-purple-600 -rotate-[6.536deg]"></span>
            <span className="inline-block relative text-purple-600 border border-purple-600 py-[5.5px] px-[17.2px] -rotate-[6.536deg]">
              Featured Courses
            </span>
          </div>
          <h2 className="!mb-0 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] md:-tracking-[.6px] lg:-tracking-[.8px] xl:-tracking-[1px] !leading-[1.2]">
            Explore our featured courses
          </h2>
        </div>

        <div className="relative" id="frontPageCoursesSlides">
          <Swiper
            navigation={true}
            spaceBetween={25}
            autoplay={{
              delay: 4000,
              disableOnInteraction: true,
            }}
            breakpoints={{
              "0": {
                slidesPerView: 1,
              },
              "576": {
                slidesPerView: 2,
              },
              "992": {
                slidesPerView: 3,
              },
              "1200": {
                slidesPerView: 4,
              },
            }}
            modules={[Autoplay, Navigation]}
          >
            {courses.map((course, index) => (
              <SwiperSlide key={index} className="h-full">
                <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col  h-full">
                  <Image
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                    width={400}
                    height={200}
                  />
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="text-lg font-semibold mb-2">
                      {course.title}
                    </h3>
                    <div className="flex items-center mb-4">
                      <Image
                        src={course.tutorImage}
                        alt={course.tutor}
                        className="w-8 h-8 rounded-full mr-2"
                        width={32}
                        height={32}
                      />
                      <span className="text-gray-600">{course.tutor}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">
                        {course.lessons} lessons
                      </span>
                      <span className="text-gray-500">
                        {course.students} students
                      </span>
                    </div>
                    <div className="mt-auto pt-4 flex justify-between items-center">
                      <span className="text-xl font-bold text-purple-600">
                        {course.price}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/courses/${course.slug}`}
                          className="bg-transparent border border-purple-600 text-purple-600 px-4 py-2 rounded-md"
                        >
                          View Course
                        </Link>
                      </div>
                    </div>
                    <div className="mt-auto pt-4 flex justify-between items-center">
                      <Link
                        href={`/courses/enroll/${course.slug}`}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md w-full text-center"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default FeaturedCourses;
