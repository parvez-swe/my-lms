import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// GET - Verify email with token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Verification token is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Find user by verification token
    const user = await db
      .collection<UserDocument>("users")
      .findOne({
        emailVerificationToken: token,
      });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (
      user.emailVerificationTokenExpiry &&
      new Date() > user.emailVerificationTokenExpiry
    ) {
      return NextResponse.json(
        { success: false, error: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Verify email
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerified: new Date(),
          updatedAt: new Date(),
        },
        $unset: {
          emailVerificationToken: "",
          emailVerificationTokenExpiry: "",
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Failed to verify email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify email" },
      { status: 500 }
    );
  }
}

