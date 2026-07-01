import { UserRole } from "@/models/User";

/** Legacy `mentor` is treated as `teacher`. */
export function normalizeRole(role?: string | null): UserRole | null {
  if (!role) return null;
  if (role === "mentor") return "teacher";
  return role as UserRole;
}

export const ALL_ROLES: UserRole[] = [
  "student",
  "teacher",
  "marketer",
  "admin",
  "superadmin",
  "mentor",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  teacher: "Teacher",
  marketer: "Marketer",
  admin: "Admin",
  superadmin: "Super Admin",
  mentor: "Teacher (legacy)",
};

export function isStaffRole(role?: string | null): boolean {
  const r = normalizeRole(role);
  return (
    r === "admin" ||
    r === "superadmin" ||
    r === "teacher" ||
    r === "marketer"
  );
}

export function isAdminRole(role?: string | null): boolean {
  const r = normalizeRole(role);
  return r === "admin" || r === "superadmin";
}

export function isSuperAdmin(role?: string | null): boolean {
  return normalizeRole(role) === "superadmin";
}

export function canAccessAdminDashboard(role?: string | null): boolean {
  return isStaffRole(role);
}

export function canManageUsers(role?: string | null): boolean {
  return isAdminRole(role);
}

export function canManageEnrollments(role?: string | null): boolean {
  return isAdminRole(role);
}

export function canManageCourses(role?: string | null): boolean {
  return isAdminRole(role);
}

export function canEditCourseContent(role?: string | null): boolean {
  const r = normalizeRole(role);
  return r === "admin" || r === "superadmin" || r === "teacher";
}

export function canViewAnalytics(role?: string | null): boolean {
  const r = normalizeRole(role);
  return r === "admin" || r === "superadmin" || r === "marketer";
}

export function canManageCms(role?: string | null): boolean {
  const r = normalizeRole(role);
  return r === "admin" || r === "superadmin" || r === "marketer";
}

export function canAssignRole(
  actorRole?: string | null,
  targetRole?: UserRole
): boolean {
  const actor = normalizeRole(actorRole);
  if (!actor || !targetRole) return false;
  if (actor === "superadmin") return true;
  if (actor === "admin") {
    return !["admin", "superadmin"].includes(targetRole);
  }
  return false;
}

const TEACHER_BLOCKED = [
  "/dashboard/users",
  "/dashboard/enrolments",
  "/dashboard/courses/create",
  "/dashboard/courses/update",
  "/dashboard/analytics",
  "/dashboard/pages",
];

const TEACHER_ALLOWED = [
  "/dashboard/courses",
  "/dashboard/messages",
  "/dashboard/chats",
];

const MARKETER_BLOCKED = [
  "/dashboard/users",
  "/dashboard/enrolments",
  "/dashboard/courses/create",
  "/dashboard/courses/update",
  "/dashboard/courses",
  "/dashboard/messages",
  "/dashboard/chats",
];

const MARKETER_ALLOWED = [
  "/dashboard/analytics",
  "/dashboard/pages",
  "/dashboard/contact",
];

function matchPrefixes(path: string, prefixes: string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

export function isDashboardRouteAllowed(
  pathname: string,
  role?: string | null
): boolean {
  const path =
    pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;

  if (path === "/dashboard") return true;

  const r = normalizeRole(role);

  if (r === "admin" || r === "superadmin") return true;

  if (r === "teacher") {
    if (matchPrefixes(path, TEACHER_BLOCKED)) return false;
    return matchPrefixes(path, TEACHER_ALLOWED);
  }

  if (r === "marketer") {
    if (matchPrefixes(path, MARKETER_BLOCKED)) return false;
    return matchPrefixes(path, MARKETER_ALLOWED);
  }

  return false;
}

/** @deprecated use isDashboardRouteAllowed */
export function isMentorDashboardRouteAllowed(pathname: string): boolean {
  return isDashboardRouteAllowed(pathname, "teacher");
}
