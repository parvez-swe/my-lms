import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { NotificationDocument } from "@/models/Notification";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

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
    const collection = db.collection<NotificationDocument>("notifications");

    const [notifications, unreadCount] = await Promise.all([
      collection
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray(),
      collection.countDocuments({ userId, read: false }),
    ]);

    return NextResponse.json({
      success: true,
      data: notifications.map((n) => ({
        _id: n._id?.toString(),
        type: n.type,
        message: n.message,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
