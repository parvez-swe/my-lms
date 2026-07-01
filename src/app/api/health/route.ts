import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();

  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });

    return NextResponse.json({
      status: "ok",
      db: "connected",
      uptime,
      timestamp,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "degraded",
        db: "disconnected",
        uptime,
        timestamp,
      },
      { status: 503 }
    );
  }
}
