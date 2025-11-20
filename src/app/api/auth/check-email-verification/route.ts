import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// POST - Check if email is verified
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
    const user = await db
      .collection<UserDocument>("users")
      .findOne({ email });

    if (!user) {
      return NextResponse.json({
        success: true,
        verified: false,
        exists: false,
      });
    }

    return NextResponse.json({
      success: true,
      verified: !!user.emailVerified,
      exists: true,
    });
  } catch (error) {
    console.error("Failed to check email verification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check email verification" },
      { status: 500 }
    );
  }
}

