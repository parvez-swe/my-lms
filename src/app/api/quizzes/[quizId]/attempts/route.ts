import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { QuizAttemptDocument } from "@/models/QuizAttempt";
import { serializeDocument } from "@/lib/serialize";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// GET student's own attempts for a quiz
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  /* auth-guarded */
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { quizId } = await params;

    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json(
        { success: false, error: "Invalid quiz ID" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const attempts = await db
      .collection<QuizAttemptDocument>("quizAttempts")
      .find({ quizId, userId })
      .sort({ completedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: attempts.map((a) => serializeDocument(a)),
    });
  } catch (error) {
    console.error("Failed to fetch quiz attempts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quiz attempts" },
      { status: 500 }
    );
  }
}
