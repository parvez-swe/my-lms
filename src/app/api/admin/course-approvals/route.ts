import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { CourseDocument } from "@/models/Course";
import { isAdminRole } from "@/lib/rbac";
import { serializeDocument } from "@/lib/serialize";
import { getCourseStatus } from "@/lib/instructorProfile";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const status = request.nextUrl.searchParams.get("status") || "pending_approval";
  const db = await getDatabase();

  const query: Record<string, unknown> = {};
  if (status !== "all") {
    query.status = status;
  } else {
    query.status = { $in: ["pending_approval", "rejected", "draft"] };
  }

  const courses = await db
    .collection<CourseDocument>("courses")
    .find(query)
    .sort({ submittedAt: -1, updatedAt: -1 })
    .toArray();

  return NextResponse.json({
    success: true,
    data: courses.map((c) =>
      serializeDocument({
        slug: c.slug,
        title: c.title,
        tutor: c.tutor,
        instructorEmail: c.instructorEmail,
        status: getCourseStatus(c),
        rejectionReason: c.statusRejectionReason,
        submittedAt: c.submittedAt,
        image: c.image,
      })
    ),
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { slug, action, reason } = body as {
    slug?: string;
    action?: "approve" | "reject";
    reason?: string;
  };

  if (!slug || !action) {
    return NextResponse.json(
      { success: false, error: "slug and action are required" },
      { status: 400 }
    );
  }

  if (action === "reject" && !reason?.trim()) {
    return NextResponse.json(
      { success: false, error: "Rejection reason is required" },
      { status: 400 }
    );
  }

  const db = await getDatabase();
  const now = new Date();

  const update =
    action === "approve"
      ? {
          status: "published" as const,
          publishedAt: now,
          statusRejectionReason: undefined,
          updatedAt: now,
        }
      : {
          status: "rejected" as const,
          statusRejectionReason: reason?.trim(),
          updatedAt: now,
        };

  const result = await db.collection<CourseDocument>("courses").updateOne(
    { slug, status: "pending_approval" },
    { $set: update }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json(
      { success: false, error: "Pending course not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message:
      action === "approve" ? "Course published" : "Course rejected",
  });
}
