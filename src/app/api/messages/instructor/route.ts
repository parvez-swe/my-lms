import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";
import { ObjectId } from "mongodb";
import { sendInstructorMessage } from "@/lib/email";

export const dynamic = "force-dynamic";

// POST send message to instructor
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseSlug, message, instructorEmail } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    if (!courseSlug) {
      return NextResponse.json(
        { success: false, error: "Course slug is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    // Get user information
    const user = await db
      .collection<UserDocument>("users")
      .findOne({ _id: userId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Try to send email if configured
    if (instructorEmail) {
      try {
        await sendInstructorMessage(
          instructorEmail,
          user.name,
          user.email,
          courseSlug,
          message
        );
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Continue even if email fails - we'll store the message
      }
    }

    // Store message in database
    await db.collection("messages").insertOne({
      fromUserId: userId,
      fromUserName: user.name,
      fromUserEmail: user.email,
      toEmail: instructorEmail,
      courseSlug,
      message: message.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}

