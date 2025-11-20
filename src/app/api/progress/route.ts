import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { EnrollmentDocument } from "@/models/Enrollment";
import { ObjectId } from "mongodb";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// PUT - Update lesson progress
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseSlug, lessonId, completed } = body;

    if (!courseSlug || !lessonId) {
      return NextResponse.json(
        { success: false, error: "Course slug and lesson ID are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const enrollment = await db
      .collection<EnrollmentDocument>("enrollments")
      .findOne({
        userId: userId,
        courseSlug: courseSlug,
        status: "approved",
      });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found or not approved" },
        { status: 404 }
      );
    }

    const completedLessons =
      enrollment.progress?.completedLessons || [];
    let updatedCompletedLessons = [...completedLessons];

    if (completed) {
      // Add lesson if not already completed
      if (!updatedCompletedLessons.includes(lessonId)) {
        updatedCompletedLessons.push(lessonId);
      }
    } else {
      // Remove lesson if completed
      updatedCompletedLessons = updatedCompletedLessons.filter(
        (id) => id !== lessonId
      );
    }

    await db.collection("enrollments").updateOne(
      {
        userId: userId,
        courseSlug: courseSlug,
      },
      {
        $set: {
          "progress.completedLessons": updatedCompletedLessons,
          "progress.lastAccessed": new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: { completedLessons: updatedCompletedLessons },
    });
  } catch (error) {
    console.error("Failed to update progress:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update progress" },
      { status: 500 }
    );
  }
}

