"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { BRAND } from "@/lib/brand";

interface SubMenuItem {
  title: string;
  path: string;
  adminOnly?: boolean;
  marketerAccess?: boolean;
  badge?: {
    text: string;
    color: "hot" | "popular" | "top" | "new";
  };
}

interface MenuItem {
  type: "link" | "accordion";
  title: string;
  icon: string;
  path?: string;
  adminOnly?: boolean;
  marketerAccess?: boolean;
  badge?: {
    text: string;
    color: "orange" | "success" | "danger";
  };
  children?: SubMenuItem[];
}

interface MenuSection {
  title: string; // This is the heading (e.g., "Main", "Apps")
  items: MenuItem[];
}

// --- 2. Define Navigation Data Array ---

const menuSections: MenuSection[] = [
  {
    title: "Main",
    items: [
      {
        type: "link",
        title: "Overview",
        icon: "dashboard",
        path: "/dashboard/",
      },
      {
        type: "link",
        title: "Analytics",
        icon: "analytics",
        path: "/dashboard/analytics/",
        adminOnly: true,
        marketerAccess: true,
      },
      {
        type: "accordion",
        title: "Courses",
        icon: "book",
        children: [
          { title: "Course List", path: "/dashboard/courses/" },
          {
            title: "Create Course",
            path: "/dashboard/courses/create/",
            adminOnly: true,
          },
          {
            title: "Enrolments",
            path: "/dashboard/enrolments/",
            adminOnly: true,
          },
        ],
      },
      {
        type: "accordion",
        title: "CMS",
        icon: "note_stack",
        adminOnly: true,
        marketerAccess: true,
        children: [
          { title: "All Pages", path: "/dashboard/pages/", marketerAccess: true },
          { title: "Hero Section", path: "/dashboard/pages/hero-section/", marketerAccess: true },
          { title: "About Me", path: "/dashboard/pages/about-me/", marketerAccess: true },
          { title: "FAQ Section", path: "/dashboard/pages/faq-section/", marketerAccess: true },
          {
            title: "Why Choose Us",
            path: "/dashboard/pages/why-choose-us-section/",
            marketerAccess: true,
          },
        ],
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        type: "link",
        title: "Messages",
        icon: "mail",
        path: "/dashboard/messages/",
      },
      {
        type: "link",
        title: "Chat",
        icon: "chat",
        path: "/dashboard/chats/",
      },
      {
        type: "link",
        title: "AI Chat",
        icon: "smart_toy",
        path: "/dashboard/ai-chats/",
        adminOnly: true,
      },
      {
        type: "link",
        title: "Instructor Approvals",
        icon: "person_check",
        path: "/dashboard/instructor-profiles/",
        adminOnly: true,
      },
      {
        type: "link",
        title: "Course Approvals",
        icon: "fact_check",
        path: "/dashboard/course-approvals/",
        adminOnly: true,
      },
      {
        type: "link",
        title: "Users",
        icon: "group",
        path: "/dashboard/users/",
        adminOnly: true,
      },
    ],
  },
];

const instructorMenuSections: MenuSection[] = [
  {
    title: "Instructor",
    items: [
      { type: "link", title: "Overview", icon: "dashboard", path: "/instructor/" },
      { type: "link", title: "My Profile", icon: "person", path: "/instructor/profile/" },
      {
        type: "accordion",
        title: "My Courses",
        icon: "book",
        children: [
          { title: "Course List", path: "/instructor/courses/" },
          { title: "Create Course", path: "/instructor/courses/create/" },
        ],
      },
      { type: "link", title: "Messages", icon: "mail", path: "/dashboard/messages/" },
      { type: "link", title: "Live Chat", icon: "chat", path: "/dashboard/chats/" },
    ],
  },
];

const marketerMenuSections: MenuSection[] = [
  {
    title: "Marketing",
    items: [
      { type: "link", title: "Overview", icon: "dashboard", path: "/marketer/" },
      { type: "link", title: "Analytics", icon: "analytics", path: "/marketer/analytics/" },
      {
        type: "accordion",
        title: "CMS",
        icon: "note_stack",
        children: [
          { title: "All Pages", path: "/marketer/pages/" },
          { title: "Hero Section", path: "/dashboard/pages/hero-section/" },
          { title: "About Me", path: "/dashboard/pages/about-me/" },
          { title: "FAQ Section", path: "/dashboard/pages/faq-section/" },
          {
            title: "Why Choose Us",
            path: "/dashboard/pages/why-choose-us-section/",
          },
        ],
      },
    ],
  },
];

function itemVisible(
  item: { adminOnly?: boolean; marketerAccess?: boolean },
  role?: string
): boolean {
  if (!item.adminOnly) return true;
  if (role === "admin" || role === "superadmin") return true;
  if (item.marketerAccess && role === "marketer") return true;
  return false;
}

function filterMenuForRole(
  sections: MenuSection[],
  role?: string
): MenuSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => itemVisible(item, role))
        .map((item) => {
          if (item.type !== "accordion" || !item.children) return item;
          return {
            ...item,
            children: item.children.filter((child) => itemVisible(child, role)),
          };
        })
        .filter(
          (item) =>
            item.type === "link" ||
            (item.children && item.children.length > 0)
        ),
    }))
    .filter((section) => section.items.length > 0);
}

// --- 3. Helper Objects for Dynamic Classes ---

const accordionBadgeColors: { [key: string]: string } = {
  orange: "text-orange-500 bg-orange-50 dark:bg-[#ffffff14]",
  success: "text-success-500 bg-success-50 dark:bg-[#ffffff14]",
  danger: "text-danger-500 bg-danger-50 dark:bg-[#ffffff14]",
};

const subItemBadgeColors: { [key: string]: string } = {
  hot: "text-danger-500 bg-danger-100 dark:bg-[#ffffff14]",
  popular: "text-success-600 bg-success-100 dark:bg-[#ffffff14]",
  top: "text-purple-500 bg-purple-100 dark:bg-[#ffffff14]",
  new: "text-orange-500 bg-orange-100 dark:bg-[#ffffff14]",
};

// --- 4. Refactored Component ---

interface SidebarMenuProps {
  toggleActive: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ toggleActive }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const isInstructorPortal = pathname.startsWith("/instructor");
  const isMarketerPortal = pathname.startsWith("/marketer");

  const sections = isInstructorPortal
    ? instructorMenuSections
    : isMarketerPortal
      ? marketerMenuSections
      : menuSections;

  const visibleSections = isInstructorPortal || isMarketerPortal
    ? sections
    : filterMenuForRole(sections, role);

  const homeHref = isInstructorPortal
    ? "/instructor/"
    : isMarketerPortal
      ? "/marketer/"
      : "/dashboard/";

  const [openAccordion, setOpenAccordion] = React.useState<string | null>(
    "Courses"
  );

  const toggleAccordion = (title: string) => {
    setOpenAccordion((prevTitle) => (prevTitle === title ? null : title));
  };

  return (
    <>
      <div className="sidebar-area bg-white dark:bg-[#0c1427] fixed z-[7] top-0 h-screen transition-all rounded-r-md">
        {/* Logo and Close Button (No changes) */}
        <div className="logo bg-white dark:bg-[#0c1427] border-b border-gray-100 dark:border-[#172036] px-[25px] pt-[19px] pb-[15px] absolute z-[2] right-0 top-0 left-0">
          <Link
            href={homeHref}
            className="transition-none relative flex items-center outline-none"
          >
            <Image
              src={BRAND.logo}
              alt={BRAND.name}
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="font-bold text-black dark:text-white relative ltr:ml-[8px] rtl:mr-[8px] top-px text-lg">
              {BRAND.name}
            </span>
          </Link>

          <button
            type="button"
            className="burger-menu inline-block absolute z-[3] top-[24px] ltr:right-[25px] rtl:left-[25px] transition-all hover:text-primary-500"
            onClick={toggleActive}
          >
            <i className="material-symbols-outlined">close</i>
          </button>
        </div>

        {/* Dynamic Menu Content */}
        <div className="pt-[89px] px-[22px] pb-[20px] h-screen overflow-y-scroll sidebar-custom-scrollbar">
          <div className="accordion">
            {visibleSections.map((section, sectionIndex) => (
              <React.Fragment key={section.title}>
                {/* Render Heading (e.g., "Main", "Apps") */}
                <span
                  className={`block relative font-medium uppercase text-gray-400 mb-[8px] text-xs ${
                    sectionIndex > 0 ? "mt-[22px]" : ""
                  }`}
                >
                  {section.title}
                </span>

                {/* Render Items in this Section */}
                {section.items.map((item) => {
                  // --- A. RENDER A SINGLE LINK ---
                  if (item.type === "link") {
                    return (
                      <div
                        key={item.path}
                        className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap"
                      >
                        <Link
                          href={item.path!}
                          className={`accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                            pathname === item.path ? "active" : ""
                          }`}
                        >
                          <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                            {item.icon}
                          </i>
                          <span className="title leading-none">
                            {item.title}
                          </span>
                        </Link>
                      </div>
                    );
                  }

                  // --- B. RENDER AN ACCORDION GROUP ---
                  if (item.type === "accordion") {
                    const isOpen = openAccordion === item.title;
                    return (
                      <div
                        key={item.title}
                        className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap"
                      >
                        <button
                          className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                            isOpen ? "open" : ""
                          }`}
                          type="button"
                          onClick={() => toggleAccordion(item.title)}
                        >
                          <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                            {item.icon}
                          </i>
                          <span className="title leading-none">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span
                              className={`rounded-full font-medium inline-block text-center w-[20px] h-[20px] text-[11px] leading-[20px] ltr:ml-auto rtl:mr-auto ${
                                accordionBadgeColors[item.badge.color]
                              }`}
                            >
                              {item.badge.text}
                            </span>
                          )}
                        </button>

                        <div
                          className={`accordion-collapse ${
                            isOpen ? "open" : "hidden"
                          }`}
                        >
                          <div className="pt-[4px]">
                            <ul className="sidebar-sub-menu">
                              {item.children?.map((child) => (
                                <li
                                  key={child.path}
                                  className="sidemenu-item mb-[4px] last:mb-0"
                                >
                                  <Link
                                    href={child.path}
                                    className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                                      pathname === child.path ? "active" : ""
                                    }`}
                                  >
                                    {child.title}
                                    {child.badge && (
                                      <span
                                        className={`text-[10px] font-medium py-[1px] px-[8px] ltr:ml-[8px] rtl:mr-[8px] inline-block rounded-sm ${
                                          subItemBadgeColors[child.badge.color]
                                        }`}
                                      >
                                        {child.badge.text}
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
