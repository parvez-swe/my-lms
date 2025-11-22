import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { EnrollmentDocument } from "@/models/Enrollment";
import { ObjectId } from "mongodb";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// GET - Get enrollment for current user and course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const enrollment = await db
      .collection<EnrollmentDocument>("enrollments")
      .findOne({
        userId: userId,
        courseSlug: slug,
      });

    if (!enrollment) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const { _id: _enrollmentId, ...enrollmentData } = enrollment;

    return NextResponse.json({
      success: true,
      data: enrollmentData,
    });
  } catch (error) {
    console.error("Failed to fetch enrollment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollment" },
      { status: 500 }
    );
  }
}

