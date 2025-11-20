"use client";

import React from "react";

const Faq: React.FC = () => {
  // Initialize openIndex to 0 to open the first item by default
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  // Personalized FAQ Data based on your profile
  const faqData = [
    {
      question: "Who is the instructor?",
      answer:
        "I am Parvez Musharaf, a final-year Software Engineering student at Daffodil International University and a Top-Rated Full Stack Developer on Upwork. I combine academic knowledge with real-world freelancing experience to teach you industry-standard coding.",
    },
    {
      question: "What technologies will I learn here?",
      answer:
        "My primary focus is the MERN Stack (MongoDB, Express, React, Node.js) and Next.js. I also cover essential tools like TypeScript, Tailwind CSS, Prisma, and PostgreSQL to help you build modern, scalable web applications.",
    },
    {
      question: "Is this suitable for absolute beginners?",
      answer:
        "Yes! I cover everything from the fundamentals of HTML, CSS, and JavaScript to advanced backend architecture. Whether you are just starting or looking to upgrade your skills to Next.js, you will find valuable content.",
    },
    {
      question: "Do you provide freelancing guidelines?",
      answer:
        "Absolutely. Aside from coding, I share my personal strategies for succeeding on platforms like Upwork and Fiverr. I teach you how to write winning proposals, manage clients, and deliver high-quality work to maintain a 100% Job Success Score.",
    },
    {
      question: "Where can I find the source code for the tutorials?",
      answer:
        "All source code for my projects and tutorials is available on my GitHub profile. I believe in open-source learning, so you can clone the repos and practice along with the videos.",
    },
    {
      question: "How can I hire you for a project?",
      answer:
        "If you need a custom web application or SaaS solution, you can hire me directly through Upwork or contact me via my portfolio website. I specialize in building business-ready applications with clean architecture.",
    },
  ];

  return (
    <>
      <div className="relative z-[1] pt-[60px] md:pt-[80px] lg:pt-[100px] xl:pt-[150px]">
        <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
          <div className="mx-auto text-center lg:max-w-[650px] xl:max-w-[810px] 2xl:max-w-[785px] mb-[35px] md:mb-[50px] lg:mb-[65px] xl:mb-[90px]">
            <div className="inline-block relative mt-[10px] mb-[20px]">
              <span className="absolute top-[4.5px] w-[5px] h-[5px] ltr:-left-[3.6px] rtl:-right-[3.6px] bg-purple-600 -rotate-[6.536deg]"></span>
              <span className="absolute -top-[9.5px] w-[5px] h-[5px] ltr:right-0 rtl:left-0 bg-purple-600 -rotate-[6.536deg]"></span>
              <span className="inline-block relative text-purple-600 border border-purple-600 py-[5.5px] px-[17.2px] -rotate-[6.536deg]">
                FAQ&apos;s
                <span className="absolute -bottom-[2.5px] w-[5px] h-[5px] ltr:-left-[3.5px] rtl:-right-[3.5px] bg-purple-600 -rotate-[6.536deg]"></span>
                <span className="absolute -bottom-[2.5px] w-[5px] h-[5px] ltr:-right-[3.5px] rtl:-left-[3.5px] bg-purple-600 -rotate-[6.536deg]"></span>
              </span>
            </div>
            <h2 className="!mb-0 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] md:-tracking-[.6px] lg:-tracking-[.8px] xl:-tracking-[1px] !leading-[1.2]">
              Common Questions About The Course & Mentorship
            </h2>
          </div>

          <div
            className="toc-accordion mx-auto md:max-w-[738px]"
            id="tablesOfContentAccordion"
          >
            {faqData.map((item, index) => (
              <div
                key={index}
                className="toc-accordion-item bg-white dark:bg-[#0c1427] rounded-md text-black dark:text-white mb-[15px] last:mb-0"
              >
                <button
                  className={`toc-accordion-button open text-base md:text-[15px] lg:text-md py-[13px] px-[20px] md:px-[25px] block w-full ltr:text-left rtl:text-right font-medium relative ${
                    openIndex === index ? "open" : ""
                  }`}
                  type="button"
                  onClick={() => toggleAccordion(index)}
                >
                  {item.question}
                  <i className="ri-arrow-down-s-line absolute top-1/2 -translate-y-1/2 ltr:right-[20px] rtl:left-[20px] md:ltr:right-[25px] md:rtl:left-[25px] text-[20px]"></i>
                </button>

                <div
                  className={`toc-accordion-collapse px-[20px] md:px-[25px] pb-[20px] ${
                    openIndex === index ? "open" : "hidden"
                  }`}
                >
                  <p className="text-gray-500 dark:text-gray-400 leading-[1.7]">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Faq;
