import { UserDocument, InstructorProfileStatus } from "@/models/User";
import { CourseDocument, CourseStatus } from "@/models/Course";
import { isAdminRole, normalizeRole } from "@/lib/rbac";

export function getInstructorProfileStatus(
  user?: Pick<UserDocument, "role" | "instructorProfileStatus"> | null
): InstructorProfileStatus {
  if (!user) return "none";
  const role = normalizeRole(user.role);
  if (role === "admin" || role === "superadmin") return "approved";
  return user.instructorProfileStatus || "none";
}

export function isInstructorProfileApproved(
  user?: Pick<UserDocument, "role" | "instructorProfileStatus"> | null
): boolean {
  return getInstructorProfileStatus(user) === "approved";
}

export function getCourseStatus(course: Pick<CourseDocument, "status">): CourseStatus {
  return course.status || "published";
}

export function isCoursePublished(course: Pick<CourseDocument, "status">): boolean {
  return getCourseStatus(course) === "published";
}

export function canTeacherCreateCourse(
  user?: Pick<UserDocument, "role" | "instructorProfileStatus"> | null
): boolean {
  const role = normalizeRole(user?.role);
  if (role === "admin" || role === "superadmin") return true;
  if (role !== "teacher") return false;
  return isInstructorProfileApproved(user);
}

export function canTeacherOperateCourse(
  user: { id?: string; email?: string; role?: string } | undefined,
  course: Pick<CourseDocument, "instructorId" | "instructorEmail" | "status">
): boolean {
  if (!user) return false;
  if (isAdminRole(user.role)) return true;
  const role = normalizeRole(user.role);
  if (role !== "teacher") return false;

  const isOwner =
    (course.instructorId && user.id && course.instructorId === user.id) ||
    (course.instructorEmail &&
      user.email &&
      course.instructorEmail.toLowerCase() === user.email.toLowerCase());

  if (!isOwner) return false;

  const status = getCourseStatus(course);
  return status === "published" || status === "pending_approval" || status === "draft";
}

export function validateInstructorProfilePayload(body: {
  name?: string;
  bio?: string;
  headline?: string;
  image?: string;
  expertise?: string;
}): string | null {
  if (!body.name?.trim()) return "Full name is required";
  if (!body.headline?.trim()) return "Professional headline is required";
  if (!body.bio?.trim() || body.bio.trim().length < 40) {
    return "Bio must be at least 40 characters";
  }
  if (!body.image?.trim()) return "Profile photo is required";
  if (!body.expertise?.trim()) return "Teaching expertise is required";
  return null;
}
