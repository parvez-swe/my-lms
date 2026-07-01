import { QuizDocument, QuizQuestion, StudentQuiz } from "@/models/Quiz";
import { serializeDocument } from "@/lib/serialize";

import { isAdminRole } from "@/lib/rbac";

export { isAdminRole };

export function stripAnswersForStudent(quiz: QuizDocument): StudentQuiz {
  const serialized = serializeDocument(quiz) as QuizDocument & { _id?: string };
  return {
    ...serialized,
    _id: serialized._id?.toString(),
    questions: quiz.questions.map(({ correctAnswer: _correctAnswer, explanation: _explanation, ...q }) => q),
  };
}

export function gradeAnswer(
  question: QuizQuestion,
  answer: string
): { correct: boolean; earnedPoints: number } {
  const normalizedAnswer = answer.trim();

  if (question.type === "mcq") {
    const correct = normalizedAnswer === question.correctAnswer;
    return { correct, earnedPoints: correct ? question.points : 0 };
  }

  if (question.type === "true_false") {
    const correct =
      normalizedAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
    return { correct, earnedPoints: correct ? question.points : 0 };
  }

  const correct =
    normalizedAnswer.toLowerCase() ===
    question.correctAnswer.trim().toLowerCase();
  return { correct, earnedPoints: correct ? question.points : 0 };
}

export function gradeQuiz(
  quiz: QuizDocument,
  answers: { questionId: string; answer: string }[]
): {
  score: number;
  passed: boolean;
  results: {
    questionId: string;
    correct: boolean;
    earnedPoints: number;
    correctAnswer: string;
    explanation?: string;
  }[];
} {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));
  let earned = 0;
  let total = 0;

  const results = quiz.questions.map((question) => {
    total += question.points;
    const answer = answerMap.get(question.id) ?? "";
    const { correct, earnedPoints } = gradeAnswer(question, answer);
    earned += earnedPoints;

    return {
      questionId: question.id,
      correct,
      earnedPoints,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    };
  });

  const score = total > 0 ? Math.round((earned / total) * 100) : 0;
  const passed = score >= quiz.passingScore;

  return { score, passed, results };
}

export function buildQuizQuery(
  courseSlug: string,
  moduleIndex: number,
  lessonIndex?: number | null
) {
  if (lessonIndex !== undefined && lessonIndex !== null && !isNaN(lessonIndex)) {
    return { courseSlug, moduleIndex, lessonIndex };
  }
  return { courseSlug, moduleIndex, lessonIndex: null };
}
