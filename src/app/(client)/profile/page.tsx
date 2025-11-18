"use client";
import Link from "next/link";
import React, { useState } from "react";

// --- Mock Data ---
// In a real LMS, this would come from props or a data fetching hook
const userProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@lms.edu",
  // Using a placeholder image
  avatar: "https://placehold.co/120x120/8B5CF6/FFFFFF?text=AJ",
  bio: "Eager learner focusing on data science and machine learning. Currently enrolled in COMP-101 and STAT-203.",
  memberSince: "August 2024",
};

type Tab = "profile" | "account" | "notifications" | "billing";

// --- SVG Icons ---
// Replaced lucide-react icons with inline SVGs

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const CreditCardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
    <line x1="2" y1="10" x2="22" y2="10"></line>
  </svg>
);

const LogOutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

// --- Reusable Components ---

// Sidebar Button Component
const SidebarButton = ({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left font-semibold transition-colors ${
      isActive
        ? "bg-purple-100 text-purple-700"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// --- Tab Content Components ---

// Edit Profile Tab Content
const EditProfileTab = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h2>
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        // Handle form submission
        console.log("Profile changes saved!");
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            defaultValue={userProfile.name}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            defaultValue={userProfile.email}
            disabled
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          defaultValue={userProfile.bio}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
          placeholder="Tell us a little about yourself..."
        ></textarea>
      </div>
      <div className="text-right">
        <button
          type="submit"
          className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </form>
  </div>
);

// Account Settings Tab Content
const AccountSettingsTab = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-gray-800">Account Settings</h2>
    <div className="space-y-8">
      {/* Change Password Section */}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          console.log("Password change requested!");
        }}
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Change Password
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Update Password
          </button>
        </div>
      </form>

      {/* Delete Account Section */}
      <div className="border-t pt-6 border-red-200">
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Delete Account
        </h3>
        <p className="text-gray-600 mb-4">
          Once you delete your account, there is no going back. Please be
          certain. This action is permanent and will remove all your course
          data.
        </p>
        <button
          type="button"
          onClick={() => console.warn("Account deletion requested!")}
          className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Delete My Account
        </button>
      </div>
    </div>
  </div>
);

// Placeholder for other tabs
const ComingSoonTab = ({ title }: { title: string }) => (
  <div className="text-center py-16">
    <h2 className="text-3xl font-bold mb-4 text-gray-800">{title}</h2>
    <p className="text-gray-600 text-lg">
      This feature is under construction. Check back later!
    </p>
  </div>
);

// --- Main App Component ---
// Renamed from ProfilePage to App and made default export
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <EditProfileTab />;
      case "account":
        return <AccountSettingsTab />;
      case "notifications":
        return <ComingSoonTab title="Notifications" />;
      case "billing":
        return <ComingSoonTab title="Billing & Subscriptions" />;
      default:
        return <EditProfileTab />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Profile Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Replaced next/image with standard img */}
            <img
              src={userProfile.avatar}
              alt={`${userProfile.name}'s profile picture`}
              width={120}
              height={120}
              className="rounded-full border-4 border-white shadow-lg"
              onError={(e) => {
                // Fallback in case the image fails to load
                (e.currentTarget as HTMLImageElement).src =
                  "https://placehold.co/120x120/8B5CF6/FFFFFF?text=AJ";
              }}
            />
            <div className="text-center md:text-left flex-grow">
              <h1 className="text-3xl font-bold text-gray-900">
                {userProfile.name}
              </h1>
              <p className="text-gray-600">{userProfile.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {userProfile.memberSince}
              </p>
            </div>
            <div className="md:ml-auto">
              {/* Replaced next/link with standard <a> */}
              <Link
                href="/mycourses" // Changed to a hash link as an example
                // onClick={(e) => {
                //   e.preventDefault();
                //   console.log("Navigate to My Courses");
                // }}
                className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                My Courses
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <nav className="space-y-2">
                <SidebarButton
                  icon={<UserIcon />}
                  label="Edit Profile"
                  isActive={activeTab === "profile"}
                  onClick={() => setActiveTab("profile")}
                />
                <SidebarButton
                  icon={<ShieldIcon />}
                  label="Account Settings"
                  isActive={activeTab === "account"}
                  onClick={() => setActiveTab("account")}
                />
                <SidebarButton
                  icon={<BellIcon />}
                  label="Notifications"
                  isActive={activeTab === "notifications"}
                  onClick={() => setActiveTab("notifications")}
                />
                <SidebarButton
                  icon={<CreditCardIcon />}
                  label="Billing"
                  isActive={activeTab === "billing"}
                  onClick={() => setActiveTab("billing")}
                />
                <div className="border-t my-2 border-gray-200"></div>
                <SidebarButton
                  icon={<LogOutIcon />}
                  label="Logout"
                  onClick={() => console.log("Logout functionality clicked.")}
                />
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
