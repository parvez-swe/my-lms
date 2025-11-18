"use client";

import React from "react";
import Image from "next/image";

interface Testimonial {
  name: string;
  role: string;
  feedback: string;
  image: string;
  rating: number;
}

const testimonialsData: Testimonial[] = [
  {
    name: "Sarah Thompson",
    role: "Full Stack Developer",
    feedback:
      "The Full Stack Development course was amazing! I learned so much and the hands-on projects helped me build a strong portfolio. I landed a job as a Full Stack Developer right after completing the course.",
    image: "/images/front-pages/user1.jpg",
    rating: 5,
  },
  {
    name: "John Smith",
    role: "Frontend Developer",
    feedback:
      "I took the Frontend Development course and it was fantastic. The instructor was very knowledgeable and the community was very supportive. I highly recommend this course to anyone looking to get into web development.",
    image: "/images/front-pages/user2.jpg",
    rating: 4.5,
  },
  {
    name: "Alex Rodriguez",
    role: "Backend Developer",
    feedback:
      "The Backend Development course was very comprehensive. I learned how to build robust and scalable APIs. The course content was up-to-date and the instructor was always available to help.",
    image: "/images/front-pages/user3.jpg",
    rating: 4,
  },
  {
    name: "Kevin Brown",
    role: "Student",
    feedback:
      "I am a student and I took the GitHub Version Control course. It was very easy to follow and I learned a lot. I am now confident in using Git and GitHub for my projects.",
    image: "/images/front-pages/user4.jpg",
    rating: 5,
  },
  {
    name: "Olivia Adams",
    role: "UI/UX Designer",
    feedback:
      "I wanted to learn how to code and I took the Frontend Development course. It was a great experience and I learned a lot. I am now able to create beautiful and responsive websites.",
    image: "/images/front-pages/user5.jpg",
    rating: 5,
  },
  {
    name: "Daniel Lee",
    role: "Aspiring Developer",
    feedback:
      "I am new to programming and I took the Full Stack Development course. It was challenging but very rewarding. I am now confident in my skills and I am excited to start my career as a developer.",
    image: "/images/front-pages/user3.jpg",
    rating: 4,
  },
];

const Testimonials: React.FC = () => {
  return (
    <>
      <div className="relative z-[1] pb-[60px] md:pb-[80px] lg:pb-[100px] xl:pb-[150px]">
        <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
          <div className="mx-auto text-center md:max-w-[650px] lg:max-w-[810px] xl:max-w-[785px] mb-[35px] md:mb-[50px] lg:mb-[65px] xl:mb-[90px]">
            <div className="inline-block relative mt-[10px] mb-[20px]">
              <span className="absolute top-[4.5px] w-[5px] h-[5px] ltr:-left-[3.6px] rtl:-right-[3.6px] bg-purple-600 -rotate-[6.536deg]"></span>
              <span className="absolute -top-[9.5px] w-[5px] h-[5px] ltr:right-0 rtl:left-0 bg-purple-600 -rotate-[6.536deg]"></span>
              <span className="inline-block relative text-purple-600 border border-purple-600 py-[5.5px] px-[17.2px] -rotate-[6.536deg]">
                Testimonials
              </span>
            </div>
            <h2 className="!mb-0 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] md:-tracking-[.6px] lg:-tracking-[.8px] xl:-tracking-[1px] !leading-[1.2]">
              What Our Students Say
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[25px]">
            {testimonialsData.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-[#0c1427] p-[20px] md:p-[30px] xl:p-[40px] rounded-[7px]"
              >
                <div className="leading-none mb-[12px] md:mb-[20px] text-[16px] md:text-[19px] text-[#fe7a36] flex items-center gap-[4px]">
                  {Array.from({ length: 5 }, (_, i) => (
                    <i
                      key={i}
                      className={`ri-star${
                        i < Math.floor(testimonial.rating)
                          ? "-fill"
                          : i < testimonial.rating
                          ? "-half-fill"
                          : "-line"
                      }`}
                    ></i>
                  ))}
                </div>

                <p className="text-[14px] md:text-[16px] font-medium leading-[1.6]">
                  {testimonial.feedback}
                </p>

                <div className="flex items-center mt-[15px] md:mt-[20px] gap-[12px] md:gap-[15px]">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="rounded-full"
                    width={50}
                    height={50}
                  />
                  <div>
                    <h5 className="!text-[15px] md:!text-[16px] !mb-[3px] !font-semibold">
                      {testimonial.name}
                    </h5>
                    <span className="block">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Testimonials;
