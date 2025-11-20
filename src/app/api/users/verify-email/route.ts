import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// GET - Verify email with token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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
        { status: 404 }
      );
    }

    // Check if token has expired
    const now = new Date();
    if (
      user.emailVerificationTokenExpiry &&
      user.emailVerificationTokenExpiry < now
    ) {
      return NextResponse.json(
        { success: false, error: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Update user as verified
    await db.collection<UserDocument>("users").updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerified: new Date(),
          emailVerificationToken: undefined,
          emailVerificationTokenExpiry: undefined,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to verify email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify email" },
      { status: 500 }
    );
  }
}

// POST - Verify email with token (alternative)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

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
        { status: 404 }
      );
    }

    // Check if token has expired
    const now = new Date();
    if (
      user.emailVerificationTokenExpiry &&
      user.emailVerificationTokenExpiry < now
    ) {
      return NextResponse.json(
        { success: false, error: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Update user as verified
    await db.collection<UserDocument>("users").updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerified: new Date(),
          emailVerificationToken: undefined,
          emailVerificationTokenExpiry: undefined,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to verify email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
