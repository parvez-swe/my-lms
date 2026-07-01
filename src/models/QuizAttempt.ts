import { ObjectId } from "mongodb";

export interface QuizAttemptAnswer {
  questionId: string;
  answer: string;
}

export interface QuizAttemptDocument {
  _id?: ObjectId;
  userId: ObjectId | string;
  quizId: string;
  courseSlug: string;
  answers: QuizAttemptAnswer[];
  score: number;
  passed: boolean;
  attemptNumber: number;
  startedAt: Date;
  completedAt: Date;
}

export type QuizAttempt = Omit<QuizAttemptDocument, "_id" | "userId"> & {
  _id?: string;
  userId: string;
};
