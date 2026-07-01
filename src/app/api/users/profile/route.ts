import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument, CareerGoal, UserSocialLink } from "@/models/User";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const CAREER_GOALS: CareerGoal[] = [
  "freelance",
  "abroad",
  "job",
  "remote-job",
];

// GET - Get user profile
export async function GET() {
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

    const user = await db
      .collection<UserDocument>("users")
      .findOne({ _id: userId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const {
      password: _password,
      emailVerificationToken: _emailToken,
      emailVerificationTokenExpiry: _expiry,
      _id: __id,
      ...userData
    } = user;

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile (all non-sensitive fields)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      image,
      phone,
      currentJob,
      careerGoal,
      bio,
      headline,
      address,
      socialLinks,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const updateData: Partial<UserDocument> = {
      name: name.trim(),
      updatedAt: new Date(),
    };

    if (image !== undefined) updateData.image = image || undefined;
    if (phone !== undefined) updateData.phone = phone?.trim() || undefined;
    if (currentJob !== undefined)
      updateData.currentJob = currentJob?.trim() || undefined;
    if (bio !== undefined) updateData.bio = bio?.trim() || undefined;
    if (headline !== undefined)
      updateData.headline = headline?.trim() || undefined;

    if (careerGoal !== undefined) {
      if (careerGoal === "" || careerGoal === null) {
        updateData.careerGoal = undefined;
      } else if (CAREER_GOALS.includes(careerGoal as CareerGoal)) {
        updateData.careerGoal = careerGoal as CareerGoal;
      }
    }

    if (address !== undefined) {
      if (address?.division && address?.district) {
        updateData.address = {
          division: String(address.division).trim(),
          district: String(address.district).trim(),
        };
      } else {
        updateData.address = undefined;
      }
    }

    if (Array.isArray(socialLinks)) {
      const allowedPlatforms = new Set([
        "linkedin",
        "twitter",
        "github",
        "website",
      ]);
      updateData.socialLinks = socialLinks
        .filter((l: { url?: string }) => l?.url?.trim())
        .slice(0, 5)
        .map((l: { platform?: string; url?: string }) => ({
          platform: (allowedPlatforms.has(l.platform || "")
            ? l.platform
            : "website") as UserSocialLink["platform"],
          url: l.url!.trim(),
        }));
    }

    await db.collection("users").updateOne({ _id: userId }, { $set: updateData });

    const updatedUser = await db
      .collection<UserDocument>("users")
      .findOne({ _id: userId });

    const {
      password: _password,
      emailVerificationToken: _emailToken,
      emailVerificationTokenExpiry: _expiry,
      _id: __id,
      ...userData
    } = updatedUser!;

    return NextResponse.json({
      success: true,
      data: userData,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
