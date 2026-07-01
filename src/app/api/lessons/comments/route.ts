import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { LessonCommentDocument } from "@/models/LessonComment";
import { ObjectId } from "mongodb";
import { UserDocument } from "@/models/User";

export const dynamic = "force-dynamic";

// GET comments for a specific lesson
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseSlug = searchParams.get("courseSlug");
    const moduleIndex = searchParams.get("moduleIndex");
    const lessonIndex = searchParams.get("lessonIndex");

    if (!courseSlug || moduleIndex === null || lessonIndex === null) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const comments = await db
      .collection<LessonCommentDocument>("lessonComments")
      .find({
        courseSlug,
        moduleIndex: parseInt(moduleIndex),
        lessonIndex: parseInt(lessonIndex),
      })
      .sort({ createdAt: -1 })
      .toArray();

    const userIds = new Set<string>();
    for (const comment of comments) {
      userIds.add(comment.userId.toString());
      for (const reply of comment.replies) {
        userIds.add(reply.userId.toString());
      }
    }

    const users =
      userIds.size > 0
        ? await db
            .collection<UserDocument>("users")
            .find({
              _id: { $in: [...userIds].map((id) => new ObjectId(id)) },
            })
            .toArray()
        : [];
    const userMap = new Map(users.map((u) => [u._id!.toString(), u]));

    const commentsWithUserInfo = comments.map((comment) => {
      const user = userMap.get(comment.userId.toString());
      const userName = comment.userName || user?.name;
      const userImage =
        comment.userImage || user?.image || "/images/profile.jpg";

      const repliesWithUserInfo = comment.replies.map((reply) => {
        const replyUser = userMap.get(reply.userId.toString());
        const replyUserName = reply.userName || replyUser?.name;
        const replyUserImage =
          reply.userImage || replyUser?.image || "/images/profile.jpg";

        return {
          id: reply._id?.toString(),
          author: replyUserName,
          avatar: replyUserImage,
          text: reply.text,
          timestamp: getTimeAgo(reply.createdAt),
        };
      });

      return {
        id: comment._id?.toString(),
        author: userName,
        avatar: userImage,
        text: comment.text,
        timestamp: getTimeAgo(comment.createdAt),
        replies: repliesWithUserInfo,
      };
    });

    return NextResponse.json({
      success: true,
      data: commentsWithUserInfo,
    });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST create a new comment
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
    const { courseSlug, moduleIndex, lessonIndex, text } = body;

    if (
      !courseSlug ||
      moduleIndex === undefined ||
      lessonIndex === undefined ||
      !text?.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
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

    const comment: LessonCommentDocument = {
      courseSlug,
      moduleIndex: parseInt(moduleIndex),
      lessonIndex: parseInt(lessonIndex),
      userId,
      userName: user.name,
      userImage: user.image || "/images/profile.jpg",
      text: text.trim(),
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<LessonCommentDocument>("lessonComments")
      .insertOne(comment);

    const createdComment = await db
      .collection<LessonCommentDocument>("lessonComments")
      .findOne({ _id: result.insertedId });

    if (!createdComment) {
      return NextResponse.json(
        { success: false, error: "Failed to create comment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: createdComment._id?.toString(),
        author: createdComment.userName,
        avatar: createdComment.userImage || "/images/profile.jpg",
        text: createdComment.text,
        timestamp: getTimeAgo(createdComment.createdAt),
        replies: [],
      },
    });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create comment" },
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
