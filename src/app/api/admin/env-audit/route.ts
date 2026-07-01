import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import { envAuditSummary } from "@/lib/envAudit";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const summary = envAuditSummary();
  return NextResponse.json({ success: true, data: summary });
}
