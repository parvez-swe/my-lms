"use client";
import React, { useState } from "react";
import Image from "next/image";
import { User, Shield, Bell, CreditCard, LogOut } from "lucide-react";
import Link from "next/link";

// Mock data - replace with actual data from your backend/context
const userProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "/images/profile.jpg",
  bio: "Full-stack developer with a passion for creating beautiful and functional web applications.",
  memberSince: "January 2023",
};

type Tab = "profile" | "account" | "notifications" | "billing";

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
    onClick={onClick}
    className={`w-full flex items-center space-x-3 p-3 rounded-md text-left font-semibold transition-colors ${
      isActive
        ? "bg-purple-100 text-purple-700"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Edit Profile Tab Content
const EditProfileTab = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            defaultValue={userProfile.name}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            defaultValue={userProfile.email}
            disabled
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          rows={4}
          defaultValue={userProfile.bio}
          className="w-full p-3 border border-gray-300 rounded-md"
        ></textarea>
      </div>
      <div className="text-right">
        <button
          type="submit"
          className="bg-purple-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-purple-700"
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
    <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Delete Account
        </h3>
        <p className="text-gray-600 mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <button className="bg-red-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-red-700">
          Delete My Account
        </button>
      </div>
    </div>
  </div>
);

// Placeholder for other tabs
const ComingSoonTab = () => (
  <div className="text-center py-16">
    <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
    <p className="text-gray-600">
      This feature is under construction. Check back later!
    </p>
  </div>
);

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <EditProfileTab />;
      case "account":
        return <AccountSettingsTab />;
      default:
        return <ComingSoonTab />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Profile Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Image
              src={userProfile.avatar}
              alt={userProfile.name}
              width={120}
              height={120}
              className="rounded-full border-4 border-white shadow-lg"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{userProfile.name}</h1>
              <p className="text-gray-600">{userProfile.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {userProfile.memberSince}
              </p>
            </div>
            <div className="md:ml-auto">
              <Link
                href="/my-courses"
                className="bg-purple-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-purple-700 transition-colors"
              >
                My Courses
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <nav className="space-y-2">
                <SidebarButton
                  icon={<User size={20} />}
                  label="Edit Profile"
                  isActive={activeTab === "profile"}
                  onClick={() => setActiveTab("profile")}
                />
                <SidebarButton
                  icon={<Shield size={20} />}
                  label="Account Settings"
                  isActive={activeTab === "account"}
                  onClick={() => setActiveTab("account")}
                />
                <SidebarButton
                  icon={<Bell size={20} />}
                  label="Notifications"
                  isActive={activeTab === "notifications"}
                  onClick={() => setActiveTab("notifications")}
                />
                <SidebarButton
                  icon={<CreditCard size={20} />}
                  label="Billing"
                  isActive={activeTab === "billing"}
                  onClick={() => setActiveTab("billing")}
                />
                <div className="border-t my-2"></div>
                <SidebarButton
                  icon={<LogOut size={20} />}
                  label="Logout"
                  onClick={() => alert("Logout functionality not implemented.")}
                />
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white p-8 rounded-lg shadow-md">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
