import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { DiscussionDocument } from "@/models/Discussion";
import { ObjectId } from "mongodb";
import { UserDocument } from "@/models/User";

export const dynamic = "force-dynamic";

// GET all discussions for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  try {
    const { courseSlug } = await params;
    const db = await getDatabase();

    const discussions = await db
      .collection<DiscussionDocument>("discussions")
      .find({ courseSlug })
      .sort({ createdAt: -1 })
      .toArray();

    // Populate user information for each discussion
    const discussionsWithUserInfo = await Promise.all(
      discussions.map(async (discussion) => {
        let userName = discussion.userName;
        let userImage = discussion.userImage;

        // If user info is missing, fetch from users collection
        if (!userName || !userImage) {
          const userId =
            typeof discussion.userId === "string"
              ? new ObjectId(discussion.userId)
              : discussion.userId;
          const user = await db
            .collection<UserDocument>("users")
            .findOne({ _id: userId });
          if (user) {
            userName = userName || user.name;
            userImage = userImage || user.image || "/images/profile.jpg";
          }
        }

        // Populate user info for replies
        const repliesWithUserInfo = await Promise.all(
          discussion.replies.map(async (reply) => {
            let replyUserName = reply.userName;
            let replyUserImage = reply.userImage;

            if (!replyUserName || !replyUserImage) {
              const replyUserId =
                typeof reply.userId === "string"
                  ? new ObjectId(reply.userId)
                  : reply.userId;
              const replyUser = await db
                .collection<UserDocument>("users")
                .findOne({ _id: replyUserId });
              if (replyUser) {
                replyUserName = replyUserName || replyUser.name;
                replyUserImage =
                  replyUserImage || replyUser.image || "/images/profile.jpg";
              }
            }

            return {
              _id: reply._id?.toString(),
              userId: reply.userId.toString(),
              userName: replyUserName,
              userImage: replyUserImage,
              text: reply.text,
              createdAt: reply.createdAt,
            };
          })
        );

        return {
          id: discussion._id?.toString(),
          userId: discussion.userId.toString(),
          userName,
          userImage: userImage || "/images/profile.jpg",
          text: discussion.text,
          timeAgo: getTimeAgo(discussion.createdAt),
          likes: discussion.likes.length,
          likedBy: discussion.likes.map((id) => id.toString()),
          replies: repliesWithUserInfo,
          createdAt: discussion.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: discussionsWithUserInfo,
    });
  } catch (error) {
    console.error("Failed to fetch discussions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch discussions" },
      { status: 500 }
    );
  }
}

// POST create a new discussion/comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { courseSlug } = await params;
    const body = await request.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Comment text is required" },
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

    const discussion: DiscussionDocument = {
      courseSlug,
      userId,
      userName: user.name,
      userImage: user.image || "/images/profile.jpg",
      text: text.trim(),
      likes: [],
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<DiscussionDocument>("discussions")
      .insertOne(discussion);

    const createdDiscussion = await db
      .collection<DiscussionDocument>("discussions")
      .findOne({ _id: result.insertedId });

    if (!createdDiscussion) {
      return NextResponse.json(
        { success: false, error: "Failed to create discussion" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: createdDiscussion._id?.toString(),
        userId: createdDiscussion.userId.toString(),
        userName: createdDiscussion.userName,
        userImage: createdDiscussion.userImage || "/images/profile.jpg",
        text: createdDiscussion.text,
        timeAgo: getTimeAgo(createdDiscussion.createdAt),
        likes: 0,
        likedBy: [],
        replies: [],
        createdAt: createdDiscussion.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to create discussion:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create discussion" },
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
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
}

