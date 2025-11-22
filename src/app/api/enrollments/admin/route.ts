import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { EnrollmentDocument, EnrollmentStatus } from "@/models/Enrollment";
import { UserDocument } from "@/models/User";
import { Filter } from "mongodb";
import { ObjectId } from "mongodb";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// GET - Get all enrollments (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin or superadmin
    if (session.user.role !== "admin" && session.user.role !== "superadmin") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    const query: Filter<EnrollmentDocument> = {};
    if (status) {
      query.status = status as EnrollmentStatus;
    }

    const enrollments = await db
      .collection<EnrollmentDocument>("enrollments")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch user and course details for each enrollment
    const enrollmentsWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const userId =
          typeof enrollment.userId === "string"
            ? new ObjectId(enrollment.userId)
            : enrollment.userId;
        const user = await db
          .collection<UserDocument>("users")
          .findOne({ _id: userId });
        const course = await db
          .collection("courses")
          .findOne({ slug: enrollment.courseSlug });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, password, ...userData } = user || {};
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id: courseId, ...courseData } = course || {};

        return {
          ...enrollment,
          user: userData,
          course: courseData,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrollmentsWithDetails,
    });
  } catch (error) {
    console.error("Failed to fetch enrollments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}
