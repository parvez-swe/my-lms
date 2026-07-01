import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { QuizDocument } from "@/models/Quiz";
import { isAdminRole } from "@/lib/quiz";
import { serializeDocument } from "@/lib/serialize";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// PUT update quiz (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
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
    const { quizId } = await params;

    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json(
        { success: false, error: "Invalid quiz ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const db = await getDatabase();

    const existing = await db.collection<QuizDocument>("quizzes").findOne({
      _id: new ObjectId(quizId),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    const update: Partial<QuizDocument> = {
      title: body.title ?? existing.title,
      description: body.description ?? existing.description,
      questions: body.questions ?? existing.questions,
      passingScore: body.passingScore ?? existing.passingScore,
      maxAttempts: body.maxAttempts ?? existing.maxAttempts,
      timeLimit: body.timeLimit ?? existing.timeLimit,
      updatedAt: new Date(),
    };

    await db.collection<QuizDocument>("quizzes").updateOne(
      { _id: new ObjectId(quizId) },
      { $set: update }
    );

    const updated = await db.collection<QuizDocument>("quizzes").findOne({
      _id: new ObjectId(quizId),
    });

    return NextResponse.json({
      success: true,
      data: serializeDocument(updated),
    });
  } catch (error) {
    console.error("Failed to update quiz:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

// DELETE quiz (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
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
    const { quizId } = await params;

    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json(
        { success: false, error: "Invalid quiz ID" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db.collection<QuizDocument>("quizzes").deleteOne({
      _id: new ObjectId(quizId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    await db.collection("quizAttempts").deleteMany({ quizId });

    return NextResponse.json({ success: true, message: "Quiz deleted" });
  } catch (error) {
    console.error("Failed to delete quiz:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
