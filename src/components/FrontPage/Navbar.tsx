"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ProfileMenu from "@/components/Layout/Header/ProfileMenu";
import NotificationBell from "@/components/Notifications/NotificationBell";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { BRAND } from "@/lib/brand";

// Define interface for type safety
interface NavItem {
  name: string;
  path: string;
  isAdmin?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Home", path: "/" },
  { name: "Courses", path: "/courses/" },
  // { name: "Our Team", path: "/front-pages/team/" },
  { name: "FAQ's", path: "/front-pages/faq/" },
  { name: "Contact", path: "/front-pages/contact/" },
  { name: "Admin", path: "/dashboard/", isAdmin: true },
];

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const handleToggle = () => setMenuOpen(!isMenuOpen);
  const closeMenu = () => setMenuOpen(false); // Helper to close menu

  // handleScroll
  useEffect(() => {
    const elementId = document.getElementById("navbar");
    const handleScroll = () => {
      if (window.scrollY > 100) {
        elementId?.classList.add("is-sticky");
      } else {
        elementId?.classList.remove("is-sticky");
      }
    };

    document.addEventListener("scroll", handleScroll);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div
        className="fixed top-0 right-0 left-0 z-[50] min-h-28 border-b border-gray-200/60 bg-white/95 py-5 backdrop-blur-md transition-all dark:border-gray-800/60 dark:bg-[#0c1427]/95"
        id="navbar"
      >
        <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
          <div className="flex items-center relative flex-wrap lg:flex-nowrap justify-between lg:justify-start">
            <Link
              href="/"
              className="inline-block max-w-[160px] ltr:mr-[15px] rtl:ml-[15px]"
              onClick={closeMenu}
            >
              <Image
                src={BRAND.logo}
                alt={BRAND.name}
                className="inline-block h-9 w-auto"
                width={140}
                height={36}
                priority
              />
            </Link>

            <button
              type="button"
              className="inline-block relative leading-none lg:hidden"
              onClick={handleToggle}
            >
              <span className="h-[3px] w-[30px] my-[5px] block bg-black dark:bg-white"></span>
              <span className="h-[3px] w-[30px] my-[5px] block bg-black dark:bg-white"></span>
              <span className="h-[3px] w-[30px] my-[5px] block bg-black dark:bg-white"></span>
            </button>

            {/* For Big Devices */}
            <div className="hidden lg:flex items-center grow basis-full">
              <ul className="flex ltr:ml-[30px] rtl:mr-[30px] ltr:xl:ml-[55px] rtl:xl:mr-[55px] flex-row gap-[30px] xl:gap-[50px]">
                {NAV_ITEMS.map((item) => {
                  // BUG FIX 1: Check for Admin Logic
                  // If the item is for admins only, and there is no session (or user is not admin), hide it.
                  // Note: If your session has a role property, use: session?.user?.role !== 'admin'
                  if (item.isAdmin && !session?.user) return null;

                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`font-medium transition-all hover:text-primary-600 text-[15px] xl:text-md dark:text-gray-400 ${
                          pathname === item.path
                            ? "text-primary-600 dark:text-primary-600"
                            : ""
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center ltr:ml-auto rtl:mr-auto gap-[15px]">
                <ThemeToggle />
                {status === "loading" ? (
                  <div className="w-[35px] h-[35px] rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                ) : session?.user ? (
                  <>
                    <NotificationBell viewAllHref="/profile?tab=notifications" />
                    <ProfileMenu />
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      className="inline-block text-purple-600 lg:text-[15px] xl:text-[16px] py-[11px] px-[17px] rounded-md transition-all font-medium border border-purple-600 hover:text-white hover:bg-purple-500 hover:border-purple-500"
                    >
                      <span className="inline-block relative ltr:pl-[25px] rtl:pr-[25px] ltr:md:pl-[29px] rtl:md:pr-[29px]">
                        <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 !text-[20px] md:!text-[24px]">
                          login
                        </i>
                        Login
                      </span>
                    </Link>

                    <Link
                      href="/authentication/sign-up"
                      className="inline-block lg:text-[15px] xl:text-[16px] py-[11px] px-[17px] bg-purple-600 text-white rounded-md transition-all font-medium border border-purple-600 hover:bg-purple-500 hover:border-purple-500"
                    >
                      <span className="inline-block relative ltr:pl-[25px] rtl:pr-[25px] ltr:md:pl-[29px] rtl:md:pr-[29px]">
                        <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 !text-[20px] md:!text-[24px]">
                          person
                        </i>
                        Register
                      </span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* For Responsive (Mobile) */}
            <div
              className={`bg-white dark:bg-black mt-[20px] p-[20px] md:p-[30px] w-full lg:hidden ${
                isMenuOpen ? "block" : "hidden"
              }`}
              id="navbar-collapse"
            >
              <ul>
                {NAV_ITEMS.map((item) => {
                  // BUG FIX 1: Same check for Mobile Menu
                  if (item.isAdmin && !session?.user) return null;

                  return (
                    <li
                      key={item.path}
                      className="my-[14px] md:my-[16px] first:mt-0 last:mb-0"
                    >
                      <Link
                        href={item.path}
                        // BUG FIX 2: Close menu on click
                        onClick={closeMenu}
                        className={`font-medium dark:text-primary-600 transition-all hover:text-primary-600 ${
                          pathname === item.path ? "text-primary-600" : ""
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center gap-[15px] mt-[14px] md:mt-[16px]">
                <ThemeToggle />
                {status === "loading" ? (
                  <div className="w-[35px] h-[35px] rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                ) : session?.user ? (
                  <>
                    <NotificationBell viewAllHref="/profile?tab=notifications" />
                    <ProfileMenu />
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      onClick={closeMenu}
                      className="inline-block text-purple-600 lg:text-[15px] xl:text-[16px] py-[11px] px-[17px] rounded-md transition-all font-medium border border-purple-600 hover:text-white hover:bg-purple-500 hover:border-purple-500"
                    >
                      <span className="inline-block relative ltr:pl-[25px] rtl:pr-[25px] ltr:md:pl-[29px] rtl:md:pr-[29px]">
                        <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 !text-[20px] md:!text-[24px]">
                          login
                        </i>
                        Login
                      </span>
                    </Link>

                    <Link
                      href="/authentication/sign-up"
                      onClick={closeMenu}
                      className="inline-block lg:text-[15px] xl:text-[16px] py-[11px] px-[17px] bg-purple-600 text-white rounded-md transition-all font-medium border border-purple-600 hover:bg-purple-500 hover:border-purple-500"
                    >
                      <span className="inline-block relative ltr:pl-[25px] rtl:pr-[25px] ltr:md:pl-[29px] rtl:md:pr-[29px]">
                        <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 !text-[20px] md:!text-[24px]">
                          person
                        </i>
                        Register
                      </span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
