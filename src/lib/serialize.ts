import { ObjectId } from "mongodb";
import { CourseDocument } from "@/models/Course";
import { Course } from "@/data/courses";
import { EnrollmentDocument } from "@/models/Enrollment";

/**
 * Serialize CourseDocument to Course (removes MongoDB-specific fields)
 */
export function serializeCourse(
  courseDoc: CourseDocument | null
): Course | null {
  if (!courseDoc) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, createdAt, updatedAt, ...course } = courseDoc;
  return course as Course;
}

/**
 * Serialize EnrollmentDocument to plain object (converts ObjectIds to strings)
 * Date objects are kept as-is since they serialize correctly
 */
export function serializeEnrollment(
  enrollmentDoc: EnrollmentDocument | null
): Omit<EnrollmentDocument, "_id" | "userId"> & { _id?: string; userId: string } | null {
  if (!enrollmentDoc) return null;

  return {
    courseSlug: enrollmentDoc.courseSlug,
    status: enrollmentDoc.status,
    _id: enrollmentDoc._id?.toString(),
    userId:
      enrollmentDoc.userId instanceof ObjectId
        ? enrollmentDoc.userId.toString()
        : (enrollmentDoc.userId as string),
    enrolledAt: enrollmentDoc.enrolledAt,
    completedAt: enrollmentDoc.completedAt,
    createdAt: enrollmentDoc.createdAt,
    updatedAt: enrollmentDoc.updatedAt,
    progress: enrollmentDoc.progress
      ? {
          completedLessons: enrollmentDoc.progress.completedLessons || [],
          lastAccessed: enrollmentDoc.progress.lastAccessed,
        }
      : undefined,
    feedback: enrollmentDoc.feedback,
  } as Omit<EnrollmentDocument, "_id" | "userId"> & { _id?: string; userId: string };
}
