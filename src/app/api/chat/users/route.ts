import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";
import {
  DEFAULT_CHAT_AVATAR,
  mapUserRoleToChatRole,
} from "@/lib/chatRepository";
import { User } from "@/types/chat";

export const dynamic = "force-dynamic";

// GET /api/chat/users - Get available users to chat with
export async function GET(request: NextRequest) {
  try {
    const currentUserId = request.headers.get("x-user-id");
    const db = await getDatabase();
    const usersCursor = db
      .collection<UserDocument>("users")
      .find(
        currentUserId && ObjectId.isValid(currentUserId)
          ? { _id: { $ne: new ObjectId(currentUserId) } }
          : {},
        { projection: { name: 1, email: 1, role: 1, image: 1 } }
      )
      .limit(100);

    const docs = await usersCursor.toArray();

    const users: User[] = docs.map((doc) => ({
      id: doc._id?.toString() || doc.email,
      name: doc.name,
      email: doc.email,
      avatar: doc.image || DEFAULT_CHAT_AVATAR,
      role: mapUserRoleToChatRole(doc.role),
      status: "online",
      lastSeen: new Date(),
    }));

    return NextResponse.json({
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
