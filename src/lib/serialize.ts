import { ObjectId } from "mongodb";
import { CourseDocument } from "@/models/Course";
import { Course } from "@/data/courses";
import { EnrollmentDocument } from "@/models/Enrollment";

/**
 * Recursively converts ObjectId instances in a document (or array of documents) to their string representation.
 * Handles nested objects and arrays.
 * This is useful for preparing MongoDB documents for JSON serialization in API responses.
 */
export function serializeDocument<T>(doc: T): T {
  if (!doc) {
    return doc;
  }

  if (Array.isArray(doc)) {
    return doc.map((item) => serializeDocument(item)) as T;
  }

  if (typeof doc === "object" && doc !== null) {
    const newDoc: Record<string, unknown> = {};
    for (const key in doc) {
      if (Object.prototype.hasOwnProperty.call(doc, key)) {
        const value = (doc as Record<string, unknown>)[key];
        if (value instanceof ObjectId) {
          newDoc[key] = value.toString();
        } else if (value instanceof Date) {
          newDoc[key] = value.toISOString(); // Convert Date objects to ISO string
        } else if (typeof value === "object" && value !== null) {
          newDoc[key] = serializeDocument(value);
        } else {
          newDoc[key] = value;
        }
      }
    }
    return newDoc as T;
  }

  return doc;
}

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
export function serializeEnrollment(enrollmentDoc: EnrollmentDocument | null):
  | (Omit<EnrollmentDocument, "_id" | "userId"> & {
      _id?: string;
      userId: string;
    })
  | null {
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
  } as Omit<EnrollmentDocument, "_id" | "userId"> & {
    _id?: string;
    userId: string;
  };
}

