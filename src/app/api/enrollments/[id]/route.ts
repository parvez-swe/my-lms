import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { EnrollmentDocument } from "@/models/Enrollment";
import { sendEnrollmentStatusEmail } from "@/lib/email";
import { ObjectId } from "mongodb";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// PUT - Update enrollment status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["pending", "approved", "rejected", "completed"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const enrollmentId = new ObjectId(id);

    const enrollment = await db
      .collection<EnrollmentDocument>("enrollments")
      .findOne({ _id: enrollmentId });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Update enrollment
    const updateData: Partial<EnrollmentDocument> = {
      status: status as EnrollmentDocument["status"],
      updatedAt: new Date(),
    };

    if (status === "approved" && enrollment.status === "pending") {
      updateData.enrolledAt = new Date();
    }

    await db.collection("enrollments").updateOne(
      { _id: enrollmentId },
      {
        $set: updateData,
      }
    );

    // Fetch user and course for email
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(enrollment.userId) });
    const course = await db
      .collection("courses")
      .findOne({ slug: enrollment.courseSlug });

    // Send status update email if status changed to approved or rejected
    if (
      (status === "approved" || status === "rejected") &&
      user?.email &&
      user?.name &&
      course
    ) {
      await sendEnrollmentStatusEmail(
        user.email,
        user.name,
        course as any,
        status as "approved" | "rejected"
      );
    }

    const updatedEnrollment = await db
      .collection<EnrollmentDocument>("enrollments")
      .findOne({ _id: enrollmentId });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...enrollmentData } = updatedEnrollment!;

    return NextResponse.json({
      success: true,
      data: enrollmentData,
    });
  } catch (error) {
    console.error("Failed to update enrollment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update enrollment" },
      { status: 500 }
    );
  }
}

// GET - Get single enrollment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = await getDatabase();
    const enrollmentId = new ObjectId(id);

    const enrollment = await db
      .collection<EnrollmentDocument>("enrollments")
      .findOne({ _id: enrollmentId });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Check if user owns this enrollment or is admin
    const userId = new ObjectId(session.user.id);
    if (
      enrollment.userId.toString() !== userId.toString() &&
      session.user.role !== "admin" &&
      session.user.role !== "superadmin"
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Fetch user data
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(enrollment.userId) });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch course data
    const course = await db
      .collection("courses")
      .findOne({ slug: enrollment.courseSlug });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Remove sensitive data from user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = user as any;

    return NextResponse.json({
      success: true,
      data: {
        enrollment: {
          ...enrollment,
          _id: enrollment._id?.toString(),
        },
        user: userData,
        course,
      },
    });
  } catch (error) {
    console.error("Failed to fetch enrollment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollment" },
      { status: 500 }
    );
  }
}

// DELETE - Delete enrollment (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const db = await getDatabase();
    const enrollmentId = new ObjectId(id);

    const enrollment = await db
      .collection<EnrollmentDocument>("enrollments")
      .findOne({ _id: enrollmentId });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 }
      );
    }

    await db.collection("enrollments").deleteOne({ _id: enrollmentId });

    return NextResponse.json({
      success: true,
      message: "Enrollment deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete enrollment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete enrollment" },
      { status: 500 }
    );
  }
}
