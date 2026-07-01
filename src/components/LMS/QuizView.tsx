"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { StudentQuiz, StudentQuizQuestion } from "@/models/Quiz";

interface QuizViewProps {
  courseSlug: string;
  moduleIndex: number;
  lessonIndex: number;
  lessonId: string;
  onQuizPassed: () => void;
}

type QuizPhase = "loading" | "intro" | "active" | "results" | "none";

interface AttemptResult {
  score: number;
  passed: boolean;
  attemptNumber: number;
  attemptsRemaining: number | null;
  results: {
    questionId: string;
    correct: boolean;
    earnedPoints: number;
    correctAnswer: string;
    explanation?: string;
  }[];
}

export default function QuizView({
  courseSlug,
  moduleIndex,
  lessonIndex,
  lessonId: _lessonId,
  onQuizPassed,
}: QuizViewProps) {
  const [phase, setPhase] = useState<QuizPhase>("loading");
  const [quiz, setQuiz] = useState<
    (StudentQuiz & {
      _id?: string;
      attemptCount?: number;
      attemptsRemaining?: number | null;
    }) | null
  >(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lessonQuery = `?lessonIndex=${lessonIndex}`;

  const fetchQuiz = useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch(
        `/api/quizzes/course/${courseSlug}/${moduleIndex}${lessonQuery}`
      );
      const result = await res.json();
      if (result.success && result.data) {
        setQuiz(result.data);
        if (
          result.data.maxAttempts > 0 &&
          result.data.attemptsRemaining === 0
        ) {
          setPhase("results");
          setError("You have used all available attempts for this quiz.");
        } else {
          setPhase("intro");
        }
      } else {
        setPhase("none");
      }
    } catch {
      setPhase("none");
    }
  }, [courseSlug, moduleIndex, lessonQuery]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  useEffect(() => {
    if (phase !== "active" || !quiz?.timeLimit || !startedAt) return;

    const endTime = new Date(startedAt).getTime() + quiz.timeLimit * 1000;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        handleSubmit(true);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, quiz?.timeLimit, startedAt]);

  const startQuiz = () => {
    setCurrentIndex(0);
    setAnswers({});
    setAttemptResult(null);
    setStartedAt(new Date().toISOString());
    setTimeLeft(quiz?.timeLimit ?? null);
    setPhase("active");
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!quiz?._id || submitting) return;

    const unanswered = quiz.questions.filter((q) => !answers[q.id]?.trim());
    if (!autoSubmit && unanswered.length > 0) {
      if (
        !confirm(
          `${unanswered.length} question(s) unanswered. Submit anyway?`
        )
      ) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/quizzes/${quiz._id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: quiz.questions.map((q) => ({
            questionId: q.id,
            answer: answers[q.id] || "",
          })),
          startedAt,
        }),
      });
      const result = await res.json();

      if (result.success) {
        setAttemptResult(result.data);
        setPhase("results");
        if (result.data.passed) {
          onQuizPassed();
        }
      } else {
        setError(result.error || "Failed to submit quiz");
      }
    } catch {
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canRetry =
    attemptResult &&
    !attemptResult.passed &&
    (attemptResult.attemptsRemaining === null ||
      attemptResult.attemptsRemaining > 0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (phase === "loading") {
    return (
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border flex justify-center">
        <Loader2 className="animate-spin text-purple-600" size={24} />
      </div>
    );
  }

  if (phase === "none") return null;

  const question: StudentQuizQuestion | undefined =
    quiz?.questions[currentIndex];

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="text-purple-600" size={24} />
          {quiz?.title}
        </h2>
        {phase === "active" && timeLeft !== null && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
              timeLeft < 60
                ? "bg-red-100 text-red-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {quiz?.description && phase === "intro" && (
        <p className="text-gray-600 mb-6">{quiz.description}</p>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {phase === "intro" && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">Questions</p>
              <p className="text-xl font-bold text-gray-900">
                {quiz?.questions.length}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">Pass Score</p>
              <p className="text-xl font-bold text-gray-900">
                {quiz?.passingScore}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">Attempts</p>
              <p className="text-xl font-bold text-gray-900">
                {quiz?.maxAttempts === 0
                  ? "Unlimited"
                  : `${quiz?.attemptsRemaining ?? quiz?.maxAttempts} left`}
              </p>
            </div>
          </div>
          {quiz?.timeLimit && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Clock size={14} />
              Time limit: {formatTime(quiz.timeLimit)}
            </p>
          )}
          <button
            onClick={startQuiz}
            className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Start Quiz
          </button>
        </div>
      )}

      {phase === "active" && quiz && question && (
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>
                Question {currentIndex + 1} of {quiz.questions.length}
              </span>
              <span>{question.points} pt(s)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentIndex + 1) / quiz.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <p className="text-lg font-medium text-gray-900 mb-6">
            {question.text}
          </p>

          <div className="space-y-3 mb-8">
            {question.type === "mcq" &&
              question.options?.map((opt, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[question.id] === String(i)
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[question.id] === String(i)}
                    onChange={() => handleAnswer(question.id, String(i))}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-gray-800">{opt}</span>
                </label>
              ))}

            {question.type === "true_false" &&
              ["true", "false"].map((val) => (
                <label
                  key={val}
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[question.id] === val
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[question.id] === val}
                    onChange={() => handleAnswer(question.id, val)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-gray-800 capitalize">{val}</span>
                </label>
              ))}

            {question.type === "short_answer" && (
              <input
                type="text"
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="Type your answer..."
                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentIndex < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "results" && !attemptResult && error && (
        <div className="text-center py-8 text-gray-600">
          <XCircle className="mx-auto mb-3 text-red-500" size={40} />
          <p>{error}</p>
        </div>
      )}

      {phase === "results" && quiz && attemptResult && (
        <div>
          <div
            className={`text-center p-6 rounded-lg mb-6 ${
              attemptResult.passed
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {attemptResult.passed ? (
              <CheckCircle2
                className="mx-auto mb-3 text-green-600"
                size={48}
              />
            ) : (
              <XCircle className="mx-auto mb-3 text-red-600" size={48} />
            )}
            <h3
              className={`text-2xl font-bold ${
                attemptResult.passed ? "text-green-800" : "text-red-800"
              }`}
            >
              {attemptResult.passed ? "You Passed!" : "Not Quite — Try Again"}
            </h3>
            <p className="text-lg mt-2 text-gray-700">
              Score: <strong>{attemptResult.score}%</strong> (need{" "}
              {quiz?.passingScore}% to pass)
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Attempt {attemptResult.attemptNumber}
              {attemptResult.attemptsRemaining !== null &&
                ` · ${attemptResult.attemptsRemaining} attempt(s) remaining`}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-gray-800">Review Answers</h4>
            {quiz?.questions.map((q, i) => {
              const result = attemptResult.results.find(
                (r) => r.questionId === q.id
              );
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border ${
                    result?.correct
                      ? "border-green-200 bg-green-50/50"
                      : "border-red-200 bg-red-50/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result?.correct ? (
                      <CheckCircle2
                        size={18}
                        className="text-green-600 mt-0.5 flex-shrink-0"
                      />
                    ) : (
                      <XCircle
                        size={18}
                        className="text-red-600 mt-0.5 flex-shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">
                        {i + 1}. {q.text}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your answer:{" "}
                        <span className="font-medium">
                          {answers[q.id] || "(no answer)"}
                        </span>
                      </p>
                      {!result?.correct && (
                        <p className="text-sm text-gray-600">
                          Correct answer:{" "}
                          <span className="font-medium text-green-700">
                            {q.type === "mcq"
                              ? q.options?.[parseInt(result?.correctAnswer || "0", 10)]
                              : result?.correctAnswer}
                          </span>
                        </p>
                      )}
                      {result?.explanation && (
                        <p className="text-sm text-purple-700 mt-2 bg-purple-50 p-2 rounded">
                          {result.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {canRetry && (
            <button
              onClick={startQuiz}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
            >
              <RotateCcw size={18} />
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
