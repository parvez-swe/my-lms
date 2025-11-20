import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { LessonCommentDocument, LessonCommentReply } from "@/models/LessonComment";
import { ObjectId } from "mongodb";
import { UserDocument } from "@/models/User";

export const dynamic = "force-dynamic";

// POST add a reply to a comment
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
    const { commentId, text } = body;

    if (!commentId || !text?.trim()) {
      return NextResponse.json(
        { success: false, error: "Comment ID and text are required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid comment ID" },
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

    const reply: LessonCommentReply = {
      userId,
      userName: user.name,
      userImage: user.image || "/images/profile.jpg",
      text: text.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<LessonCommentDocument>("lessonComments")
      .updateOne(
        {
          _id: new ObjectId(commentId),
        },
        {
          $push: { replies: reply },
          $set: { updatedAt: new Date() },
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: new ObjectId().toString(),
        author: reply.userName,
        avatar: reply.userImage,
        text: reply.text,
        timestamp: getTimeAgo(reply.createdAt),
      },
    });
  } catch (error) {
    console.error("Failed to add reply:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add reply" },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else {
    return new Date(date).toLocaleDateString();
  }
}

