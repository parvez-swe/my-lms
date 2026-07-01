"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import { UserRole } from "@/models/User";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  verified: boolean;
  createdAt?: string;
}

const ROLE_BADGE: Record<string, string> = {
  student: "bg-gray-100 text-gray-700",
  teacher: "bg-blue-100 text-blue-700",
  marketer: "bg-purple-100 text-purple-700",
  mentor: "bg-blue-100 text-blue-700",
  admin: "bg-amber-100 text-amber-800",
  superadmin: "bg-red-100 text-red-700",
};

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-40 bg-gray-200 rounded" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </td>
          <td className="px-6 py-4">
            <div className="h-8 w-40 bg-gray-200 rounded" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const isSuperAdmin = session?.user?.role === "superadmin";
  const limit = 20;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/dashboard/users");
      return;
    }
    if (
      status === "authenticated" &&
      session?.user?.role !== "admin" &&
      session?.user?.role !== "superadmin"
    ) {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/users/admin?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, fetchUsers]);

  const patchUser = async (
    userId: string,
    action: "change-role" | "toggle-status" | "delete" | "reset-password",
    value?: string
  ) => {
    setUpdating(userId);
    try {
      const res = await fetch("/api/users/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, value }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Action failed");
        return;
      }
      if (action === "delete") {
        setDeleteTarget(null);
      }
      await fetchUsers();
    } catch {
      alert("Action failed");
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const roleOptions: UserRole[] = isSuperAdmin
    ? ["student", "teacher", "marketer", "admin", "superadmin"]
    : ["student", "teacher", "marketer"];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-purple-600" size={28} />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage platform users, roles, and verification status
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="marketer">Marketer</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {users.length} of {total} users
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <TableSkeleton />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Users
                      className="mx-auto text-gray-300 mb-3"
                      size={48}
                    />
                    <p className="text-gray-500 font-medium">No users found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Try adjusting your search or filters
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={user.image || "/images/users/user1.jpg"}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_BADGE[user.role]}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          patchUser(user._id, "toggle-status")
                        }
                        disabled={updating === user._id}
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          user.verified
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        } disabled:opacity-50`}
                      >
                        {user.verified ? "Verified" : "Unverified"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            patchUser(user._id, "change-role", e.target.value)
                          }
                          disabled={
                            updating === user._id ||
                            user._id === session?.user?.id ||
                            (user.role === "superadmin" && !isSuperAdmin)
                          }
                          className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                          {roleOptions.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                          {!isSuperAdmin &&
                            (user.role === "admin" ||
                              user.role === "superadmin") && (
                              <option value={user.role}>{user.role}</option>
                            )}
                        </select>
                        <button
                          onClick={() =>
                            patchUser(user._id, "reset-password")
                          }
                          disabled={updating === user._id}
                          title="Reset password"
                          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded disabled:opacity-50"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          disabled={
                            updating === user._id ||
                            user._id === session?.user?.id
                          }
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                        {updating === user._id && (
                          <Loader2
                            size={16}
                            className="animate-spin text-purple-600"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete user?
            </h3>
            <p className="text-gray-600 mb-6">
              This will soft-delete{" "}
              <strong>{deleteTarget.name}</strong> ({deleteTarget.email}).
              They will no longer appear in the user list.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => patchUser(deleteTarget._id, "delete")}
                disabled={updating === deleteTarget._id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {updating === deleteTarget._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
