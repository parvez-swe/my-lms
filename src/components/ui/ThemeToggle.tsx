"use client";

import React from "react";
import { useTheme } from "@/providers/ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  fixed?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  fixed = false,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`light-dark-toggle leading-none inline-block transition-all text-[#fe7a36] ${
        fixed
          ? "fixed top-1/2 -translate-y-1/2 ltr:left-[20px] rtl:right-[20px] ltr:md:left-[25px] rtl:md:right-[25px] z-[9999]"
          : "relative top-[2px]"
      } ${className}`}
      onClick={toggleTheme}
    >
      <i className="material-symbols-outlined !text-[20px] md:!text-[22px]">
        {isDark ? "dark_mode" : "light_mode"}
      </i>
    </button>
  );
};

export default ThemeToggle;
