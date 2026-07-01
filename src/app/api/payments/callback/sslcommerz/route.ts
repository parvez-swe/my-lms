import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") || "unknown";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const messages: Record<string, string> = {
    success: "Payment successful! Your enrollment will be activated shortly.",
    failed: "Payment failed. Please try again or use another method.",
    cancelled: "Payment was cancelled.",
  };

  const message = encodeURIComponent(
    messages[status] || "Payment status unknown."
  );

  return NextResponse.redirect(
    `${appUrl}/mycourses?payment=${status}&message=${message}`
  );
}
