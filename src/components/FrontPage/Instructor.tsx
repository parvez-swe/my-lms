"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AboutMeDocument } from "@/models/AboutMe";

const Instructor: React.FC = () => {
  const [data, setData] = useState<Partial<AboutMeDocument>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/about-me');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="container 2xl:max-w-[1320px] mx-auto px-[12px] relative z-[1] py-[50px] lg:py-[90px]">
        {/* Section Header */}
        <div className="md:max-w-[500px] lg:max-w-[630px] mb-[35px] md:mb-[50px]">
          <div className="inline-block relative mt-[10px] mb-[20px]">
            <span className="absolute top-[4.5px] w-[5px] h-[5px] ltr:-left-[3.6px] rtl:-right-[3.6px] bg-purple-600 -rotate-[6.536deg]"></span>
            <span className="absolute -top-[9.5px] w-[5px] h-[5px] ltr:right-0 rtl:left-0 bg-purple-600 -rotate-[6.536deg]"></span>
            <span className="inline-block relative text-purple-600 border border-purple-600 py-[5.5px] px-[17.2px] -rotate-[6.536deg]">
              Meet the Instructor
            </span>
          </div>
          <h2 className="!mb-0 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] md:-tracking-[.6px] lg:-tracking-[.8px] xl:-tracking-[1px] !leading-[1.2]">
            Learn from a Real-World Engineer
          </h2>
        </div>

        {/* Main Profile Card */}
        <div className="relative bg-white/[.26] dark:bg-black/[.54] border border-white/[.24] dark:border-black/[.24] backdrop-blur-[3.5999999046325684px] rounded-[15px] p-[20px] md:p-[40px] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[30px] items-center">
            {/* Column 1: Image */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="relative rounded-[10px] overflow-hidden border border-white/20 shadow-lg group">
                <Image
                  src={data.image || ''}
                  alt={data.name || ''}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  width={570}
                  height={650}
                />
              </div>
            </div>

            {/* Column 2: Details */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div>
                <span className="block text-purple-600 font-medium mb-2 tracking-wide uppercase text-sm">
                  {data.location}
                </span>
                <h3 className="text-[28px] md:text-[36px] font-bold mb-2 leading-tight">
                  {data.name}
                </h3>
                <p className="text-[18px] font-medium text-gray-600 dark:text-gray-300 mb-6">
                  {data.title}
                </p>

                <div className="w-full h-px bg-gradient-to-r from-purple-500/50 to-transparent mb-6"></div>

                <div className="space-y-4 text-gray-600 dark:text-gray-300 mb-8 text-[16px] leading-relaxed">
                  <p>{data.bio}</p>
                  <p>{data.mission}</p>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-6 md:gap-10 mb-8">
                  {(data.stats || []).map((stat, index) => (
                    <div key={index} className="flex flex-col">
                      <span className="text-[22px] font-bold text-primary-600">
                        {stat.value}
                      </span>
                      <span className="text-sm opacity-80 uppercase tracking-wider">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                {data.socials && (
                  <div className="flex items-center gap-[15px]">
                    <span className="font-semibold mr-2">Follow Me:</span>
                    <a href={data.socials.youtube} target="_blank" rel="noopener noreferrer" className="w-[45px] h-[45px] flex items-center justify-center rounded-full bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 border border-red-600/20">
                      <i className="ri-youtube-fill text-xl"></i>
                    </a>
                    <a href={data.socials.website} target="_blank" rel="noopener noreferrer" className="w-[45px] h-[45px] flex items-center justify-center rounded-full bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300 border border-purple-600/20">
                      <i className="ri-global-line text-xl"></i>
                    </a>
                    <a href={data.socials.github} target="_blank" rel="noopener noreferrer" className="w-[45px] h-[45px] flex items-center justify-center rounded-full bg-gray-800/10 text-gray-800 dark:text-gray-200 hover:bg-gray-800 hover:text-white transition-all duration-300 border border-gray-800/20">
                      <i className="ri-github-fill text-xl"></i>
                    </a>
                    <a href={data.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-[45px] h-[45px] flex items-center justify-center rounded-full bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 border border-blue-600/20">
                      <i className="ri-linkedin-fill text-xl"></i>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Background Shapes */}
        <div className="ltr:left-[90px] rtl:right-[90px] -z-[1] bottom-[15px] absolute blur-[150px]">
          <Image
            src="/images/front-pages/shape1.png"
            alt="shape1"
            width={530}
            height={530}
          />
        </div>
        <div className="ltr:-right-[15px] rtl:-left-[15px] -z-[1] -bottom-[130px] absolute blur-[125px]">
          <Image
            src="/images/front-pages/shape1.png"
            alt="shape1"
            width={530}
            height={530}
          />
        </div>
      </div>
    </>
  );
};

export default Instructor;
