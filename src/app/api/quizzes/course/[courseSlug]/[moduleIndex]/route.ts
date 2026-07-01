import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { QuizDocument } from "@/models/Quiz";
import { QuizAttemptDocument } from "@/models/QuizAttempt";
import {
  buildQuizQuery,
  isAdminRole,
  stripAnswersForStudent,
} from "@/lib/quiz";
import { serializeDocument } from "@/lib/serialize";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// GET quiz for a module or lesson
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string; moduleIndex: string }> }
) {
  /* auth-guarded */
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courseSlug, moduleIndex } = await params;
    const moduleIdx = parseInt(moduleIndex, 10);

    if (isNaN(moduleIdx)) {
      return NextResponse.json(
        { success: false, error: "Invalid module index" },
        { status: 400 }
      );
    }

    const lessonIndexParam = request.nextUrl.searchParams.get("lessonIndex");
    const lessonIndex =
      lessonIndexParam !== null && lessonIndexParam !== ""
        ? parseInt(lessonIndexParam, 10)
        : null;

    if (lessonIndexParam !== null && lessonIndexParam !== "" && isNaN(lessonIndex!)) {
      return NextResponse.json(
        { success: false, error: "Invalid lesson index" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const query = buildQuizQuery(courseSlug, moduleIdx, lessonIndex);

    const quiz = await db.collection<QuizDocument>("quizzes").findOne(query);

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    const quizId = quiz._id?.toString() || "";

    if (isAdminRole(session.user.role)) {
      return NextResponse.json({
        success: true,
        data: serializeDocument({ ...quiz, _id: quizId }),
      });
    }

    const attemptCount = await db
      .collection<QuizAttemptDocument>("quizAttempts")
      .countDocuments({
        quizId,
        userId: new ObjectId(session.user.id),
      });

    const studentQuiz = stripAnswersForStudent(quiz);

    return NextResponse.json({
      success: true,
      data: {
        ...studentQuiz,
        _id: quizId,
        attemptCount,
        attemptsRemaining:
          quiz.maxAttempts === 0
            ? null
            : Math.max(0, quiz.maxAttempts - attemptCount),
      },
    });
  } catch (error) {
    console.error("Failed to fetch quiz:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// POST create quiz (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string; moduleIndex: string }> }
) {
  /* auth-guarded */
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { courseSlug, moduleIndex } = await params;
    const moduleIdx = parseInt(moduleIndex, 10);

    if (isNaN(moduleIdx)) {
      return NextResponse.json(
        { success: false, error: "Invalid module index" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      questions,
      passingScore,
      maxAttempts,
      timeLimit,
      lessonIndex,
    } = body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Title and at least one question are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const query = buildQuizQuery(
      courseSlug,
      moduleIdx,
      lessonIndex !== undefined && lessonIndex !== null
        ? Number(lessonIndex)
        : null
    );

    const existing = await db.collection<QuizDocument>("quizzes").findOne(query);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Quiz already exists for this module/lesson" },
        { status: 400 }
      );
    }

    const newQuiz: QuizDocument = {
      courseSlug,
      moduleIndex: moduleIdx,
      lessonIndex:
        lessonIndex !== undefined && lessonIndex !== null
          ? Number(lessonIndex)
          : undefined,
      title,
      description: description || "",
      questions,
      passingScore: passingScore ?? 70,
      maxAttempts: maxAttempts ?? 0,
      timeLimit: timeLimit || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (newQuiz.lessonIndex === undefined) {
      delete newQuiz.lessonIndex;
    }

    const result = await db.collection<QuizDocument>("quizzes").insertOne({
      ...newQuiz,
      lessonIndex:
        newQuiz.lessonIndex !== undefined ? newQuiz.lessonIndex : null,
    } as QuizDocument);

    return NextResponse.json(
      {
        success: true,
        data: serializeDocument({
          ...newQuiz,
          _id: result.insertedId,
          lessonIndex:
            newQuiz.lessonIndex !== undefined ? newQuiz.lessonIndex : null,
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create quiz:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
