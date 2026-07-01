"use client";
import Link from "next/link";
import React, { useState, useEffect, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { formatTimeAgo } from "@/lib/timeAgo";
import { formatPrice, resolveCoursePrice } from "@/lib/currency";
import { NotificationType } from "@/models/Notification";

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
    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
      isActive
        ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
        : "text-slate-600 hover:bg-slate-100"
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
    role?: string;
    phone?: string;
    currentJob?: string;
    careerGoal?: string;
    bio?: string;
    headline?: string;
    address?: { division: string; district: string };
  };
  onUpdate: () => void;
}

const EditProfileTab: React.FC<EditProfileTabProps> = ({
  userProfile,
  onUpdate,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [image, setImage] = useState(userProfile.image || "");
  const [phone, setPhone] = useState(userProfile.phone || "");
  const [currentJob, setCurrentJob] = useState(userProfile.currentJob || "");
  const [careerGoal, setCareerGoal] = useState(userProfile.careerGoal || "");
  const [bio, setBio] = useState(userProfile.bio || "");
  const [headline, setHeadline] = useState(userProfile.headline || "");
  const [division, setDivision] = useState(userProfile.address?.division || "");
  const [district, setDistrict] = useState(userProfile.address?.district || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setName(userProfile.name);
    setImage(userProfile.image || "");
    setPhone(userProfile.phone || "");
    setCurrentJob(userProfile.currentJob || "");
    setCareerGoal(userProfile.careerGoal || "");
    setBio(userProfile.bio || "");
    setHeadline(userProfile.headline || "");
    setDivision(userProfile.address?.division || "");
    setDistrict(userProfile.address?.district || "");
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          image: image || undefined,
          phone,
          currentJob,
          careerGoal: careerGoal || undefined,
          bio,
          headline,
          address:
            division && district ? { division, district } : undefined,
        }),
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-[#15203b] dark:text-white"
              placeholder="01XXXXXXXXX"
            />
          </div>
          <div>
            <label htmlFor="currentJob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Job
            </label>
            <input
              type="text"
              id="currentJob"
              value={currentJob}
              onChange={(e) => setCurrentJob(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-[#15203b] dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="careerGoal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Career Goal
            </label>
            <select
              id="careerGoal"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-[#15203b] dark:text-white"
            >
              <option value="">Select goal</option>
              <option value="freelance">Freelance</option>
              <option value="abroad">Work Abroad</option>
              <option value="job">Local Job</option>
              <option value="remote-job">Remote Job</option>
            </select>
          </div>
          <div>
            <label htmlFor="headline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Headline
            </label>
            <input
              type="text"
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-[#15203b] dark:text-white"
              placeholder="e.g. Aspiring web developer"
            />
          </div>
          <div>
            <label htmlFor="division" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Division
            </label>
            <input
              type="text"
              id="division"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-[#15203b] dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              District
            </label>
            <input
              type="text"
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-[#15203b] dark:text-white"
            />
          </div>
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-[#15203b] dark:text-white"
            placeholder="Tell us about yourself..."
          />
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
const TYPE_ICONS: Record<NotificationType, { icon: string; color: string }> = {
  enrollment_approved: { icon: "check_circle", color: "text-green-600" },
  enrollment_rejected: { icon: "cancel", color: "text-red-500" },
  course_update: { icon: "school", color: "text-purple-600" },
  new_message: { icon: "mail", color: "text-blue-500" },
};

interface NotificationItem {
  _id: string;
  type: NotificationType;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const result = await res.json();
      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetch("/api/notifications/read-all", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            disabled={markingAll}
            className="text-sm font-semibold text-purple-600 hover:text-purple-700 disabled:opacity-50"
          >
            {markingAll ? "Marking..." : "Mark all read"}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No notifications yet. You&apos;ll be notified when your enrollments are
          reviewed or courses are updated.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {notifications.map((notification) => {
            const meta = TYPE_ICONS[notification.type];
            return (
              <li
                key={notification._id}
                className={`py-4 flex gap-4 ${!notification.read ? "bg-purple-50/50 -mx-2 px-2 rounded-lg" : ""}`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 ${meta.color}`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {meta.icon}
                  </span>
                </div>
                <div className="flex-grow min-w-0">
                  <p
                    className={`text-sm ${!notification.read ? "font-semibold text-gray-900" : "text-gray-700"}`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                  <Link
                    href={notification.link}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification._id);
                    }}
                    className="text-xs text-purple-600 hover:underline mt-1 inline-block"
                  >
                    View details →
                  </Link>
                </div>
                {!notification.read && (
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-500 mt-2" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

interface EnrollmentWithCourse {
  _id: string;
  status: string;
  enrolledAt?: string;
  updatedAt?: string;
  payment?: {
    method: string;
    transactionId: string;
    amount?: number;
    currency?: string;
    paidAt?: string;
  };
  course?: {
    title: string;
    price?: string;
    priceAmount?: number;
    currency?: string;
    pricingType?: string;
  } | null;
}

const BillingTab = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch("/api/enrollments");
        const result = await res.json();
        if (result.success) {
          setEnrollments(
            (result.data || []).filter(
              (e: EnrollmentWithCourse) => e.status === "approved"
            )
          );
        }
      } catch (err) {
        console.error("Failed to fetch enrollments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const formatDate = (date?: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (enrollment: EnrollmentWithCourse) => {
    const amount = enrollment.payment?.amount;
    const currency = enrollment.payment?.currency;
    if (amount != null) {
      return formatPrice(amount, currency);
    }
    if (enrollment.course) {
      return resolveCoursePrice(enrollment.course).label;
    }
    return "—";
  };

  const formatPaymentMethod = (method?: string) => {
    const labels: Record<string, string> = {
      bkash: "bKash",
      nagad: "Nagad",
      sslcommerz: "SSLCommerz",
      stripe: "Stripe",
      card: "Card",
      bank: "Bank Transfer",
    };
    return method ? labels[method] || method : "—";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Billing & Payments
      </h2>

      <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Current Payment Method
        </h3>
        <p className="font-medium text-gray-700">
          bKash, Nagad, SSLCommerz, or Stripe
        </p>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          When you enroll in a paid course, choose your preferred payment
          method. Manual bKash/Nagad payments are reviewed by an admin. SSL
          Commerz and Stripe payments are processed automatically.
        </p>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Payment History
      </h3>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
        </div>
      ) : enrollments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No approved payments yet. Once an enrollment is approved, it will
          appear here.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-3 pr-4 font-medium">Course</th>
                <th className="pb-3 pr-4 font-medium">Amount</th>
                <th className="pb-3 pr-4 font-medium">Method</th>
                <th className="pb-3 pr-4 font-medium">Transaction ID</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enrollments.map((enrollment) => (
                <tr key={enrollment._id} className="text-gray-700">
                  <td className="py-3 pr-4 font-medium">
                    {enrollment.course?.title ?? "Unknown course"}
                  </td>
                  <td className="py-3 pr-4">{formatAmount(enrollment)}</td>
                  <td className="py-3 pr-4">
                    {formatPaymentMethod(enrollment.payment?.method)}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">
                    {enrollment.payment?.transactionId ?? "—"}
                  </td>
                  <td className="py-3">
                    {formatDate(
                      enrollment.payment?.paidAt ??
                        enrollment.updatedAt ??
                        enrollment.enrolledAt
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
function ProfilePageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    image?: string;
    role?: string;
    phone?: string;
    currentJob?: string;
    careerGoal?: string;
    bio?: string;
    headline?: string;
    address?: { division: string; district: string };
    createdAt?: Date;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab === "profile" ||
      tab === "account" ||
      tab === "notifications" ||
      tab === "billing"
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile");
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0c1427]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
          <p className="text-slate-600">Loading profile...</p>
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
        return <NotificationsTab />;
      case "billing":
        return <BillingTab />;
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c1427] font-sans">
      <header className="border-b border-slate-200/80 dark:border-gray-700 bg-white dark:bg-[#15203b]">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <Image
              src={userImage}
              alt={`${userProfile.name}'s profile picture`}
              width={96}
              height={96}
              className="rounded-2xl border-4 border-white shadow-xl ring-2 ring-violet-100"
            />
            <div className="flex-grow text-center md:text-left">
              <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
                My Account
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                {userProfile.name}
              </h1>
              <p className="text-slate-600 dark:text-gray-400">{userProfile.email}</p>
              <p className="mt-1 text-sm capitalize text-slate-500 dark:text-gray-500">
                {userProfile.role || "Student"} · Member since {memberSince}
              </p>
            </div>
            <Link
              href="/mycourses"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500"
            >
              My Courses
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-[#15203b] p-3 shadow-sm">
              <nav className="space-y-1">
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
                <div className="my-2 border-t border-slate-100" />
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
            <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-[#15203b] p-6 shadow-sm sm:p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0c1427]">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
            <p className="text-slate-600">Loading profile...</p>
          </div>
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
