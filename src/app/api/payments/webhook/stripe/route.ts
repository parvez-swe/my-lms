import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { completeGatewayPayment } from "@/lib/payments/complete";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secretKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const body = await request.text();
    let event: { type?: string; data?: { object?: { id?: string } } };

    if (webhookSecret) {
      const signature = request.headers.get("stripe-signature");
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
      }

      const verified = await verifyStripeWebhook(body, signature, webhookSecret);
      if (!verified) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
      event = JSON.parse(body);
    } else {
      event = JSON.parse(body);
    }

    if (event.type === "checkout.session.completed") {
      const sessionId = event.data?.object?.id;
      if (sessionId) {
        const db = await getDatabase();
        await completeGatewayPayment(db, { gatewaySessionId: sessionId });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

async function verifyStripeWebhook(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(",").reduce(
    (acc, part) => {
      const [key, value] = part.split("=");
      if (key === "t") acc.timestamp = value;
      if (key === "v1") acc.signatures.push(value);
      return acc;
    },
    { timestamp: "", signatures: [] as string[] }
  );

  if (!parts.timestamp || parts.signatures.length === 0) return false;

  const signedPayload = `${parts.timestamp}.${payload}`;
  const crypto = await import("crypto");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return parts.signatures.some((sig) => {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(sig),
        Buffer.from(expected)
      );
    } catch {
      return false;
    }
  });
}
