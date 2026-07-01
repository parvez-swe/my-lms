import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { NotificationDocument } from "@/models/Notification";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function PUT() {
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

    await db.collection<NotificationDocument>("notifications").updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
