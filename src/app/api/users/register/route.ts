import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument, UserRole } from "@/models/User";
import bcrypt from "bcryptjs";
import { sendOTPEmail } from "@/lib/email";
import { generateOTP, getOTPExpiry } from "@/lib/otp";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// POST - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role = "student" } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: UserRole[] = ["student", "mentor", "admin", "superadmin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if user already exists
    const existingUser = await db
      .collection<UserDocument>("users")
      .findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry(10); // 10 minutes

    // Create user
    const newUser: UserDocument = {
      email,
      password: hashedPassword,
      name,
      role: role as UserRole,
      otp,
      otpExpiry,
      otpAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    // Send OTP email (non-blocking)
    sendOTPEmail(email, name, otp).catch((emailError: unknown) => {
      console.error("Failed to send OTP email:", emailError);
      // Don't fail registration if email fails
    });

    // Remove sensitive data from response
    const {
      password: _pwd,
      otp: _otpCode,
      otpExpiry: _otpExp,
      otpAttempts: _attempts,
      ...userData
    } = newUser;

    return NextResponse.json(
      {
        success: true,
        data: { ...userData, _id: result.insertedId },
        message:
          "Registration successful. Please check your email for the verification code.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to register user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register user" },
      { status: 500 }
    );
  }
}
