import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { completeGatewayPayment } from "@/lib/payments/complete";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") || "unknown";
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (status === "success" && sessionId) {
    try {
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (secretKey) {
        const res = await fetch(
          `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
          {
            headers: { Authorization: `Bearer ${secretKey}` },
          }
        );
        const session = await res.json();
        if (session.payment_status === "paid") {
          const db = await getDatabase();
          await completeGatewayPayment(db, { gatewaySessionId: sessionId });
        }
      }
    } catch (error) {
      console.error("Stripe callback verification error:", error);
    }
  }

  const messages: Record<string, string> = {
    success:
      "Stripe payment successful! Your enrollment will be activated shortly.",
    cancelled: "Stripe payment was cancelled.",
  };

  const message = encodeURIComponent(
    messages[status] || "Payment status unknown."
  );

  return NextResponse.redirect(
    `${appUrl}/mycourses?payment=${status}&message=${message}`
  );
}
