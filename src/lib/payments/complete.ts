import { Db, ObjectId } from "mongodb";
import { EnrollmentDocument } from "@/models/Enrollment";
import { CourseDocument } from "@/models/Course";
import { PaymentTransactionDocument } from "@/models/Payment";
import { sendEnrollmentStatusEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

export async function approveEnrollmentAfterPayment(
  db: Db,
  enrollment: EnrollmentDocument & { _id: ObjectId },
  course: CourseDocument
): Promise<void> {
  if (enrollment.status === "approved") return;

  await db.collection("enrollments").updateOne(
    { _id: enrollment._id },
    {
      $set: {
        status: "approved",
        enrolledAt: enrollment.enrolledAt ?? new Date(),
        updatedAt: new Date(),
      },
    }
  );

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(enrollment.userId) });

  if (user?.email && user?.name) {
    await sendEnrollmentStatusEmail(
      user.email,
      user.name,
      course,
      "approved"
    );
  }

  const studentUserId =
    typeof enrollment.userId === "string"
      ? enrollment.userId
      : enrollment.userId.toString();

  await createNotification(db, {
    userId: studentUserId,
    type: "enrollment_approved",
    message: `Your enrollment in "${course.title}" has been approved.`,
    link: `/mycourses/${enrollment.courseSlug}`,
  });
}

export async function completeGatewayPayment(
  db: Db,
  filter: {
    gatewaySessionId?: string;
    paymentId?: ObjectId;
    gatewayTransactionId?: string;
  }
): Promise<boolean> {
  const payment = await db
    .collection<PaymentTransactionDocument>("payments")
    .findOne(
      filter.paymentId
        ? { _id: filter.paymentId }
        : { gatewaySessionId: filter.gatewaySessionId }
    );

  if (!payment) return false;

  const now = new Date();
  const alreadyCompleted = payment.status === "completed";

  if (!alreadyCompleted) {
    await db.collection<PaymentTransactionDocument>("payments").updateOne(
      { _id: payment._id },
      {
        $set: {
          status: "completed",
          completedAt: now,
          updatedAt: now,
          ...(filter.gatewayTransactionId
            ? { gatewayTransactionId: filter.gatewayTransactionId }
            : {}),
        },
      }
    );
  }

  const enrollment = await db
    .collection<EnrollmentDocument>("enrollments")
    .findOne({
      userId: payment.userId,
      courseSlug: payment.courseSlug,
    });

  if (!enrollment?._id || enrollment.status === "approved") {
    return true;
  }

  const course = await db
    .collection<CourseDocument>("courses")
    .findOne({ slug: payment.courseSlug });

  if (!course) return true;

  await db.collection("enrollments").updateOne(
    { _id: enrollment._id },
    {
      $set: {
        "payment.paidAt": now,
        "payment.amount": payment.amount,
        "payment.currency": payment.currency,
        "payment.paymentRecordId": payment._id?.toString(),
        updatedAt: now,
      },
    }
  );

  await approveEnrollmentAfterPayment(
    db,
    enrollment as EnrollmentDocument & { _id: ObjectId },
    course
  );

  await db.collection("payments").updateOne(
    { _id: payment._id },
    { $set: { enrollmentId: enrollment._id, updatedAt: now } }
  );

  return true;
}
