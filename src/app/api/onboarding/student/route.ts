import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";
import { ObjectId } from "mongodb";
import { normalizeRole } from "@/lib/rbac";
import { CareerGoal } from "@/models/User";
import { bangladeshDivisions } from "@/components/Enrollment/enrollmentConstants";
import { isValidPhone } from "@/lib/formValidation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = normalizeRole(session.user.role);
  if (role !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const phone = String(body.phone || "").trim();
  const currentJob = String(body.currentJob || "").trim();
  const careerGoal = body.careerGoal as CareerGoal;
  const validGoals: CareerGoal[] = [
    "freelance",
    "abroad",
    "job",
    "remote-job",
  ];
  const division = String(body.division || "").trim();
  const district = String(body.district || "").trim();

  if (!phone || !isValidPhone(phone)) {
    return NextResponse.json(
      { success: false, error: "Valid phone number is required (10–14 digits)" },
      { status: 400 }
    );
  }
  if (!currentJob) {
    return NextResponse.json(
      { success: false, error: "Current job or occupation is required" },
      { status: 400 }
    );
  }
  if (!careerGoal || !validGoals.includes(careerGoal)) {
    return NextResponse.json(
      { success: false, error: "Please select a career goal" },
      { status: 400 }
    );
  }
  if (!division || !bangladeshDivisions[division]) {
    return NextResponse.json(
      { success: false, error: "Valid division is required" },
      { status: 400 }
    );
  }
  if (!district || !bangladeshDivisions[division].includes(district)) {
    return NextResponse.json(
      { success: false, error: "Valid district is required" },
      { status: 400 }
    );
  }

  const db = await getDatabase();
  const now = new Date();

  await db.collection<UserDocument>("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    {
      $set: {
        phone,
        currentJob,
        careerGoal,
        address: { division, district },
        onboardingCompleted: true,
        onboardingCompletedAt: now,
        updatedAt: now,
      },
    }
  );

  return NextResponse.json({
    success: true,
    message: "Profile setup complete. Welcome to Nahal Academy!",
  });
}
