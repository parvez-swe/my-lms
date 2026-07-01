import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const teachers = await db
      .collection("users")
      .find({
        role: { $in: ["teacher", "mentor", "admin", "superadmin"] },
      })
      .project({
        _id: 1,
        name: 1,
        email: 1,
        image: 1,
        bio: 1,
        headline: 1,
        role: 1,
      })
      .sort({ name: 1 })
      .toArray();

    const data = teachers.map((t) => ({
      id: t._id.toString(),
      name: t.name || t.email,
      email: t.email,
      image: t.image || "/images/users/user1.jpg",
      bio: t.bio || "",
      headline: t.headline || "",
      role: t.role,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch instructors" },
      { status: 500 }
    );
  }
}
