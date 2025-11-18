"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// --- 1. Define Types for Navigation ---

interface SubMenuItem {
  title: string;
  path: string;
  badge?: {
    text: string;
    color: "hot" | "popular" | "top" | "new";
  };
}

interface MenuItem {
  type: "link" | "accordion";
  title: string;
  icon: string;
  path?: string; // Only for 'link' type
  badge?: {
    text: string;
    color: "orange" | "success" | "danger";
  }; // Only for 'accordion' type
  children?: SubMenuItem[]; // Only for 'accordion' type
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
        type: "accordion",
        title: "Dashboard",
        icon: "dashboard",
        badge: { text: "30", color: "orange" },
        children: [
          { title: "eCommerce", path: "/dashboard/ecommerce/" },
          {
            title: "Project Management",
            path: "/dashboard/project-management/",
          },
          { title: "LMS", path: "/dashboard/lms/" },
          {
            title: "HelpDesk",
            path: "/dashboard/helpdesk/",
            badge: { text: "Hot", color: "hot" },
          },
          { title: "Analytics", path: "/dashboard/analytics/" },
          { title: "Crypto", path: "/dashboard/crypto/" },
          { title: "Sales", path: "/dashboard/sales/" },
          { title: "Hospital", path: "/dashboard/hospital/" },
          { title: "HRM", path: "/dashboard/hrm/" },
          { title: "School", path: "/dashboard/school/" },
          {
            title: "Call Center",
            path: "/dashboard/call-center/",
            badge: { text: "Popular", color: "popular" },
          },
          { title: "Marketing", path: "/dashboard/marketing/" },
          { title: "NFT", path: "/dashboard/nft/" },
          { title: "SaaS", path: "/dashboard/saas/" },
          {
            title: "Real Estate",
            path: "/dashboard/real-estate/",
            badge: { text: "Top", color: "top" },
          },
          { title: "Shipment", path: "/dashboard/shipment/" },
          { title: "Finance", path: "/dashboard/finance/" },
          { title: "POS System", path: "/dashboard/pos-system/" },
          { title: "Podcast", path: "/dashboard/podcast/" },
          { title: "Social Media", path: "/dashboard/social-media/" },
          { title: "Doctor", path: "/dashboard/doctor/" },
          { title: "Beauty Salon", path: "/dashboard/beauty-salon/" },
          { title: "Store Analysis", path: "/dashboard/store-analysis/" },
          { title: "Restaurant", path: "/dashboard/restaurant/" },
          {
            title: "Hotel",
            path: "/dashboard/hotel/",
            badge: { text: "New", color: "new" },
          },
          {
            title: "Real Estate Agent",
            path: "/dashboard/real-estate-agent/",
            badge: { text: "New", color: "new" },
          },
          {
            title: "Credit Card",
            path: "/dashboard/credit-card/",
            badge: { text: "New", color: "new" },
          },
          {
            title: "Crypto Trader",
            path: "/dashboard/crypto-trader/",
            badge: { text: "New", color: "new" },
          },
          {
            title: "Crypto Perf.",
            path: "/dashboard/crypto-performance/",
            badge: { text: "New", color: "new" },
          },
        ],
      },
      {
        type: "accordion",
        title: "Front Pages",
        icon: "note_stack",
        children: [
          { title: "Home", path: "/" },
          { title: "Features", path: "/front-pages/features/" },
          { title: "Our Team", path: "/front-pages/team/" },
          { title: "FAQ’s", path: "/front-pages/faq/" },
          { title: "Contact", path: "/front-pages/contact/" },
        ],
      },
    ],
  },
  {
    title: "Apps",
    items: [
      {
        type: "link",
        title: "To Do List",
        icon: "format_list_bulleted",
        path: "/apps/to-do-list/",
      },
      {
        type: "link",
        title: "Calendar",
        icon: "date_range",
        path: "/apps/calendar/",
      },
      {
        type: "link",
        title: "Contacts",
        icon: "contact_page",
        path: "/apps/contacts/",
      },
      { type: "link", title: "Chat", icon: "chat", path: "/apps/chat/" },
      {
        type: "accordion",
        title: "Email",
        icon: "mail",
        badge: { text: "3", color: "success" },
        children: [
          { title: "Inbox", path: "/apps/email/inbox/" },
          { title: "Compose", path: "/apps/email/compose/" },
          { title: "Read", path: "/apps/email/read/" },
        ],
      },
      {
        type: "link",
        title: "Kanban Board",
        icon: "team_dashboard",
        path: "/apps/kanban-board/",
      },
      {
        type: "accordion",
        title: "File Manager",
        icon: "folder_open",
        badge: { text: "7", color: "danger" },
        children: [
          { title: "My Drive", path: "/apps/file-manager/my-drive/" },
          { title: "Assets", path: "/apps/file-manager/assets/" },
          { title: "Projects", path: "/apps/file-manager/projects/" },
          { title: "Personal", path: "/apps/file-manager/personal/" },
          {
            title: "Applications",
            path: "/apps/file-manager/applications/",
          },
          { title: "Documents", path: "/apps/file-manager/documents/" },
          { title: "Media", path: "/apps/file-manager/media/" },
        ],
      },
    ],
  },
  {
    title: "Pages",
    items: [
      {
        type: "accordion",
        title: "eCommerce",
        icon: "shopping_cart",
        children: [
          { title: "Products Grid", path: "/ecommerce/products-grid/" },
          { title: "Products List", path: "/ecommerce/products-list/" },
          { title: "Product Details", path: "/ecommerce/product-details/" },
          { title: "Create Product", path: "/ecommerce/create-product/" },
          { title: "Edit Product", path: "/ecommerce/edit-product/" },
          { title: "Cart", path: "/ecommerce/cart/" },
          { title: "Checkout", path: "/ecommerce/checkout/" },
          { title: "Orders", path: "/ecommerce/orders/" },
          { title: "Order Details", path: "/ecommerce/order-details/" },
          { title: "Create Order", path: "/ecommerce/create-order/" },
          { title: "Order Tracking", path: "/ecommerce/order-tracking/" },
          { title: "Customers", path: "/ecommerce/customers/" },
          {
            title: "Customer Details",
            path: "/ecommerce/customer-details/",
          },
          { title: "Categories", path: "/ecommerce/categories/" },
          { title: "Sellers", path: "/ecommerce/sellers/" },
          { title: "Seller Details", path: "/ecommerce/seller-details/" },
          { title: "Create Seller", path: "/ecommerce/create-seller/" },
          { title: "Reviews", path: "/ecommerce/reviews/" },
          { title: "Refunds", path: "/ecommerce/refunds/" },
        ],
      },
      {
        type: "accordion",
        title: "CRM",
        icon: "handshake",
        children: [
          { title: "Contacts", path: "/crm/contacts/" },
          { title: "Customers", path: "/crm/customers/" },
          { title: "Leads", path: "/crm/leads/" },
          { title: "Deals", path: "/crm/deals/" },
        ],
      },
      {
        type: "accordion",
        title: "Project Management",
        icon: "description",
        children: [
          {
            title: "Project Overview",
            path: "/project-management/project-overview/",
          },
          {
            title: "Projects List",
            path: "/project-management/projects-list/",
          },
          {
            title: "Create Project",
            path: "/project-management/create-project/",
          },
          { title: "Clients", path: "/project-management/clients/" },
          { title: "Teams", path: "/project-management/teams/" },
          {
            title: "Kanban Board",
            path: "/project-management/kanban-board/",
          },
          { title: "Users", path: "/project-management/users/" },
        ],
      },
      {
        type: "accordion",
        title: "LMS",
        icon: "auto_stories",
        children: [
          { title: "Courses List", path: "/lms/courses-list/" },
          { title: "Course Details", path: "/lms/course-details/" },
          { title: "Lesson Preview", path: "/lms/lesson-preview/" },
          { title: "Create Course", path: "/lms/create-course/" },
          { title: "Edit Course", path: "/lms/edit-course/" },
          { title: "Instructors", path: "/lms/instructors/" },
        ],
      },
      {
        type: "accordion",
        title: "HelpDesk",
        icon: "support",
        children: [
          { title: "Tickets", path: "/helpdesk/tickets/" },
          { title: "Ticket Details", path: "/helpdesk/ticket-details/" },
          { title: "Agents", path: "/helpdesk/agents/" },
          { title: "Reports", path: "/helpdesk/reports/" },
        ],
      },
      {
        type: "accordion",
        title: "NFT Marketplace",
        icon: "store",
        children: [
          { title: "Marketplace", path: "/nft/marketplace/" },
          { title: "Explore All", path: "/nft/explore-all/" },
          { title: "Live Auction", path: "/nft/live-auction/" },
          { title: "NFT Details", path: "/nft/nft-details/" },
          { title: "Creators", path: "/nft/creators/" },
          { title: "Creator Details", path: "/nft/creator-details/" },
          { title: "Wallet Connect", path: "/nft/wallet-connect/" },
          { title: "Create NFT", path: "/nft/create-nft/" },
        ],
      },
      {
        type: "accordion",
        title: "Real Estate",
        icon: "real_estate_agent",
        children: [
          { title: "Property List", path: "/real-estate/property-list/" },
          {
            title: "Property Details",
            path: "/real-estate/property-details/",
          },
          { title: "Add Property", path: "/real-estate/add-property/" },
          { title: "Agents", path: "/real-estate/agents/" },
          { title: "Agent Details", path: "/real-estate/agent-details/" },
          { title: "Add Agent", path: "/real-estate/add-agent/" },
          { title: "Customers", path: "/real-estate/customers/" },
        ],
      },
      {
        type: "accordion",
        title: "Finance",
        icon: "calculate",
        children: [
          { title: "Wallet", path: "/finance/wallet/" },
          { title: "Transactions", path: "/finance/transactions/" },
        ],
      },
      {
        type: "accordion",
        title: "Doctor",
        icon: "badge",
        children: [
          { title: "Patients List", path: "/doctor/patients-list/" },
          { title: "Add Patient", path: "/doctor/add-patient/" },
          { title: "Patient Details", path: "/doctor/patient-details/" },
          { title: "Appointments", path: "/doctor/appointments/" },
          { title: "Prescriptions", path: "/doctor/prescriptions/" },
          {
            title: "Write a Prescription",
            path: "/doctor/write-prescription/",
          },
        ],
      },
      {
        type: "accordion",
        title: "Restaurant",
        icon: "lunch_dining",
        children: [
          { title: "Menus", path: "/restaurant/menus/" },
          { title: "Dish Details", path: "/restaurant/dish-details/" },
        ],
      },
      {
        type: "accordion",
        title: "Hotel",
        icon: "hotel",
        children: [
          { title: "Rooms List", path: "/hotel/rooms-list/" },
          { title: "Room Details", path: "/hotel/room-details/" },
          { title: "Guests List", path: "/hotel/guests-list/" },
        ],
      },
      {
        type: "accordion",
        title: "Real Estate Agent",
        icon: "location_away",
        children: [
          { title: "Properties", path: "/real-estate-agent/properties/" },
          {
            title: "Property Details",
            path: "/real-estate-agent/property-details/",
          },
        ],
      },
      {
        type: "accordion",
        title: "Crypto Trader",
        icon: "paid",
        children: [
          { title: "Transactions", path: "/crypto-trader/transactions/" },
          {
            title: "Gainers Losers",
            path: "/crypto-trader/gainers-losers/",
          },
          { title: "Wallet", path: "/crypto-trader/wallet/" },
        ],
      },
      {
        type: "accordion",
        title: "Events",
        icon: "local_activity",
        children: [
          { title: "Events Grid", path: "/events/" },
          { title: "Events List", path: "/events/events-list/" },
          { title: "Event Details", path: "/events/event-details/" },
          { title: "Create An Event", path: "/events/create-an-event/" },
          { title: "Edit An Event", path: "/events/edit-an-event/" },
        ],
      },
      {
        type: "accordion",
        title: "Social",
        icon: "share",
        children: [
          { title: "Profile", path: "/social/profile/" },
          { title: "Settings", path: "/social/settings/" },
        ],
      },
      {
        type: "accordion",
        title: "Invoices",
        icon: "content_paste",
        children: [
          { title: "Invoices", path: "/invoices/" },
          { title: "Invoice Details", path: "/invoices/invoice-details/" },
          { title: "Create Invoice", path: "/invoices/create-invoice/" },
          { title: "Edit Invoice", path: "/invoices/edit-invoice/" },
        ],
      },
      {
        type: "accordion",
        title: "Users",
        icon: "person",
        children: [
          { title: "Team Members", path: "/users/team-members/" },
          { title: "Users List", path: "/users/users-list/" },
          { title: "Add User", path: "/users/add-user/" },
        ],
      },
      {
        type: "accordion",
        title: "Profile",
        icon: "account_box",
        children: [
          { title: "User Profile", path: "/profile/user-profile/" },
          { title: "Teams", path: "/profile/teams/" },
          { title: "Projects", path: "/profile/projects/" },
        ],
      },
      {
        type: "link",
        title: "Starter",
        icon: "star_border",
        path: "/starter/",
      },
    ],
  },
  {
    title: "Modules",
    items: [
      {
        type: "accordion",
        title: "Icons",
        icon: "emoji_emotions",
        children: [
          { title: "Material Symbols", path: "/icons/material-symbols/" },
          { title: "RemixIcon", path: "/icons/remixicon/" },
        ],
      },
      {
        type: "accordion",
        title: "UI Elements",
        icon: "qr_code_scanner",
        children: [
          { title: "Alerts", path: "/ui-elements/alerts/" },
          { title: "Avatars", path: "/ui-elements/avatars/" },
          { title: "Accordion", path: "/ui-elements/accordion/" },
          { title: "Badges", path: "/ui-elements/badges/" },
          { title: "Buttons", path: "/ui-elements/buttons/" },
          { title: "Breadcrumb", path: "/ui-elements/breadcrumb/" },
          { title: "Dropdowns", path: "/ui-elements/dropdowns/" },
          { title: "Images", path: "/ui-elements/images/" },
          { title: "Modal", path: "/ui-elements/modal/" },
          { title: "Pagination", path: "/ui-elements/pagination/" },
          { title: "Progress", path: "/ui-elements/progress/" },
          { title: "Tooltips", path: "/ui-elements/tooltips/" },
          { title: "Tabs", path: "/ui-elements/tabs/" },
          { title: "Typography", path: "/ui-elements/typography/" },
          { title: "Videos", path: "/ui-elements/videos/" },
        ],
      },
      {
        type: "link",
        title: "Tables",
        icon: "table_chart",
        path: "/tables/",
      },
      {
        type: "accordion",
        title: "Forms",
        icon: "forum",
        children: [
          { title: "Input & Select", path: "/forms/input-select/" },
          {
            title: "Checkboxes & Radios",
            path: "/forms/checkboxes-radios/",
          },
          { title: "Rich Text Editor", path: "/forms/rich-text-editor/" },
          { title: "File Uploader", path: "/forms/file-uploader/" },
        ],
      },
      {
        type: "accordion",
        title: "Charts",
        icon: "pie_chart",
        children: [
          { title: "Line", path: "/charts/line/" },
          { title: "Area", path: "/charts/area/" },
          { title: "Column", path: "/charts/column/" },
          { title: "Mixed", path: "/charts/mixed/" },
          { title: "RadialBar", path: "/charts/radialbar/" },
          { title: "Radar", path: "/charts/radar/" },
          { title: "Pie", path: "/charts/pie/" },
          { title: "Polar", path: "/charts/polar/" },
          { title: "More", path: "/charts/more/" },
        ],
      },
      {
        type: "accordion",
        title: "Authentication",
        icon: "lock_open",
        children: [
          { title: "Sign In", path: "/authentication/sign-in/" },
          { title: "Sign Up", path: "/authentication/sign-up/" },
          {
            title: "Forgot Password",
            path: "/authentication/forgot-password/",
          },
          {
            title: "Reset Password",
            path: "/authentication/reset-password/",
          },
          { title: "Confirm Email", path: "/authentication/confirm-email/" },
          { title: "Lock Screen", path: "/authentication/lock-screen/" },
          { title: "Logout", path: "/authentication/logout/" },
        ],
      },
      {
        type: "accordion",
        title: "Extra Pages",
        icon: "content_copy",
        children: [
          { title: "Pricing", path: "/pricing/" },
          { title: "Timeline", path: "/timeline/" },
          { title: "FAQ", path: "/faq/" },
          { title: "Gallery", path: "/gallery/" },
          { title: "Testimonials", path: "/testimonials/" },
          { title: "Search", path: "/search/" },
          { title: "Coming Soon", path: "/coming-soon/" },
          { title: "Blank Page", path: "/blank-page/" },
        ],
      },
      {
        type: "accordion",
        title: "Errors",
        icon: "error",
        children: [
          { title: "404 Error Page", path: "/not-found/" },
          { title: "Internal Error", path: "/internal-error/" },
        ],
      },
      { type: "link", title: "Widgets", icon: "widgets", path: "/widgets/" },
      { type: "link", title: "Maps", icon: "map", path: "/maps/" },
      {
        type: "link",
        title: "Notifications",
        icon: "notifications",
        path: "/notifications/",
      },
      {
        type: "link",
        title: "Members",
        icon: "people",
        path: "/members/",
      },
    ],
  },
  {
    title: "Others",
    items: [
      {
        type: "link",
        title: "My Profile",
        icon: "account_circle",
        path: "/my-profile/",
      },
      {
        type: "accordion",
        title: "Settings",
        icon: "settings",
        children: [
          { title: "Account Settings", path: "/settings/" },
          { title: "Change Password", path: "/settings/change-password/" },
          { title: "Connections", path: "/settings/connections/" },
          { title: "Privacy Policy", path: "/settings/privacy-policy/" },
          {
            title: "Terms & Conditions",
            path: "/settings/terms-conditions/",
          },
        ],
      },
      { type: "link", title: "Logout", icon: "logout", path: "/" }, // Assuming logout redirects to home
    ],
  },
];

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

  // Use a string title for the open accordion. Default to "Dashboard".
  const [openAccordion, setOpenAccordion] = React.useState<string | null>(
    "Dashboard"
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
            href="/dashboard/ecommerce/"
            className="transition-none relative flex items-center outline-none"
          >
            <Image
              src="/images/logo-icon.svg"
              alt="logo-icon"
              width={26}
              height={26}
            />
            <span className="font-bold text-black dark:text-white relative ltr:ml-[8px] rtl:mr-[8px] top-px text-xl">
              Trezo
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
            {menuSections.map((section, sectionIndex) => (
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
