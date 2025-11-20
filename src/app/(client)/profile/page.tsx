"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Tab = "profile" | "account" | "notifications" | "billing";

// --- SVG Icons ---
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
interface EditProfileTabProps {
  userProfile: {
    name: string;
    email: string;
    image?: string;
  };
  onUpdate: () => void;
}

const EditProfileTab: React.FC<EditProfileTabProps> = ({
  userProfile,
  onUpdate,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [image, setImage] = useState(userProfile.image || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setName(userProfile.name);
    setImage(userProfile.image || "");
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, image: image || undefined }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message || "Profile updated successfully!");
        onUpdate();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h2>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">{success}</p>
        </div>
      )}
      <form className="space-y-6" onSubmit={handleSubmit}>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
              required
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
              value={userProfile.email}
              disabled
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Profile Image URL
          </label>
          <input
            type="url"
            id="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a URL for your profile image
          </p>
        </div>
        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

interface AccountSettingsTabProps {
  onUpdate?: () => void;
}

const AccountSettingsTab: React.FC<AccountSettingsTabProps> = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message || "Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "Failed to change password");
      }
    } catch (err) {
      console.error("Password change error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" ">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Account Settings
      </h2>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">{success}</p>
        </div>
      )}
      <div className="space-y-8">
        {/* Change Password Section */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Change Password
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
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
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
                required
                minLength={6}
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
                required
                minLength={6}
              />
            </div>
          </div>
          <div className="text-right">
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Password"}
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
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to delete your account? This action cannot be undone."
                )
              ) {
                alert("Account deletion is not yet implemented.");
              }
            }}
            className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
};

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
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    image?: string;
    role?: string;
    createdAt?: Date;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/authentication/sign-in?callbackUrl=/profile");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/profile");
      const result = await response.json();

      if (result.success) {
        setUserProfile(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  if (status === "loading" || loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !userProfile) {
    return null; // Will redirect
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <EditProfileTab userProfile={userProfile} onUpdate={fetchProfile} />
        );
      case "account":
        return <AccountSettingsTab />;
      case "notifications":
        return <ComingSoonTab title="Notifications" />;
      case "billing":
        return <ComingSoonTab title="Billing & Subscriptions" />;
      default:
        return (
          <EditProfileTab userProfile={userProfile} onUpdate={fetchProfile} />
        );
    }
  };

  const userImage =
    userProfile.image || session?.user?.image || "/images/admin.png";
  const memberSince = userProfile.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="bg-gray-50 min-h-screen font-sans pt-20">
      {/* Profile Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Image
              src={userImage}
              alt={`${userProfile.name}'s profile picture`}
              width={120}
              height={120}
              className="rounded-full border-4 border-white shadow-lg"
            />
            <div className="text-center md:text-left flex-grow">
              <h1 className="text-3xl font-bold text-gray-900">
                {userProfile.name}
              </h1>
              <p className="text-gray-600">{userProfile.email}</p>
              <p className="text-sm text-gray-500 mt-1 capitalize">
                {userProfile.role || "Student"} • Member since {memberSince}
              </p>
            </div>
            <div className="md:ml-auto">
              <Link
                href="/mycourses"
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
                  onClick={handleLogout}
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
