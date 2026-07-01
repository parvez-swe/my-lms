"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Target,
  BookOpen,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  Trash2,
  Download,
} from "lucide-react";
import { EnrollmentDocument } from "@/models/Enrollment";
import { UserDocument } from "@/models/User";

interface Course {
  _id?: string;
  title: string;
  description: string;
  duration?: string;
  level?: string;
  lessons?: { length: number };
  modules?: Array<{ lessons: Array<{ id: string }> }>;
}

interface EnrollmentDetails {
  enrollment: EnrollmentDocument;
  user: Omit<UserDocument, "password">;
  course: Course;
}

const EnrollmentDetailsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const enrollmentId = params.id as string;

  const [data, setData] = useState<EnrollmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [actionStatus, setActionStatus] = useState<string>("");

  const fetchEnrollmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/enrollments/${enrollmentId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Enrollment not found");
        } else if (response.status === 401) {
          router.push("/auth/signin");
          return;
        } else {
          setError("Failed to fetch enrollment details");
        }
        return;
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error("Error fetching enrollment:", err);
      setError("Failed to load enrollment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(
        `/auth/signin?callbackUrl=/dashboard/enrolments/${enrollmentId}`
      );
      return;
    }

    if (status === "authenticated") {
      const sessionUser = session?.user as { role?: string; id?: string };
      if (!["admin", "superadmin"].includes(sessionUser?.role || "")) {
        router.push("/dashboard");
        return;
      }
      fetchEnrollmentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router, enrollmentId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!data) return;

    try {
      setUpdating(true);
      setActionStatus("");
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        setActionStatus("Error updating status");
        return;
      }

      setActionStatus("Status updated successfully");
      setTimeout(() => {
        fetchEnrollmentDetails();
        setActionStatus("");
      }, 1500);
    } catch (err) {
      console.error("Error updating status:", err);
      setActionStatus("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this enrollment?")) {
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setActionStatus("Error deleting enrollment");
        return;
      }

      setActionStatus("Enrollment deleted successfully");
      setTimeout(() => {
        router.push("/dashboard/enrolments");
      }, 1000);
    } catch (err) {
      console.error("Error deleting enrollment:", err);
      setActionStatus("Failed to delete enrollment");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownload = () => {
    if (!data) return;

    const { enrollment, user, course } = data;

    const content = `
ENROLLMENT DETAILS REPORT
Generated: ${new Date().toLocaleString("en-BD")}

========== ENROLLMENT INFORMATION ==========
ID: ${enrollment._id?.toString()}
Status: ${enrollment.status}
Created: ${
      enrollment.createdAt
        ? new Date(enrollment.createdAt).toLocaleDateString("en-BD")
        : "N/A"
    }
Enrolled: ${
      enrollment.enrolledAt
        ? new Date(enrollment.enrolledAt).toLocaleDateString("en-BD")
        : "Not yet approved"
    }

========== STUDENT INFORMATION ==========
Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone || "Not provided"}
Current Job: ${user.currentJob || "Not provided"}
Career Goal: ${user.careerGoal || "Not provided"}
Address: ${
      enrollment.address
        ? `${enrollment.address.division}, ${enrollment.address.district}`
        : "Not provided"
    }

========== COURSE INFORMATION ==========
Title: ${course?.title || "N/A"}
Description: ${course?.description || "N/A"}
Duration: ${course?.duration || "Not specified"}
Level: ${course?.level || "Not specified"}

========== PAYMENT INFORMATION ==========
Method: ${enrollment.payment?.method || "Not provided"}
Amount: ${
      enrollment.payment?.amount
        ? `৳ ${enrollment.payment.amount.toLocaleString("en-BD")}`
        : "N/A"
    }
${
  enrollment.payment?.method === "bkash"
    ? `bKash Number: ${enrollment.payment.bkashNumber || "N/A"}`
    : ""
}
${
  enrollment.payment?.method === "bkash"
    ? `Transaction ID: ${enrollment.payment.transactionId || "N/A"}`
    : ""
}
Payment Date: ${
      enrollment.payment?.paidAt
        ? new Date(enrollment.payment.paidAt).toLocaleDateString("en-BD")
        : "Not paid"
    }
    `;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`
    );
    element.setAttribute("download", `enrollment-${enrollmentId}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setActionStatus("Download started");
    setTimeout(() => setActionStatus(""), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading enrollment details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard/enrolments")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Enrollments
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { enrollment, user, course } = data;
  const statusColors: Record<string, string> = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    approved:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4" />,
    approved: <CheckCircle2 className="w-4 h-4" />,
    rejected: <X className="w-4 h-4" />,
    completed: <CheckCircle2 className="w-4 h-4" />,
  };

  const getNextStatuses = (): string[] => {
    switch (enrollment?.status) {
      case "pending":
        return ["approved", "rejected"];
      case "approved":
        return ["completed"];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/enrolments")}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Enrollment Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                ID: {enrollmentId}
              </p>
            </div>
          </div>
          {data && data?.enrollment?.status && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                statusColors[data.enrollment.status]
              }`}
            >
              {statusIcons[data.enrollment.status]}
              <span className="capitalize">{data.enrollment.status}</span>
            </div>
          )}
        </div>

        {/* Status Alert */}
        {actionStatus && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              actionStatus.includes("successfully")
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {actionStatus}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrollment Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Enrollment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Enrollment ID
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                    {String(enrollment?._id || "N/A")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Status
                  </label>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold ${
                      statusColors[enrollment?.status]
                    }`}
                  >
                    {statusIcons[enrollment?.status]}
                    <span className="capitalize">{enrollment?.status}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Enrollment Date
                  </label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {enrollment?.createdAt
                      ? new Date(enrollment?.createdAt).toLocaleDateString(
                          "en-BD"
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Enrolled At
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {enrollment?.enrolledAt
                      ? new Date(enrollment?.enrolledAt).toLocaleDateString(
                          "en-BD"
                        )
                      : "Not yet approved"}
                  </p>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Student Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Name
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user?.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Phone
                    </label>
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {user?.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Current Job
                    </label>
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {user?.currentJob || "Not provided"}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Career Goal
                  </label>
                  <p className="text-gray-900 dark:text-white flex items-start gap-2">
                    <Target className="w-4 h-4 mt-1 flex-shrink-0" />
                    {user?.careerGoal || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Address
                  </label>
                  <div className="text-gray-900 dark:text-white flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                    <div>
                      {enrollment && enrollment.address ? (
                        <>
                          <p>
                            {user?.address
                              ? `${user.address.division}, ${user.address.district}`
                              : "Address not provided"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {enrollment.address.division},{" "}
                            {enrollment.address.district}
                          </p>
                        </>
                      ) : (
                        <p>Address not provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Information */}
            {course && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Course Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Course Title
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {course.title}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Description
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {course.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Duration
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {course.duration || "Not specified"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Level
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">
                        {course.level || "Not specified"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Lessons
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {course.lessons?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information */}
            {enrollment && enrollment.payment && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Payment Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Payment Method
                      </label>
                      <p className="text-gray-900 dark:text-white font-semibold capitalize">
                        {enrollment.payment.method}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Amount
                      </label>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        ৳ {enrollment.payment.amount?.toLocaleString("en-BD")}
                      </p>
                    </div>
                    {enrollment.payment.method === "bkash" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            bKash Number
                          </label>
                          <p className="text-gray-900 dark:text-white font-mono">
                            {enrollment.payment.bkashNumber}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Transaction ID
                          </label>
                          <p className="text-gray-900 dark:text-white font-mono">
                            {enrollment.payment.transactionId}
                          </p>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Payment Date
                      </label>
                      <p className="text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {enrollment.payment.paidAt
                          ? new Date(
                              enrollment.payment.paidAt
                            ).toLocaleDateString("en-BD")
                          : "Not paid"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Actions
              </h3>

              {/* Status Actions */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                  Update Status
                </p>
                <div className="space-y-2">
                  {getNextStatuses().map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={updating}
                      className="w-full px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed capitalize"
                      style={{
                        backgroundColor:
                          status === "approved"
                            ? "#10b981"
                            : status === "rejected"
                            ? "#ef4444"
                            : "#3b82f6",
                      }}
                    >
                      {updating ? (
                        <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 inline mr-2" />
                      )}
                      Mark as {status}
                    </button>
                  ))}
                  {getNextStatuses().length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                      No status changes available
                    </p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

              {/* Other Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleDownload}
                  disabled={updating}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Download Details</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={updating}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete Enrollment</span>
                </button>
              </div>

              {/* Info Alert */}
              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Student will be notified of status changes via email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetailsPage;
