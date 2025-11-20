import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { EnrollmentDocument } from "@/models/Enrollment";
import { ObjectId } from "mongodb";
import { Course } from "@/data/courses";

export const dynamic = "force-dynamic";

// GET certificate data or generate certificate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { courseSlug } = await params;
    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    // Check enrollment and completion
    const enrollment = await db
      .collection<EnrollmentDocument>("enrollments")
      .findOne({
        userId: userId,
        courseSlug: courseSlug,
        status: "approved",
      });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Fetch course to get total lessons
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const courseResponse = await fetch(`${baseUrl}/api/courses/${courseSlug}`, {
      cache: "no-store",
    });
    const courseResult = await courseResponse.json();

    if (!courseResult.success) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const course: Course = courseResult.data;
    const totalLessons = course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    );
    const completedLessons =
      enrollment.progress?.completedLessons?.length || 0;

    // Check if course is completed (100% progress)
    if (completedLessons < totalLessons) {
      return NextResponse.json(
        {
          success: false,
          error: "Course not completed",
          progress: Math.round((completedLessons / totalLessons) * 100),
        },
        { status: 400 }
      );
    }

    // Get user information
    const user = await db.collection("users").findOne({ _id: userId });

    // Generate certificate data
    const certificateData = {
      studentName: user?.name || session.user.name || "Student",
      courseTitle: course.title,
      courseSlug: course.slug,
      instructorName: course.tutor,
      completionDate: enrollment.completedAt || new Date(),
      certificateId: `CERT-${courseSlug.toUpperCase()}-${userId.toString().slice(-6)}-${Date.now()}`,
    };

    // Store certificate in database
    await db.collection("certificates").updateOne(
      {
        userId: userId,
        courseSlug: courseSlug,
      },
      {
        $set: {
          ...certificateData,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: certificateData,
    });
  } catch (error) {
    console.error("Failed to generate certificate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}

