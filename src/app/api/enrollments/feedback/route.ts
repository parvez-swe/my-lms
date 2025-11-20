import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { EnrollmentDocument } from "@/models/Enrollment";
import { CourseDocument } from "@/models/Course";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseSlug, rating, comment } = body;

    if (!courseSlug || typeof rating === "undefined") {
      return NextResponse.json(
        { success: false, error: "Course slug and rating are required" },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const enrollment = await db
      .collection<EnrollmentDocument>("enrollments")
      .findOne({ userId, courseSlug });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found for this course" },
        { status: 404 }
      );
    }

    const course = await db
      .collection<CourseDocument>("courses")
      .findOne({ slug: courseSlug });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const totalLessons =
      course.modules?.reduce(
        (acc, module) => acc + (module.lessons?.length || 0),
        0
      ) || 0;
    const completedLessons =
      enrollment.progress?.completedLessons?.length || 0;

    if (totalLessons > 0 && completedLessons < totalLessons) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Complete all lessons before submitting feedback for this course",
        },
        { status: 400 }
      );
    }

    const existingRating = enrollment.feedback?.rating;
    const ratingCount = course.ratingCount || 0;
    let newRatingCount = ratingCount;
    let ratingAverage = course.ratingAverage || 0;

    if (existingRating) {
      const total = ratingAverage * ratingCount - existingRating + numericRating;
      ratingAverage = ratingCount ? total / ratingCount : numericRating;
    } else {
      newRatingCount += 1;
      ratingAverage =
        ratingCount === 0
          ? numericRating
          : (ratingAverage * ratingCount + numericRating) / newRatingCount;
    }

    const feedback = {
      rating: numericRating,
      comment: comment?.trim() || undefined,
      submittedAt: new Date(),
    };

    await db.collection("enrollments").updateOne(
      { _id: enrollment._id },
      {
        $set: {
          feedback,
          status: "completed",
          updatedAt: new Date(),
          completedAt: enrollment.completedAt || new Date(),
        },
      }
    );

    await db.collection("courses").updateOne(
      { _id: course._id },
      {
        $set: {
          ratingAverage,
          ratingCount: newRatingCount,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        ratingAverage,
        ratingCount: newRatingCount,
        feedback,
      },
    });
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

