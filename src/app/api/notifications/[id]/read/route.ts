import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { NotificationDocument } from "@/models/Notification";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid notification ID" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const result = await db
      .collection<NotificationDocument>("notifications")
      .updateOne(
        { _id: new ObjectId(id), userId },
        { $set: { read: true } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
