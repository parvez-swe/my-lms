import { notFound, redirect } from "next/navigation";
import { Course } from "@/data/courses";
import LessonClientPage from "./LessonClientPage";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { EnrollmentDocument } from "@/models/Enrollment";
import { ObjectId } from "mongodb";
import { serializeEnrollment } from "@/lib/serialize";

export const dynamic = "force-dynamic";

// --- Types ---
interface LessonPageParams {
  params: Promise<{
    slug: string;
    moduleId: string;
    lessonId: string;
  }>;
}

// --- Page Component (Server Component) ---
export default async function LessonPage({ params }: LessonPageParams) {
  const { slug, moduleId, lessonId } = await params;

  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect(
      `/authentication/sign-in?callbackUrl=/mycourses/${slug}/${moduleId}/${lessonId}`
    );
  }

  // Fetch course from API
  let course: Course | null = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/courses/${slug}`, {
      cache: "no-store",
    });
    const result = await response.json();
    if (result.success) {
      course = result.data;
    } else {
      notFound();
    }
  } catch (error) {
    console.error("Failed to fetch course:", error);
    notFound();
  }

  if (!course) {
    notFound();
  }

  // Fetch enrollment data
  let enrollment: EnrollmentDocument | null = null;
  try {
    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const enrollmentDoc = await db
      .collection<EnrollmentDocument>("enrollments")
      .findOne({
        userId: userId,
        courseSlug: slug,
        status: "approved",
      });

    // Serialize MongoDB document to plain object (convert ObjectIds to strings)
    enrollment = serializeEnrollment(enrollmentDoc);
    if (enrollment && !enrollment.userId) {
      enrollment.userId = session.user.id;
    }
  } catch (error) {
    console.error("Failed to fetch enrollment:", error);
  }

  // Check if user is enrolled and approved
  if (!enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You must be enrolled and approved to access this lesson. Please
            enroll in the course first.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href={`/courses/enroll/${slug}`}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Enroll Now
            </a>
            <a
              href={`/courses/${slug}`}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              View Course Details
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Validate module and lesson indices
  const moduleIndex = parseInt(moduleId);
  const lessonIndex = parseInt(lessonId);

  if (isNaN(moduleIndex) || isNaN(lessonIndex)) {
    notFound();
  }

  const mod = course.modules[moduleIndex];
  const lesson = mod?.lessons[lessonIndex];

  if (!mod || !lesson) {
    notFound();
  }

  return (
    <LessonClientPage
      course={course}
      moduleIndex={moduleIndex}
      lessonIndex={lessonIndex}
      slug={slug}
      enrollment={enrollment}
    />
  );
}
