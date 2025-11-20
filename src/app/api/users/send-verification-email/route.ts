import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// POST - Send verification email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Find user by email
    const user = await db.collection<UserDocument>("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 hours

    // Update user with new token
    await db.collection<UserDocument>("users").updateOne(
      { email },
      {
        $set: {
          emailVerificationToken: verificationToken,
          emailVerificationTokenExpiry: verificationTokenExpiry,
          updatedAt: new Date(),
        },
      }
    );

    // Send verification email
    await sendVerificationEmail(email, user.name, verificationToken);

    return NextResponse.json(
      {
        success: true,
        message: "Verification email sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
