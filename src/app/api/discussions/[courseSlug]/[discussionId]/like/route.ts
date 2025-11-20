import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { DiscussionDocument } from "@/models/Discussion";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// PUT like/unlike a discussion
export async function PUT(
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

    if (!ObjectId.isValid(discussionId)) {
      return NextResponse.json(
        { success: false, error: "Invalid discussion ID" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const discussion = await db
      .collection<DiscussionDocument>("discussions")
      .findOne({
        _id: new ObjectId(discussionId),
        courseSlug,
      });

    if (!discussion) {
      return NextResponse.json(
        { success: false, error: "Discussion not found" },
        { status: 404 }
      );
    }

    const likes = (discussion.likes || []).map((id) =>
      id.toString()
    ) as string[];
    const isLiked = likes.includes(userId.toString());

    let updatedLikes: ObjectId[];
    if (isLiked) {
      // Unlike: remove user ID from likes
      updatedLikes = (discussion.likes || [])
        .map((id) => (typeof id === "string" ? new ObjectId(id) : id))
        .filter((id) => id.toString() !== userId.toString());
    } else {
      // Like: add user ID to likes
      updatedLikes = [
        ...(discussion.likes || []).map((id) =>
          typeof id === "string" ? new ObjectId(id) : id
        ),
        userId,
      ];
    }

    await db.collection<DiscussionDocument>("discussions").updateOne(
      {
        _id: new ObjectId(discussionId),
        courseSlug,
      },
      {
        $set: {
          likes: updatedLikes,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        liked: !isLiked,
        likesCount: updatedLikes.length,
      },
    });
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

