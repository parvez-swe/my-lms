import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { DiscussionDocument, DiscussionReply } from "@/models/Discussion";
import { ObjectId } from "mongodb";
import { UserDocument } from "@/models/User";

export const dynamic = "force-dynamic";

// POST add a reply to a discussion
export async function POST(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ courseSlug: string; discussionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { courseSlug, discussionId } = await params;
    const body = await request.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Reply text is required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(discussionId)) {
      return NextResponse.json(
        { success: false, error: "Invalid discussion ID" },
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

    const reply: DiscussionReply = {
      userId,
      userName: user.name,
      userImage: user.image || "/images/profile.jpg",
      text: text.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<DiscussionDocument>("discussions")
      .updateOne(
        {
          _id: new ObjectId(discussionId),
          courseSlug,
        },
        {
          $push: { replies: reply },
          $set: { updatedAt: new Date() },
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Discussion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: new ObjectId().toString(), // Temporary ID, actual ID is managed by MongoDB
        userId: reply.userId.toString(),
        userName: reply.userName,
        userImage: reply.userImage,
        text: reply.text,
        createdAt: reply.createdAt,
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

