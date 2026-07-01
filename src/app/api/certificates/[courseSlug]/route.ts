import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { EnrollmentDocument } from "@/models/Enrollment";
import { CourseDocument } from "@/models/Course";
import { CertificateDocument } from "@/models/Certificate";
import { ObjectId } from "mongodb";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function buildCertificateId(courseSlug: string, userId: ObjectId): string {
  const slugPart = courseSlug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  const userPart = userId.toString().slice(-8).toUpperCase();
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `CERT-${slugPart}-${userPart}-${randomPart}`;
}

// GET certificate data or generate certificate record
export async function GET(
  _request: NextRequest,
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

    const enrollment = await db
      .collection<EnrollmentDocument>("enrollments")
      .findOne({
        userId,
        courseSlug,
        status: "approved",
      });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
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

    const totalLessons = course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    );
    const completedLessons =
      enrollment.progress?.completedLessons?.length || 0;

    if (totalLessons === 0 || completedLessons < totalLessons) {
      return NextResponse.json(
        {
          success: false,
          error: "Course not completed",
          progress:
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0,
        },
        { status: 400 }
      );
    }

    const user = await db.collection("users").findOne({ _id: userId });
    const studentName = user?.name || session.user.name || "Student";
    const completionDate = enrollment.completedAt || new Date();
    const now = new Date();

    const certificate = await db
      .collection<CertificateDocument>("certificates")
      .findOneAndUpdate(
        { userId, courseSlug },
        {
          $setOnInsert: {
            userId,
            courseSlug,
            certificateId: buildCertificateId(courseSlug, userId),
            issuedAt: now,
            createdAt: now,
          },
          $set: {
            studentName,
            courseName: course.title,
            completionDate,
            updatedAt: now,
          },
        },
        { upsert: true, returnDocument: "after" }
      );

    if (!certificate) {
      return NextResponse.json(
        { success: false, error: "Failed to create certificate" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        studentName: certificate.studentName,
        courseTitle: certificate.courseName,
        courseSlug: certificate.courseSlug,
        completionDate: certificate.completionDate,
        certificateId: certificate.certificateId,
        issuedAt: certificate.issuedAt,
      },
    });
  } catch (error) {
    console.error("Failed to generate certificate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}

