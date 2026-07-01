import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { completeGatewayPayment } from "@/lib/payments/complete";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const tranId = form.get("tran_id")?.toString();
    const status = form.get("status")?.toString();
    const valId = form.get("val_id")?.toString();

    if (!tranId) {
      return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });
    }

    const db = await getDatabase();
    const isSuccess = status === "VALID" || status === "VALIDATED";

    if (isSuccess) {
      await completeGatewayPayment(db, {
        gatewaySessionId: tranId,
        gatewayTransactionId: valId,
      });
    } else {
      await db.collection("payments").updateOne(
        { gatewaySessionId: tranId },
        { $set: { status: "failed", updatedAt: new Date() } }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("SSLCommerz webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
