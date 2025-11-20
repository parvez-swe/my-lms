"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "mentor" | "admin" | "superadmin";
  status: "Active" | "Banned";
  createdAt: string;
  avatar?: string;
  enrollments?: number;
  courses?: number;
}

const initialUsers: User[] = [
  {
    id: "#U-1001",
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    role: "student",
    status: "Active",
    createdAt: "2024-01-15",
    avatar: "/images/users/user1.jpg",
    enrollments: 5,
  },
  {
    id: "#U-1002",
    name: "Fatima Khan",
    email: "fatima@example.com",
    role: "mentor",
    status: "Active",
    createdAt: "2024-02-10",
    avatar: "/images/users/user2.jpg",
    courses: 3,
  },
  {
    id: "#U-1003",
    name: "Mohammad Ali",
    email: "ali@example.com",
    role: "admin",
    status: "Active",
    createdAt: "2024-03-05",
    avatar: "/images/users/user3.jpg",
  },
  {
    id: "#U-1004",
    name: "Aisha Rahman",
    email: "aisha@example.com",
    role: "student",
    status: "Banned",
    createdAt: "2024-01-20",
    avatar: "/images/users/user4.jpg",
    enrollments: 2,
  },
  {
    id: "#U-1005",
    name: "Ibrahim Ahmed",
    email: "ibrahim@example.com",
    role: "mentor",
    status: "Active",
    createdAt: "2024-02-15",
    avatar: "/images/users/user5.jpg",
    courses: 4,
  },
  {
    id: "#U-1006",
    name: "Zainab Ali",
    email: "zainab@example.com",
    role: "student",
    status: "Active",
    createdAt: "2024-03-10",
    avatar: "/images/users/user6.jpg",
    enrollments: 3,
  },
  {
    id: "#U-1007",
    name: "Omar Hassan",
    email: "omar@example.com",
    role: "admin",
    status: "Active",
    createdAt: "2024-01-25",
    avatar: "/images/users/user7.jpg",
  },
  {
    id: "#U-1008",
    name: "Layla Ahmed",
    email: "layla@example.com",
    role: "student",
    status: "Active",
    createdAt: "2024-02-20",
    avatar: "/images/users/user8.jpg",
    enrollments: 4,
  },
  {
    id: "#U-1009",
    name: "Hassan Khan",
    email: "hassan@example.com",
    role: "mentor",
    status: "Active",
    createdAt: "2024-03-15",
    avatar: "/images/users/user9.jpg",
    courses: 2,
  },
  {
    id: "#U-1010",
    name: "Mona Ahmed",
    email: "mona@example.com",
    role: "student",
    status: "Active",
    createdAt: "2024-01-30",
    avatar: "/images/users/user10.jpg",
    enrollments: 6,
  },
];

type SortField = "name" | "email" | "role" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

const UsersPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Modal states
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Table states
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const itemsPerPage = 10;

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student" as const,
  });

  // Check authorization
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/authentication/sign-in");
      return;
    }

    if (status === "authenticated") {
      const sessionUser = session?.user as { role?: string };
      if (!["admin", "superadmin"].includes(sessionUser?.role || "")) {
        router.push("/dashboard");
        return;
      }
    }
  }, [status, session, router]);

  // Fetch users from API on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Expect data.users || data.data
        const list: Array<Record<string, unknown>> = (data.users ||
          data.data ||
          []) as Array<Record<string, unknown>>;
        if (Array.isArray(list) && list.length > 0) {
          // Map server user shape to local `User`
          const mapped = list.map((u) => ({
            id: u._id || u.id || `#U-${Math.floor(Math.random() * 10000)}`,
            name: u.name,
            email: u.email,
            role: u.role || "student",
            status: u.status || "Active",
            createdAt: u.createdAt
              ? new Date(String(u.createdAt)).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            avatar: u.image || u.avatar || undefined,
            enrollments: u.enrollments,
            courses: u.courses,
          }));

          setUsers(mapped as User[]);
          setFilteredUsers(mapped as User[]);
        }
      } catch (error) {
        // If API missing or fails, keep initial users (silent fallback)
        console.error("Could not fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter and sort users
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "email":
          aValue = a.email;
          bValue = b.email;
          break;
        case "role":
          aValue = a.role;
          bValue = b.role;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const usersToDisplay = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddUser = async () => {
    if (!formData.name || !formData.email) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      // Use register endpoint if available
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }),
      });

      if (!res.ok) {
        // Fallback: add locally
        const fallbackUser: User = {
          id: `#U-${Math.floor(Math.random() * 10000)}`,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: "Active",
          createdAt: new Date().toISOString().split("T")[0],
          avatar: "/images/users/default.jpg",
        };

        setUsers((prev) => [...prev, fallbackUser]);
        alert("User added locally (server returned an error)");
      } else {
        const data = await res.json();
        const created = data.user || data.data || data;
        const added: User = {
          id:
            created._id ||
            created.id ||
            `#U-${Math.floor(Math.random() * 10000)}`,
          name: created.name,
          email: created.email,
          role: created.role || formData.role,
          status: created.status || "Active",
          createdAt: created.createdAt
            ? new Date(String(created.createdAt)).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          avatar: created.image || "/images/users/default.jpg",
        };

        setUsers((prev) => [...prev, added]);
        alert("User added successfully");
      }

      setFormData({ name: "", email: "", role: "student" });
      setOpenAddModal(false);
    } catch (error) {
      console.error("Error adding user:", error);
      const fallbackUser: User = {
        id: `#U-${Math.floor(Math.random() * 10000)}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: "Active",
        createdAt: new Date().toISOString().split("T")[0],
        avatar: "/images/users/default.jpg",
      };

      setUsers((prev) => [...prev, fallbackUser]);
      setFormData({ name: "", email: "", role: "student" });
      setOpenAddModal(false);
      alert("User added locally (network error)");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setOpenDetailsModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          // fallback to local delete
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          alert("User removed locally (server delete failed)");
        } else {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          alert("User deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        alert("User removed locally (network error)");
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleBanUnbanUser = (userId: string, currentStatus: string) => {
    (async () => {
      setLoading(true);
      try {
        const newStatus = currentStatus === "Active" ? "Banned" : "Active";
        const res = await fetch(
          `/api/users/${encodeURIComponent(userId)}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          }
        );

        if (!res.ok) {
          // fallback local update
          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, status: newStatus } : user
            )
          );
          alert("User status updated locally (server update failed)");
        } else {
          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, status: newStatus } : user
            )
          );
          alert(
            `User ${
              newStatus === "Banned" ? "banned" : "unbanned"
            } successfully!`
          );
        }
      } catch (error) {
        console.error("Error updating user status:", error);
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  status: currentStatus === "Active" ? "Banned" : "Active",
                }
              : user
          )
        );
        alert("User status updated locally (network error)");
      } finally {
        setLoading(false);
      }
    })();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-red-50 dark:bg-red-900/20 text-red-600";
      case "admin":
        return "bg-purple-50 dark:bg-purple-900/20 text-purple-600";
      case "mentor":
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-600";
      case "student":
        return "bg-green-50 dark:bg-green-900/20 text-green-600";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 text-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Active"
      ? "bg-green-50 dark:bg-green-900/20 text-green-600"
      : "bg-red-50 dark:bg-red-900/20 text-red-600";
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const sessionUser = session?.user as { role?: string };
  const isAdmin = sessionUser?.role === "admin";
  const isSuperAdmin = sessionUser?.role === "superadmin";

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
      {/* Header */}
      <div className="trezo-card-header mb-[20px] md:mb-[25px] sm:flex items-center justify-between">
        <div className="trezo-card-title">
          <form className="relative sm:w-[265px]">
            <label className="leading-none absolute ltr:left-[13px] rtl:right-[13px] text-black dark:text-white mt-px top-1/2 -translate-y-1/2">
              <i className="material-symbols-outlined !text-[20px]">search</i>
            </label>
            <input
              type="text"
              placeholder="Search user here..."
              className="bg-gray-50 border border-gray-50 h-[36px] text-xs rounded-md w-full block text-black pt-[11px] pb-[12px] ltr:pl-[38px] rtl:pr-[38px] ltr:pr-[13px] ltr:md:pr-[16px] rtl:pl-[13px] rtl:md:pl-[16px] placeholder:text-gray-500 outline-0 dark:bg-[#15203c] dark:text-white dark:border-[#15203c] dark:placeholder:text-gray-400"
              value={searchTerm}
              onChange={handleSearch}
            />
          </form>
        </div>

        <div className="trezo-card-subtitle mt-[15px] sm:mt-0 flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-[#172036] rounded-md text-xs bg-white dark:bg-[#15203c] text-black dark:text-white outline-0"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
            {isSuperAdmin && <option value="superadmin">SuperAdmin</option>}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-[#172036] rounded-md text-xs bg-white dark:bg-[#15203c] text-black dark:text-white outline-0"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Banned">Banned</option>
          </select>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="px-3 py-2 border border-gray-300 dark:border-[#172036] rounded-md text-xs bg-white dark:bg-[#15203c] text-black dark:text-white outline-0"
          >
            <option value="createdAt">Newest</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
            <option value="status">Status</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="px-3 py-2 border border-gray-300 dark:border-[#172036] rounded-md text-xs bg-white dark:bg-[#15203c] text-black dark:text-white outline-0"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>

          {isSuperAdmin && (
            <button
              type="button"
              disabled={loading}
              className={`inline-flex items-center gap-2 transition-all rounded-md font-medium px-[13px] py-[6px] text-white ${
                loading
                  ? "bg-primary-300"
                  : "bg-primary-500 hover:bg-primary-600"
              }`}
              onClick={() => setOpenAddModal(true)}
            >
              <i className="material-symbols-outlined !text-[18px]">add</i>
              {loading ? "Loading..." : "Add User"}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="trezo-card-content -mx-[20px] md:-mx-[25px]">
        <div className="table-responsive overflow-x-auto">
          <table className="w-full">
            <thead className="text-black dark:text-white">
              <tr>
                <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                  ID
                </th>
                <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                  Name
                </th>
                <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                  Email
                </th>
                <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                  Role
                </th>
                <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                  Status
                </th>
                <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                  Joined
                </th>
                <th className="font-medium ltr:text-right rtl:text-left px-[20px] py-[11px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="text-black dark:text-white">
              {usersToDisplay.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                usersToDisplay.map((user) => (
                  <tr key={user.id}>
                    <td className="text-gray-500 dark:text-gray-400 ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[17px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                      {user.id}
                    </td>

                    <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[17px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                      <div className="flex items-center">
                        {user.avatar && (
                          <div className="w-[44px] h-[44px] ltr:mr-[12px] rtl:ml-[12px]">
                            <Image
                              src={user.avatar}
                              className="rounded-full inline-block"
                              alt="user-image"
                              width={44}
                              height={44}
                            />
                          </div>
                        )}
                        <span className="block font-medium">{user.name}</span>
                      </div>
                    </td>

                    <td className="text-gray-500 dark:text-gray-400 ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[17px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                      {user.email}
                    </td>

                    <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[17px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                      <span
                        className={`px-[8px] py-[3px] inline-block ${getRoleColor(
                          user.role
                        )} rounded-sm font-medium text-xs capitalize`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[17px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                      <span
                        className={`px-[8px] py-[3px] inline-block ${getStatusColor(
                          user.status
                        )} rounded-sm font-medium text-xs`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="text-gray-500 dark:text-gray-400 ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[17px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="ltr:text-right rtl:text-left whitespace-nowrap px-[20px] py-[17px] md:ltr:first:pl-[25px] md:rtl:first:pr-[25px] ltr:first:pr-0 rtl:first:pl-0 border-b border-gray-100 dark:border-[#172036]">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="text-blue-500 hover:text-blue-700 leading-none custom-tooltip"
                          title="View Details"
                          onClick={() => handleViewDetails(user)}
                        >
                          <i className="material-symbols-outlined !text-md">
                            visibility
                          </i>
                        </button>

                        {(isSuperAdmin ||
                          (isAdmin &&
                            !["admin", "superadmin"].includes(user.role))) && (
                          <>
                            <button
                              type="button"
                              className="text-orange-500 hover:text-orange-700 leading-none custom-tooltip"
                              title={
                                user.status === "Active"
                                  ? "Ban User"
                                  : "Unban User"
                              }
                              onClick={() =>
                                handleBanUnbanUser(user.id, user.status)
                              }
                            >
                              <i className="material-symbols-outlined !text-md">
                                {user.status === "Active"
                                  ? "block"
                                  : "check_circle"}
                              </i>
                            </button>

                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700 leading-none custom-tooltip"
                              title="Delete User"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <i className="material-symbols-outlined !text-md">
                                delete
                              </i>
                            </button>
                          </>
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
        <div className="px-[20px] md:px-[25px] pt-[12px] md:pt-[14px] sm:flex sm:items-center justify-between">
          <p className="!mb-0 !text-sm">
            Showing {startIndex + 1} to {Math.min(endIndex, totalUsers)} of{" "}
            {totalUsers} results
          </p>

          <ol className="mt-[10px] sm:mt-0">
            <li className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500"
              >
                <span className="opacity-0">0</span>
                <i className="material-symbols-outlined left-0 right-0 absolute top-1/2 -translate-y-1/2">
                  chevron_left
                </i>
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, index) => (
              <li
                key={index}
                className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0"
              >
                <button
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500 ${
                    currentPage === index + 1
                      ? "border-primary-500 bg-primary-500 text-white"
                      : ""
                  }`}
                >
                  {index + 1}
                </button>
              </li>
            ))}

            <li className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500"
              >
                <span className="opacity-0">0</span>
                <i className="material-symbols-outlined left-0 right-0 absolute top-1/2 -translate-y-1/2">
                  chevron_right
                </i>
              </button>
            </li>
          </ol>
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog
        open={openAddModal}
        onClose={setOpenAddModal}
        className="relative z-10"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-[550px] data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="trezo-card w-full bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
                <div className="trezo-card-header bg-gray-50 dark:bg-[#15203c] mb-[20px] md:mb-[25px] flex items-center justify-between -mx-[20px] md:-mx-[25px] -mt-[20px] md:-mt-[25px] p-[20px] md:p-[25px] rounded-t-md">
                  <div className="trezo-card-title">
                    <h5 className="!mb-0 text-black dark:text-white">
                      Add New User
                    </h5>
                  </div>
                  <button
                    type="button"
                    className="text-[23px] transition-all leading-none text-black dark:text-white hover:text-primary-500"
                    onClick={() => setOpenAddModal(false)}
                  >
                    <i className="ri-close-fill"></i>
                  </button>
                </div>

                <div className="trezo-card-content">
                  <form>
                    <div className="space-y-[20px]">
                      <div>
                        <label className="mb-[10px] text-black dark:text-white font-medium block">
                          Name
                        </label>
                        <input
                          type="text"
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                          placeholder="E.g. Ahmed Hassan"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-[10px] text-black dark:text-white font-medium block">
                          Email
                        </label>
                        <input
                          type="email"
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                          placeholder="E.g. ahmed@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-[10px] text-black dark:text-white font-medium block">
                          Role
                        </label>
                        <select
                          className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500"
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              role: e.target.value as typeof formData.role,
                            })
                          }
                        >
                          <option value="student">Student</option>
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                          {isSuperAdmin && (
                            <option value="superadmin">SuperAdmin</option>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="mt-[20px] md:mt-[25px] ltr:text-right rtl:text-left">
                      <button
                        type="button"
                        className="rounded-md inline-block transition-all font-medium ltr:mr-[15px] rtl:ml-[15px] px-[26.5px] py-[12px] bg-danger-500 text-white hover:bg-danger-400"
                        onClick={() => setOpenAddModal(false)}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="inline-block bg-primary-500 text-white py-[12px] px-[26.5px] transition-all rounded-md hover:bg-primary-400"
                        onClick={handleAddUser}
                      >
                        <span className="inline-block relative ltr:pl-[25px] rtl:pr-[25px]">
                          <i className="material-symbols-outlined !text-[20px] absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2">
                            add
                          </i>
                          Create User
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* User Details Modal */}
      <Dialog
        open={openDetailsModal}
        onClose={setOpenDetailsModal}
        className="relative z-10"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-[550px] data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="trezo-card w-full bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
                <div className="trezo-card-header bg-gray-50 dark:bg-[#15203c] mb-[20px] md:mb-[25px] flex items-center justify-between -mx-[20px] md:-mx-[25px] -mt-[20px] md:-mt-[25px] p-[20px] md:p-[25px] rounded-t-md">
                  <div className="trezo-card-title">
                    <h5 className="!mb-0 text-black dark:text-white">
                      User Details
                    </h5>
                  </div>
                  <button
                    type="button"
                    className="text-[23px] transition-all leading-none text-black dark:text-white hover:text-primary-500"
                    onClick={() => setOpenDetailsModal(false)}
                  >
                    <i className="ri-close-fill"></i>
                  </button>
                </div>

                <div className="trezo-card-content space-y-[15px]">
                  {selectedUser && (
                    <>
                      <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-[#172036]">
                        {selectedUser.avatar && (
                          <Image
                            src={selectedUser.avatar}
                            className="rounded-full"
                            alt="user-image"
                            width={60}
                            height={60}
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-black dark:text-white">
                            {selectedUser.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedUser.email}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            User ID
                          </p>
                          <p className="font-medium text-black dark:text-white">
                            {selectedUser.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Role
                          </p>
                          <span
                            className={`px-[8px] py-[3px] inline-block ${getRoleColor(
                              selectedUser.role
                            )} rounded-sm font-medium text-xs capitalize`}
                          >
                            {selectedUser.role}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Status
                          </p>
                          <span
                            className={`px-[8px] py-[3px] inline-block ${getStatusColor(
                              selectedUser.status
                            )} rounded-sm font-medium text-xs`}
                          >
                            {selectedUser.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Joined
                          </p>
                          <p className="font-medium text-black dark:text-white">
                            {new Date(
                              selectedUser.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {selectedUser.role === "student" &&
                        selectedUser.enrollments && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Enrolled in{" "}
                              <strong>{selectedUser.enrollments}</strong>{" "}
                              courses
                            </p>
                          </div>
                        )}

                      {selectedUser.role === "mentor" &&
                        selectedUser.courses && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                            <p className="text-sm text-purple-700 dark:text-purple-300">
                              Teaching <strong>{selectedUser.courses}</strong>{" "}
                              courses
                            </p>
                          </div>
                        )}
                    </>
                  )}

                  <div className="mt-[20px] md:mt-[25px] ltr:text-right rtl:text-left">
                    <button
                      type="button"
                      className="inline-block bg-gray-300 text-black py-[12px] px-[26.5px] transition-all rounded-md hover:bg-gray-400"
                      onClick={() => setOpenDetailsModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default UsersPage;
