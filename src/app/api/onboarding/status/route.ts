import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";
import { ObjectId } from "mongodb";
import { getOnboardingPath, needsOnboarding } from "@/lib/onboarding";
import { normalizeRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDatabase();
  const user = await db.collection<UserDocument>("users").findOne({
    _id: new ObjectId(session.user.id),
    deletedAt: { $exists: false },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const role = normalizeRole(user.role) || user.role;
  const completed = user.onboardingCompleted !== false;

  return NextResponse.json({
    success: true,
    data: {
      completed,
      role,
      needsOnboarding: needsOnboarding(role, user.onboardingCompleted),
      path: completed ? null : getOnboardingPath(role),
    },
  });
}
