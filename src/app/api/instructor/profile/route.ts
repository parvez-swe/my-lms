import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";
import { ObjectId } from "mongodb";
import {
  getInstructorProfileStatus,
  validateInstructorProfilePayload,
} from "@/lib/instructorProfile";
import { normalizeRole } from "@/lib/rbac";
import { serializeDocument } from "@/lib/serialize";

export const dynamic = "force-dynamic";

async function getTeacherUser(userId: string) {
  const db = await getDatabase();
  return db.collection<UserDocument>("users").findOne({
    _id: new ObjectId(userId),
    role: { $in: ["teacher", "mentor"] },
    deletedAt: { $exists: false },
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = normalizeRole(session.user.role);
  if (role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await getTeacherUser(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: serializeDocument({
      name: user.name,
      email: user.email,
      image: user.image || "",
      bio: user.bio || "",
      headline: user.headline || "",
      expertise: user.expertise || "",
      socialLinks: user.socialLinks || [],
      status: getInstructorProfileStatus(user),
      rejectionReason: user.instructorProfileRejectionReason || "",
      submittedAt: user.instructorProfileSubmittedAt,
      approvedAt: user.instructorProfileApprovedAt,
    }),
  });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = normalizeRole(session.user.role);
  if (role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const submitForApproval = body.submitForApproval === true;

  const validationError = validateInstructorProfilePayload(body);
  if (validationError) {
    return NextResponse.json(
      { success: false, error: validationError },
      { status: 400 }
    );
  }

  const db = await getDatabase();
  const user = await getTeacherUser(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const currentStatus = getInstructorProfileStatus(user);
  if (currentStatus === "pending" && submitForApproval) {
    return NextResponse.json(
      { success: false, error: "Profile is already pending admin review" },
      { status: 400 }
    );
  }

  const update: Partial<UserDocument> = {
    name: body.name.trim(),
    image: body.image.trim(),
    bio: body.bio.trim(),
    headline: body.headline.trim(),
    expertise: body.expertise.trim(),
    socialLinks: Array.isArray(body.socialLinks) ? body.socialLinks : [],
    updatedAt: new Date(),
  };

  if (submitForApproval) {
    update.instructorProfileStatus = "pending";
    update.instructorProfileSubmittedAt = new Date();
    update.instructorProfileRejectionReason = undefined;
    update.onboardingCompleted = true;
    update.onboardingCompletedAt = new Date();
  } else if (currentStatus === "none" || currentStatus === "rejected") {
    update.instructorProfileStatus = "none";
  }

  await db.collection<UserDocument>("users").updateOne(
    { _id: user._id },
    { $set: update }
  );

  return NextResponse.json({
    success: true,
    message: submitForApproval
      ? "Profile submitted for admin approval"
      : "Profile saved as draft",
    data: {
      status: submitForApproval ? "pending" : update.instructorProfileStatus || currentStatus,
    },
  });
}
