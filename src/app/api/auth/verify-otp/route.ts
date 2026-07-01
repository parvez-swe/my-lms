import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";
import { isOTPExpired, isValidOTPFormat } from "@/lib/otp";
import { withRateLimit } from "@/lib/rateLimit";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// POST - Verify OTP
export async function POST(request: NextRequest) {
  try {
    const rateLimited = withRateLimit(
      request,
      "verify-otp",
      10,
      60 * 60 * 1000
    );
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Validate OTP format
    if (!isValidOTPFormat(otp)) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP format" },
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

    // Check if OTP has expired
    if (isOTPExpired(user.otpExpiry)) {
      return NextResponse.json(
        { success: false, error: "OTP has expired" },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      // Increment failed attempts
      const otpAttempts = (user.otpAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (otpAttempts >= 5) {
        await db.collection<UserDocument>("users").updateOne(
          { email },
          {
            $set: {
              otpAttempts: otpAttempts,
              updatedAt: new Date(),
            },
          }
        );

        return NextResponse.json(
          {
            success: false,
            error: "Too many failed attempts. Please request a new OTP.",
          },
          { status: 429 }
        );
      }

      // Update failed attempts
      await db.collection<UserDocument>("users").updateOne(
        { email },
        {
          $set: {
            otpAttempts: otpAttempts,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json(
        { success: false, error: "Invalid OTP", attempts: 5 - otpAttempts },
        { status: 400 }
      );
    }

    // OTP is valid - mark email as verified
    await db.collection<UserDocument>("users").updateOne(
      { email },
      {
        $set: {
          emailVerified: new Date(),
          otp: "",
          otpAttempts: 0,
          updatedAt: new Date(),
        },
        $unset: {
          otpExpiry: "",
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
    console.error("Failed to verify OTP:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
