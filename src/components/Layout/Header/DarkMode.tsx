"use client";

import ThemeToggle from "@/components/ui/ThemeToggle";

const DarkMode: React.FC = () => {
  return (
    <div className="relative mx-[8px] md:mx-[10px] lg:mx-[12px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
      <ThemeToggle />
    </div>
  );
};

export default DarkMode;
