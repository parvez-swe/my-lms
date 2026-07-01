import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";
import { isAdminRole } from "@/lib/rbac";
import { serializeDocument } from "@/lib/serialize";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const status = request.nextUrl.searchParams.get("status") || "pending";
  const db = await getDatabase();

  const query: Record<string, unknown> = {
    role: { $in: ["teacher", "mentor"] },
    deletedAt: { $exists: false },
  };

  if (status !== "all") {
    if (status === "none") {
      query.$or = [
        { instructorProfileStatus: "none" },
        { instructorProfileStatus: { $exists: false } },
      ];
    } else {
      query.instructorProfileStatus = status;
    }
  }

  const profiles = await db
    .collection<UserDocument>("users")
    .find(query)
    .sort({ instructorProfileSubmittedAt: -1, updatedAt: -1 })
    .toArray();

  return NextResponse.json({
    success: true,
    data: profiles.map((u) =>
      serializeDocument({
        _id: u._id?.toString(),
        name: u.name,
        email: u.email,
        image: u.image,
        bio: u.bio,
        headline: u.headline,
        expertise: u.expertise,
        socialLinks: u.socialLinks,
        status: u.instructorProfileStatus || "none",
        onboardingCompleted: u.onboardingCompleted !== false,
        createdAt: u.createdAt,
        rejectionReason: u.instructorProfileRejectionReason,
        submittedAt: u.instructorProfileSubmittedAt,
        approvedAt: u.instructorProfileApprovedAt,
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
  const { userId, action, reason } = body as {
    userId?: string;
    action?: "approve" | "reject";
    reason?: string;
  };

  if (!userId || !action) {
    return NextResponse.json(
      { success: false, error: "userId and action are required" },
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
          instructorProfileStatus: "approved" as const,
          instructorProfileApprovedAt: now,
          instructorProfileRejectionReason: undefined,
          updatedAt: now,
        }
      : {
          instructorProfileStatus: "rejected" as const,
          instructorProfileRejectionReason: reason?.trim(),
          updatedAt: now,
        };

  const result = await db.collection<UserDocument>("users").updateOne(
    {
      _id: new ObjectId(userId),
      role: { $in: ["teacher", "mentor"] },
      instructorProfileStatus: "pending",
    },
    { $set: update }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json(
      { success: false, error: "Pending profile not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message:
      action === "approve"
        ? "Instructor profile approved"
        : "Instructor profile rejected",
  });
}
