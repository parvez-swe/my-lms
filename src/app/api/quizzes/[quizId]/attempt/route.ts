import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { QuizDocument } from "@/models/Quiz";
import { QuizAttemptDocument } from "@/models/QuizAttempt";
import { gradeQuiz } from "@/lib/quiz";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// POST submit quiz attempt (student)
export async function POST(
  request: NextRequest,
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

    const body = await request.json();
    const { answers, startedAt } = body as {
      answers: { questionId: string; answer: string }[];
      startedAt?: string;
    };

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { success: false, error: "Answers are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const quiz = await db.collection<QuizDocument>("quizzes").findOne({
      _id: new ObjectId(quizId),
    });

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    const priorAttempts = await db
      .collection<QuizAttemptDocument>("quizAttempts")
      .countDocuments({ quizId, userId });

    if (quiz.maxAttempts > 0 && priorAttempts >= quiz.maxAttempts) {
      return NextResponse.json(
        { success: false, error: "Maximum attempts reached" },
        { status: 403 }
      );
    }

    if (quiz.timeLimit && startedAt) {
      const started = new Date(startedAt);
      const elapsed = (Date.now() - started.getTime()) / 1000;
      if (elapsed > quiz.timeLimit + 5) {
        return NextResponse.json(
          { success: false, error: "Time limit exceeded" },
          { status: 400 }
        );
      }
    }

    const { score, passed, results } = gradeQuiz(quiz, answers);
    const completedAt = new Date();

    const attempt: QuizAttemptDocument = {
      userId,
      quizId,
      courseSlug: quiz.courseSlug,
      answers,
      score,
      passed,
      attemptNumber: priorAttempts + 1,
      startedAt: startedAt ? new Date(startedAt) : completedAt,
      completedAt,
    };

    const result = await db
      .collection<QuizAttemptDocument>("quizAttempts")
      .insertOne(attempt);

    return NextResponse.json({
      success: true,
      data: {
        attemptId: result.insertedId.toString(),
        score,
        passed,
        attemptNumber: attempt.attemptNumber,
        results,
        attemptsRemaining:
          quiz.maxAttempts === 0
            ? null
            : Math.max(0, quiz.maxAttempts - attempt.attemptNumber),
      },
    });
  } catch (error) {
    console.error("Failed to submit quiz attempt:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit quiz attempt" },
      { status: 500 }
    );
  }
}
