import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument } from "@/models/User";
import { DEFAULT_CHAT_AVATAR, mapUserRoleToChatRole } from "@/lib/chatRepository";

export const dynamic = "force-dynamic";

// GET /api/chat/get-admin - Get the first admin user for visitor conversations
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Find the first admin or superadmin user
    const adminUser = await db
      .collection<UserDocument>("users")
      .findOne(
        { role: { $in: ["admin", "superadmin"] } },
        { 
          projection: { name: 1, email: 1, role: 1, image: 1 },
          sort: { createdAt: 1 } // Get the first admin created
        }
      );

    if (!adminUser) {
      // If no admin exists, return a default admin ID
      // This allows the system to work even without an admin user
      return NextResponse.json({
        id: "admin-1",
        name: "Admin Support",
        email: "admin@support.com",
        avatar: DEFAULT_CHAT_AVATAR,
        role: "admin",
      });
    }

    return NextResponse.json({
      id: adminUser._id?.toString() || adminUser.email || "admin-1",
      name: adminUser.name || "Admin Support",
      email: adminUser.email || "admin@support.com",
      avatar: adminUser.image || DEFAULT_CHAT_AVATAR,
      role: mapUserRoleToChatRole(adminUser.role),
    });
  } catch (error) {
    console.error("Error fetching admin user:", error);
    // Return default admin on error
    return NextResponse.json({
      id: "admin-1",
      name: "Admin Support",
      email: "admin@support.com",
      avatar: DEFAULT_CHAT_AVATAR,
      role: "admin",
    });
  }
}

