import { CourseDocument } from "@/models/Course";
import { isAdminRole, normalizeRole } from "@/lib/rbac";
import {
  canTeacherCreateCourse,
  canTeacherOperateCourse,
  isCoursePublished,
} from "@/lib/instructorProfile";
import { UserDocument } from "@/models/User";

interface SessionUser {
  id?: string;
  email?: string;
  role?: string;
}

export function isCourseOwner(
  user: SessionUser | undefined,
  course: Pick<CourseDocument, "instructorId" | "instructorEmail">
): boolean {
  if (!user) return false;
  const role = normalizeRole(user.role);
  if (role !== "teacher") return false;
  if (course.instructorId && user.id) {
    return course.instructorId.toString() === user.id;
  }
  if (course.instructorEmail && user.email) {
    return course.instructorEmail.toLowerCase() === user.email.toLowerCase();
  }
  return false;
}

export function canCreateCourse(
  role?: string | null,
  user?: Pick<UserDocument, "role" | "instructorProfileStatus"> | null
): boolean {
  const r = normalizeRole(role);
  if (r === "admin" || r === "superadmin") return true;
  if (r === "teacher") return canTeacherCreateCourse(user);
  return false;
}

export function canEditCourse(
  user: SessionUser | undefined,
  course: Pick<CourseDocument, "instructorId" | "instructorEmail" | "status">
): boolean {
  if (!user) return false;
  if (isAdminRole(user.role)) return true;
  return canTeacherOperateCourse(user, course);
}

export function canDeleteCourse(role?: string | null): boolean {
  return isAdminRole(role);
}

export function canViewCoursePublicly(
  course: Pick<CourseDocument, "status">
): boolean {
  return isCoursePublished(course);
}
