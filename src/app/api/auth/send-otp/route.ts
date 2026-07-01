import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";
import { sendOTPEmail } from "@/lib/email";
import { generateOTP, getOTPExpiry } from "@/lib/otp";
import { withRateLimit } from "@/lib/rateLimit";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// POST - Send OTP to email
export async function POST(request: NextRequest) {
  try {
    const rateLimited = withRateLimit(
      request,
      "send-otp",
      3,
      10 * 60 * 1000
    );
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
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

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry(10); // 10 minutes

    // Update user with OTP
    await db.collection<UserDocument>("users").updateOne(
      { email },
      {
        $set: {
          otp,
          otpExpiry,
          otpAttempts: 0,
          updatedAt: new Date(),
        },
      }
    );

    // Send OTP email (non-blocking)
    sendOTPEmail(email, user.name, otp).catch((emailError: unknown) => {
      console.error("Failed to send OTP email:", emailError);
      // Don't fail the request if email fails
    });

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully to your email",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to send OTP:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
