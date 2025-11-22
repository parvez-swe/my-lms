import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

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

    const { password: _password, emailVerificationToken: _emailToken, emailVerificationTokenExpiry: _expiry, _id: __id, ...userData } = user;

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

// PUT - Update user profile
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
    const { name, image } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const updateData: Partial<UserDocument> = {
      name,
      updatedAt: new Date(),
    };

    if (image) {
      updateData.image = image;
    }

    await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: updateData,
      }
    );

    const updatedUser = await db
      .collection<UserDocument>("users")
      .findOne({ _id: userId });

    const { password: _password, emailVerificationToken: _emailToken, emailVerificationTokenExpiry: _expiry, _id: __id, ...userData } = updatedUser!;

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
