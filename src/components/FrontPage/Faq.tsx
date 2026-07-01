"use client";

import React, { useState, useEffect } from "react";
import { FaqDocument } from "@/models/Faq";
import FaqAccordion from "./FaqAccordion";

interface FaqProps {
  variant?: "home" | "embedded";
}

const Faq: React.FC<FaqProps> = ({ variant = "home" }) => {
  const [data, setData] = useState<Partial<FaqDocument>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/faq");
        if (response.ok) {
          const jsonData = await response.json();
          setData(jsonData);
        }
      } catch (error) {
        console.error("FAQ fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isHome = variant === "home";

  return (
    <section
      className={
        isHome
          ? "relative py-20 md:py-28 bg-slate-50 dark:bg-[#0a1020]"
          : "relative py-12 md:py-16"
      }
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 2xl:max-w-[1320px]">
        {isHome && (
          <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
            <span className="mb-4 inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              {data.title || "FAQ's"}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white md:text-4xl lg:text-5xl">
              {data.subtitle || "Common Questions About The Course & Mentorship"}
            </h2>
          </div>
        )}

        {loading ? (
          <div className="mx-auto max-w-3xl space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl bg-slate-200 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <FaqAccordion items={data.faqs || []} />
          </div>
        )}
      </div>
    </section>
  );
};

export default Faq;
