"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HeroSectionDocument } from "@/models/HeroSection";

const DEFAULT_HERO: Partial<HeroSectionDocument> = {
  title: "Learn What School",
  accentText: "Doesn't Teach You",
  subtitle:
    "At our Academy, you can gain practical knowledge and learn real-world skills that will help you transform your life at work, school and home.",
  ctaButtonText: "Explore Courses",
  ctaButtonLink: "/courses/",
  mainImage: "/myimage.png",
  socialProof: {
    avatars: [],
    happyLearners: "10,000+",
    rating: "4.8+",
    numberOfRatings: "600+",
  },
};

function HeroSkeleton() {
  return (
    <section className="relative flex min-h-[600px] items-center overflow-hidden bg-gray-50 pt-28 dark:bg-[#111111] lg:min-h-[800px]">
      <div className="container relative z-10 mx-auto animate-pulse px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-2xl space-y-6">
            <div className="h-16 w-full max-w-lg rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-16 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-20 w-full max-w-xl rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-14 w-48 rounded-full bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="hidden h-[500px] rounded bg-gray-200 dark:bg-gray-800 lg:block" />
        </div>
      </div>
    </section>
  );
}

export default function HeroBanner() {
  const [data, setData] = useState<Partial<HeroSectionDocument>>(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/hero-section");
        if (response.ok) {
          const jsonData = await response.json();
          setData({ ...DEFAULT_HERO, ...jsonData });
        }
      } catch (error) {
        console.error("Hero fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <HeroSkeleton />;

  const ctaLink =
    !data.ctaButtonLink || data.ctaButtonLink === "#"
      ? "/courses/"
      : data.ctaButtonLink;

  const avatars = data.socialProof?.avatars ?? [];

  return (
    <section className="relative flex min-h-[600px] items-center overflow-hidden bg-gray-50 pt-28 font-sans text-gray-900 transition-colors duration-500 dark:bg-[#111111] dark:text-white lg:min-h-[800px]">
      {/* Background — world map (hosted locally so CSP/network never blocks it) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.12] transition-all duration-500 dark:opacity-[0.08] dark:invert"
          style={{
            backgroundImage: "url('/images/front-pages/world-map.svg')",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent transition-colors duration-500 dark:from-[#111111]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left Content Area */}
          <div className="flex max-w-2xl flex-col items-start">
            <h1 className="mb-6 text-4xl font-extrabold uppercase leading-[1.1] tracking-tight text-gray-900 transition-colors duration-500 dark:text-white md:text-5xl lg:text-[64px]">
              {data.title}{" "}
              <span className="text-[#c0392b] transition-colors duration-500 dark:text-white">
                {data.accentText}
              </span>
            </h1>

            <p className="mb-10 max-w-xl text-lg font-light leading-relaxed text-gray-600 transition-colors duration-500 dark:text-gray-300 md:text-xl">
              {data.subtitle}
            </p>

            <Link
              href={ctaLink}
              className="mb-12 inline-flex transform items-center justify-center rounded-full bg-[#c0392b] px-8 py-4 text-lg font-bold uppercase tracking-wide text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a93226] hover:shadow-xl dark:bg-white dark:text-[#c0392b] dark:hover:bg-gray-100"
            >
              {data.ctaButtonText}
            </Link>

            {data.socialProof && (
              <div className="flex w-full flex-col items-start gap-6 border-t border-gray-200 pt-8 transition-colors duration-500 dark:border-gray-800 sm:flex-row sm:items-center sm:gap-8">
                <div className="flex items-center">
                  <div className="flex -space-x-4">
                    {avatars.slice(0, 4).map((avatar, i) => (
                      <div
                        key={i}
                        className="relative z-0 h-12 w-12 overflow-hidden rounded-full border-2 border-gray-50 bg-gray-300 transition-colors duration-500 dark:border-[#111] dark:bg-gray-600"
                      >
                        <Image
                          src={avatar}
                          alt={`Student ${i + 1}`}
                          height={48}
                          width={48}
                          className="h-full w-full object-cover"
                          unoptimized={avatar.startsWith("data:")}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="ml-4">
                    <p className="text-xl font-bold text-gray-900 transition-colors duration-500 dark:text-white">
                      {data.socialProof.happyLearners}
                    </p>
                    <p className="text-sm text-gray-500 transition-colors duration-500 dark:text-gray-400">
                      Happy Learners
                    </p>
                  </div>
                </div>

                <div className="hidden h-12 w-px bg-emerald-500/50 sm:block" />

                <div>
                  <div className="mb-1 flex items-center gap-1">
                    <span className="mr-2 text-xl font-bold text-gray-900 transition-colors duration-500 dark:text-white">
                      {data.socialProof.rating}
                    </span>
                    <div className="flex text-yellow-500 dark:text-yellow-400">
                      {[...Array(4)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          fill="currentColor"
                          className="text-yellow-500 dark:text-yellow-400"
                        />
                      ))}
                      <Star
                        size={20}
                        fill="currentColor"
                        className="relative overflow-hidden text-yellow-500 dark:text-yellow-400"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 transition-colors duration-500 dark:text-gray-400">
                    ({data.socialProof.numberOfRatings} Ratings)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Image Area */}
          <div className="relative mt-10 flex items-end justify-center lg:mt-0 lg:h-[800px] lg:justify-end">
            <div className="absolute bottom-0 right-0 z-20 h-[80%] w-full bg-gradient-to-t from-gray-50 via-transparent to-transparent transition-colors duration-500 dark:from-black" />

            {data.mainImage && (
              <Image
                src={data.mainImage}
                alt="Hero Instructor"
                width={500}
                height={500}
                priority
                className="relative z-10 max-h-[500px] w-auto object-contain drop-shadow-2xl mask-image-gradient lg:max-h-[85%]"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
