"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { EnrollmentDocument } from "@/models/Enrollment";
import { Course } from "@/data/courses";
import { UserDocument } from "@/models/User";

interface EnrollmentWithDetails extends EnrollmentDocument {
  user?: Omit<UserDocument, "password">;
  course?: Course;
}

type SortField = "course" | "student" | "email" | "status" | "date";
type SortOrder = "asc" | "desc";

const EnrollmentsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<
    EnrollmentWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [careerGoalFilter, setCareerGoalFilter] = useState<string>("all");
  const [divisionFilter, setDivisionFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/dashboard/enrolments");
      return;
    }

    if (
      status === "authenticated" &&
      session?.user?.role !== "admin" &&
      session?.user?.role !== "superadmin"
    ) {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      fetchEnrollments();
    }
  }, [status, session, router]);

  useEffect(() => {
    filterAndSortEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enrollments,
    searchTerm,
    statusFilter,
    careerGoalFilter,
    divisionFilter,
    districtFilter,
    sortField,
    sortOrder,
  ]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/enrollments/admin");
      const result = await response.json();

      if (result.success) {
        setEnrollments(result.data || []);
      } else {
        setError(result.error || "Failed to fetch enrollments");
      }
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
      setError("An error occurred while fetching enrollments");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortEnrollments = () => {
    let filtered = [...enrollments];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (enrollment) =>
          enrollment.course?.title?.toLowerCase().includes(term) ||
          enrollment.user?.name?.toLowerCase().includes(term) ||
          enrollment.user?.email?.toLowerCase().includes(term) ||
          enrollment.status?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (enrollment) => enrollment.status === statusFilter
      );
    }

    // Apply career goal filter
    if (careerGoalFilter !== "all") {
      filtered = filtered.filter(
        (enrollment) => enrollment.careerGoal === careerGoalFilter
      );
    }

    // Apply division filter
    if (divisionFilter !== "all") {
      filtered = filtered.filter(
        (enrollment) => enrollment.address?.division === divisionFilter
      );
    }

    // Apply district filter
    if (districtFilter !== "all") {
      filtered = filtered.filter(
        (enrollment) => enrollment.address?.district === districtFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "course":
          aValue = a.course?.title || "";
          bValue = b.course?.title || "";
          break;
        case "student":
          aValue = a.user?.name || "";
          bValue = b.user?.name || "";
          break;
        case "email":
          aValue = a.user?.email || "";
          bValue = b.user?.email || "";
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        case "date":
          aValue = new Date(a.enrolledAt || a.createdAt || 0).getTime();
          bValue = new Date(b.enrolledAt || b.createdAt || 0).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredEnrollments(filtered);
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (
    enrollmentId: string,
    newStatus: EnrollmentDocument["status"]
  ) => {
    if (
      !confirm(
        `Are you sure you want to ${newStatus} this enrollment? The student will receive an email notification.`
      )
    ) {
      return;
    }

    setUpdating(enrollmentId);
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchEnrollments();
        alert(`Enrollment ${newStatus} successfully!`);
      } else {
        alert(result.error || "Failed to update enrollment");
      }
    } catch (err) {
      console.error("Failed to update enrollment:", err);
      alert("An error occurred while updating enrollment");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (enrollmentId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this enrollment? This action cannot be undone."
      )
    ) {
      return;
    }

    setUpdating(enrollmentId);
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchEnrollments();
        alert("Enrollment deleted successfully!");
      } else {
        alert(result.error || "Failed to delete enrollment");
      }
    } catch (err) {
      console.error("Failed to delete enrollment:", err);
      alert("An error occurred while deleting enrollment");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="text-green-500" size={20} />;
      case "rejected":
        return <XCircle className="text-red-500" size={20} />;
      case "pending":
        return <Clock className="text-yellow-500" size={20} />;
      case "completed":
        return <CheckCircle2 className="text-blue-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "completed":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEnrollments = filteredEnrollments.slice(startIndex, endIndex);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading enrollments...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect
  }

  if (
    status === "authenticated" &&
    session?.user?.role !== "admin" &&
    session?.user?.role !== "superadmin"
  ) {
    return null; // Will redirect
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enrollment Management
        </h1>
        <p className="text-gray-600">
          Manage student enrollments, approve requests, and track progress.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="space-y-4">
          {/* First Row - Search and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by course, student name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          {/* Second Row - Career Goal, Division, District, and Sort */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <select
                value={careerGoalFilter}
                onChange={(e) => setCareerGoalFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Career Goals</option>
                <option value="freelance">Freelance</option>
                <option value="job">Job</option>
                <option value="remote-job">Remote Job</option>
                <option value="abroad">Abroad</option>
              </select>
            </div>
            <div>
              <select
                value={divisionFilter}
                onChange={(e) => {
                  setDivisionFilter(e.target.value);
                  setDistrictFilter("all");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Divisions</option>
                <option value="Chattogram">Chattogram</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barishal">Barishal</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
              </select>
            </div>
            <div>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Districts</option>
                {(divisionFilter === "Chattogram" ||
                  divisionFilter === "all") && (
                  <>
                    <option value="Cox's Bazar">Cox&apos;s Bazar</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Comilla">Comilla</option>
                    <option value="Noakhali">Noakhali</option>
                    <option value="Feni">Feni</option>
                    <option value="Khagrachari">Khagrachari</option>
                    <option value="Rangamati">Rangamati</option>
                  </>
                )}
                {(divisionFilter === "Dhaka" || divisionFilter === "all") && (
                  <>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Gazipur">Gazipur</option>
                    <option value="Narayanganj">Narayanganj</option>
                    <option value="Tangail">Tangail</option>
                    <option value="Manikganj">Manikganj</option>
                  </>
                )}
                {(divisionFilter === "Rajshahi" ||
                  divisionFilter === "all") && (
                  <>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Pabna">Pabna</option>
                    <option value="Natore">Natore</option>
                    <option value="Bogura">Bogura</option>
                  </>
                )}
                {(divisionFilter === "Khulna" || divisionFilter === "all") && (
                  <>
                    <option value="Khulna">Khulna</option>
                    <option value="Bagerhat">Bagerhat</option>
                    <option value="Satkhira">Satkhira</option>
                    <option value="Jessore">Jessore</option>
                  </>
                )}
                {(divisionFilter === "Barishal" ||
                  divisionFilter === "all") && (
                  <>
                    <option value="Barishal">Barishal</option>
                    <option value="Bhola">Bhola</option>
                    <option value="Pirojpur">Pirojpur</option>
                    <option value="Jhalokati">Jhalokati</option>
                  </>
                )}
                {(divisionFilter === "Sylhet" || divisionFilter === "all") && (
                  <>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Moulvibazar">Moulvibazar</option>
                    <option value="Habiganj">Habiganj</option>
                    <option value="Sunamganj">Sunamganj</option>
                  </>
                )}
                {(divisionFilter === "Rangpur" || divisionFilter === "all") && (
                  <>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Dinajpur">Dinajpur</option>
                    <option value="Thakurgaon">Thakurgaon</option>
                    <option value="Panchagarh">Panchagarh</option>
                  </>
                )}
                {(divisionFilter === "Mymensingh" ||
                  divisionFilter === "all") && (
                  <>
                    <option value="Mymensingh">Mymensingh</option>
                    <option value="Jamalpur">Jamalpur</option>
                    <option value="Sherpur">Sherpur</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <select
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortField(field as SortField);
                  setSortOrder(order as SortOrder);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="course-asc">Course A-Z</option>
                <option value="course-desc">Course Z-A</option>
                <option value="student-asc">Student A-Z</option>
                <option value="student-desc">Student Z-A</option>
                <option value="status-asc">Status A-Z</option>
                <option value="status-desc">Status Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {enrollments.length}
              </p>
            </div>
            <Filter className="text-gray-400" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {enrollments.filter((e) => e.status === "pending").length}
              </p>
            </div>
            <Clock className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {enrollments.filter((e) => e.status === "approved").length}
              </p>
            </div>
            <CheckCircle2 className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {enrollments.filter((e) => e.status === "rejected").length}
              </p>
            </div>
            <XCircle className="text-red-500" size={24} />
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrolled Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-gray-500">No enrollments found</p>
                  </td>
                </tr>
              ) : (
                paginatedEnrollments.map((enrollment) => {
                  const totalLessons =
                    enrollment.course?.modules.reduce(
                      (acc, module) => acc + module.lessons.length,
                      0
                    ) || 0;
                  const completedLessons =
                    enrollment.progress?.completedLessons?.length || 0;
                  const progressPercentage =
                    totalLessons > 0
                      ? Math.round((completedLessons / totalLessons) * 100)
                      : 0;

                  return (
                    <tr
                      key={enrollment._id?.toString()}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/enrolments/${enrollment._id}`)
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.course?.title || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {enrollment.user?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {enrollment.user?.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(enrollment.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(enrollment.status)}
                            {enrollment.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {enrollment.enrolledAt
                          ? new Date(enrollment.enrolledAt).toLocaleDateString()
                          : enrollment.createdAt
                          ? new Date(enrollment.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {progressPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {enrollment.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(
                                    enrollment._id!.toString(),
                                    "approved"
                                  )
                                }
                                disabled={
                                  updating === enrollment._id?.toString()
                                }
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                title="Approve"
                              >
                                {updating === enrollment._id?.toString() ? (
                                  <Loader2 className="animate-spin" size={16} />
                                ) : (
                                  <CheckCircle2 size={16} />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(
                                    enrollment._id!.toString(),
                                    "rejected"
                                  )
                                }
                                disabled={
                                  updating === enrollment._id?.toString()
                                }
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                title="Reject"
                              >
                                {updating === enrollment._id?.toString() ? (
                                  <Loader2 className="animate-spin" size={16} />
                                ) : (
                                  <XCircle size={16} />
                                )}
                              </button>
                            </>
                          )}
                          {enrollment.status === "approved" && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  enrollment._id!.toString(),
                                  "completed"
                                )
                              }
                              disabled={updating === enrollment._id?.toString()}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              title="Mark as Completed"
                            >
                              {updating === enrollment._id?.toString() ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                <CheckCircle2 size={16} />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDelete(enrollment._id!.toString())
                            }
                            disabled={updating === enrollment._id?.toString()}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Delete"
                          >
                            {updating === enrollment._id?.toString() ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredEnrollments.length)} of{" "}
              {filteredEnrollments.length} enrollments
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={fetchEnrollments}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default EnrollmentsPage;
