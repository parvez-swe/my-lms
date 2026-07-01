import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/** Marks onboarding complete for the current user (e.g. after teacher profile submit). */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDatabase();
  const now = new Date();

  await db.collection<UserDocument>("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    {
      $set: {
        onboardingCompleted: true,
        onboardingCompletedAt: now,
        updatedAt: now,
      },
    }
  );

  return NextResponse.json({ success: true });
}
