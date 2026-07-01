import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { CourseDocument } from "@/models/Course";
import { PaymentTransactionDocument } from "@/models/Payment";
import { ObjectId } from "mongodb";
import { resolveCoursePrice } from "@/lib/currency";
import { initiatePayment, isGatewayMethod } from "@/lib/payments";
import { PaymentMethod } from "@/models/Payment";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      courseSlug,
      method,
      payerNumber,
      transactionId,
    }: {
      courseSlug?: string;
      method?: PaymentMethod;
      payerNumber?: string;
      transactionId?: string;
    } = body;

    if (!courseSlug || !method) {
      return NextResponse.json(
        { error: "courseSlug and method are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const course = await db
      .collection<CourseDocument>("courses")
      .findOne({ slug: courseSlug });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const pricing = resolveCoursePrice(course);
    if (pricing.amount === 0) {
      return NextResponse.json(
        { error: "This course is free — no payment required" },
        { status: 400 }
      );
    }

    const userId = new ObjectId(session.user.id);
    const now = new Date();

    const paymentDoc: PaymentTransactionDocument = {
      userId,
      courseSlug,
      method,
      amount: pricing.amount,
      currency: pricing.currency,
      status: isGatewayMethod(method) ? "processing" : "pending",
      payerNumber,
      transactionId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db
      .collection<PaymentTransactionDocument>("payments")
      .insertOne(paymentDoc);

    const init = await initiatePayment({
      method,
      amount: pricing.amount,
      currency: pricing.currency,
      courseSlug,
      courseTitle: course.title,
      userId: session.user.id,
      userEmail: session.user.email || "",
      userName: session.user.name || "Student",
      payerNumber,
      transactionId,
    });

    if (!init.success) {
      await db.collection("payments").updateOne(
        { _id: result.insertedId },
        { $set: { status: "failed", updatedAt: new Date() } }
      );
      return NextResponse.json({ error: init.error }, { status: 400 });
    }

    if (init.sessionId || init.redirectUrl) {
      await db.collection("payments").updateOne(
        { _id: result.insertedId },
        {
          $set: {
            gatewaySessionId: init.sessionId,
            redirectUrl: init.redirectUrl,
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: result.insertedId.toString(),
      manual: init.manual ?? false,
      redirectUrl: init.redirectUrl,
    });
  } catch (error) {
    console.error("Payment initiate error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
