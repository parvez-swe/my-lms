import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { EnrollmentDocument } from "@/models/Enrollment";
import { sendEnrollmentEmail } from "@/lib/email";
import { ObjectId } from "mongodb";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// POST - Create enrollment
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
    const { courseSlug, phone, currentJob, careerGoal, address, payment } =
      body;

    if (!courseSlug) {
      return NextResponse.json(
        { success: false, error: "Course slug is required" },
        { status: 400 }
      );
    }

    // Validate personal information
    if (!phone || !currentJob || !careerGoal || !address) {
      return NextResponse.json(
        { success: false, error: "Personal information is required" },
        { status: 400 }
      );
    }

    if (!address.division || !address.district) {
      return NextResponse.json(
        { success: false, error: "Complete address is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    // Check if enrollment already exists
    const existingEnrollment = await db
      .collection<EnrollmentDocument>("enrollments")
      .findOne({
        userId: userId,
        courseSlug: courseSlug,
      });

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Fetch course to get details for email
    const course = await db.collection("courses").findOne({ slug: courseSlug });
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Create enrollment with personal information
    const enrollment: EnrollmentDocument = {
      userId: userId,
      courseSlug: courseSlug,
      status: "pending",
      enrolledAt: new Date(),
      phone,
      currentJob,
      careerGoal,
      address: {
        division: address.division,
        district: address.district,
      },
      ...(payment && { payment }),
      progress: {
        completedLessons: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("enrollments").insertOne(enrollment);

    // Update user profile with personal information
    await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          phone,
          currentJob,
          careerGoal,
          address: {
            division: address.division,
            district: address.district,
          },
          updatedAt: new Date(),
        },
      }
    );

    // Send enrollment email
    if (session.user.email && session.user.name) {
      await sendEnrollmentEmail(
        session.user.email,
        session.user.name,
        course as any
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { ...enrollment, _id: result.insertedId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create enrollment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create enrollment" },
      { status: 500 }
    );
  }
}

// GET - Get user's enrollments
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const enrollments = await db
      .collection<EnrollmentDocument>("enrollments")
      .find({ userId: userId })
      .toArray();

    // Fetch course details for each enrollment
    const enrollmentsWithCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await db
          .collection("courses")
          .findOne({ slug: enrollment.courseSlug });
        return {
          ...enrollment,
          course: course,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrollmentsWithCourses,
    });
  } catch (error) {
    console.error("Failed to fetch enrollments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}
