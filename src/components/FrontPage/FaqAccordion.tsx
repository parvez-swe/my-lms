"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircleQuestion } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  className?: string;
}

export default function FaqAccordion({ items, className = "" }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items.length) {
    return (
      <p className="text-center text-slate-500 dark:text-gray-400 py-12">
        No questions available yet.
      </p>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
              isOpen
                ? "border-violet-300/60 bg-white shadow-lg shadow-violet-500/10 dark:border-violet-500/40 dark:bg-[#15203b]"
                : "border-slate-200/80 bg-white hover:border-violet-200 hover:shadow-md dark:border-gray-700 dark:bg-[#15203b] dark:hover:border-violet-500/30"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-start gap-4 p-5 text-left md:p-6"
              aria-expanded={isOpen}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isOpen
                    ? "bg-violet-600 text-white"
                    : "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                }`}
              >
                {isOpen ? (
                  <MessageCircleQuestion size={18} />
                ) : (
                  <HelpCircle size={18} />
                )}
              </span>
              <span className="flex-1">
                <span className="block text-base font-semibold text-slate-900 dark:text-white md:text-lg">
                  {item.question}
                </span>
              </span>
              <ChevronDown
                size={20}
                className={`mt-1 shrink-0 text-slate-400 transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-violet-600" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="border-t border-slate-100 px-5 pb-5 pt-0 text-sm leading-relaxed text-slate-600 dark:border-gray-700 dark:text-gray-300 md:px-6 md:pb-6 md:text-base ltr:pl-[4.25rem] rtl:pr-[4.25rem] md:ltr:pl-[5.25rem] md:rtl:pr-[5.25rem]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
