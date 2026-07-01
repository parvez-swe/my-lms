import { ObjectId } from "mongodb";

export type QuizQuestionType = "mcq" | "true_false" | "short_answer";

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  text: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
}

export interface QuizDocument {
  _id?: ObjectId;
  courseSlug: string;
  moduleIndex: number;
  lessonIndex?: number | null;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type Quiz = Omit<QuizDocument, "_id"> & { _id?: string };

export type StudentQuizQuestion = Omit<
  QuizQuestion,
  "correctAnswer" | "explanation"
>;

export type StudentQuiz = Omit<Quiz, "questions"> & {
  questions: StudentQuizQuestion[];
};
