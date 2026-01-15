'use client';

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import { HeroSectionDocument } from "@/models/HeroSection";

export default function HeroBanner() {
  const [data, setData] = useState<Partial<HeroSectionDocument>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/hero-section');
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
    <section className="relative bg-gray-50 dark:bg-[#111111] text-gray-900 dark:text-white overflow-hidden min-h-[600px] lg:min-h-[800px] flex items-center font-sans transition-colors duration-500">
      {/* Background Decoration - Abstract Map/City vibe */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
        {/* Subtle world map placeholder pattern 
            Logic: In light mode, we see the dark map lines. 
            In dark mode, we invert it to see white lines.
        */}
        <div
          className="absolute inset-0 bg-repeat dark:invert transition-all duration-500"
          style={{
            backgroundImage:
              'url("https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/2560px-World_map_-_low_resolution.svg.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        {/* City skyline/Fade silhouette at bottom - matches the bg color */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-[#111111] to-transparent transition-colors duration-500"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 lg:pt-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content Area */}
          <div className="flex flex-col items-start max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-[64px] leading-[1.1] font-extrabold uppercase tracking-tight mb-6 text-gray-900 dark:text-white transition-colors duration-500">
              {data.title}{" "}
              {/* Accent color in light mode, White in dark mode for emphasis */}
              <span className="text-[#c0392b] dark:text-white transition-colors duration-500">
                {data.accentText}
              </span>
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl mb-10 leading-relaxed max-w-xl font-light transition-colors duration-500">
              {data.subtitle}
            </p>

            {/* CTA Button */}
            <a
              href={data.ctaButtonLink}
              className="inline-flex items-center justify-center px-8 py-4 
              bg-[#c0392b] text-white hover:bg-[#a93226] 
              dark:bg-white dark:text-[#c0392b] dark:hover:bg-gray-100 
              transition-all duration-300 rounded-full font-bold text-lg uppercase tracking-wide mb-12 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {data.ctaButtonText}
            </a>

            {data.socialProof && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 border-t border-gray-200 dark:border-gray-800 pt-8 w-full transition-colors duration-500">
              {/* Avatars */}
              <div className="flex items-center">
                <div className="flex -space-x-4">
                  {data.socialProof.avatars.map((avatar, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full border-2 border-gray-50 dark:border-[#111] overflow-hidden relative z-0 bg-gray-300 dark:bg-gray-600 transition-colors duration-500"
                    >
                      <Image
                        src={avatar}
                        alt={`Student ${i}`}
                        height={500}
                        width={500}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="ml-4">
                  <p className="font-bold text-xl text-gray-900 dark:text-white transition-colors duration-500">
                    {data.socialProof.happyLearners}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-500">
                    Happy Learners
                  </p>
                </div>
              </div>

              {/* Vertical Divider (Hidden on mobile) */}
              <div className="hidden sm:block w-px h-12 bg-emerald-500/50"></div>

              {/* Ratings */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-bold text-xl mr-2 text-gray-900 dark:text-white transition-colors duration-500">
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
                      className="text-yellow-500 dark:text-yellow-400 relative overflow-hidden"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-500">
                  ({data.socialProof.numberOfRatings} Ratings)
                </p>
              </div>
            </div>
            )}
          </div>

          {/* Right Image Area */}
          <div className="relative lg:h-[800px] flex items-end justify-center lg:justify-end mt-10 lg:mt-0">
            {/* Glow effect behind the person - adapts to theme */}
            <div className="absolute bottom-0 right-0 w-full h-[80%] bg-gradient-to-t from-gray-50 via-transparent to-transparent dark:from-black dark:via-transparent dark:to-transparent z-20 transition-colors duration-500"></div>

            {/* Placeholder for the user's image */}
            {data.mainImage && (
              <Image
                src={data.mainImage}
                alt="Hero Instructor"
                width={500}
                height={500}
                className="relative z-10 max-h-[500px] lg:max-h-[85%] w-auto object-contain drop-shadow-2xl mask-image-gradient"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
