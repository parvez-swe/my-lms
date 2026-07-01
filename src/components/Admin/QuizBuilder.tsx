"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { QuizQuestion, QuizQuestionType } from "@/models/Quiz";

interface QuizBuilderProps {
  courseSlug: string;
  moduleIndex: number;
  lessonIndex?: number;
  label?: string;
}

interface QuizFormState {
  _id?: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  maxAttempts: number;
  timeLimit: number | "";
}

const emptyQuestion = (type: QuizQuestionType = "mcq"): QuizQuestion => ({
  id: crypto.randomUUID(),
  type,
  text: "",
  options: type === "mcq" ? ["", ""] : undefined,
  correctAnswer: type === "true_false" ? "true" : "0",
  points: 1,
  explanation: "",
});

const defaultForm: QuizFormState = {
  title: "",
  description: "",
  questions: [emptyQuestion()],
  passingScore: 70,
  maxAttempts: 0,
  timeLimit: "",
};

export default function QuizBuilder({
  courseSlug,
  moduleIndex,
  lessonIndex,
  label,
}: QuizBuilderProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [form, setForm] = useState<QuizFormState>(defaultForm);

  const lessonQuery =
    lessonIndex !== undefined ? `?lessonIndex=${lessonIndex}` : "";

  const fetchQuiz = useCallback(async () => {
    if (!courseSlug) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/quizzes/course/${courseSlug}/${moduleIndex}${lessonQuery}`
      );
      const result = await res.json();
      if (result.success && result.data) {
        const q = result.data;
        setHasQuiz(true);
        setForm({
          _id: q._id,
          title: q.title || "",
          description: q.description || "",
          questions: q.questions?.length ? q.questions : [emptyQuestion()],
          passingScore: q.passingScore ?? 70,
          maxAttempts: q.maxAttempts ?? 0,
          timeLimit: q.timeLimit ?? "",
        });
      } else {
        setHasQuiz(false);
        setForm(defaultForm);
      }
    } catch {
      setHasQuiz(false);
      setForm(defaultForm);
    } finally {
      setLoading(false);
    }
  }, [courseSlug, moduleIndex, lessonQuery]);

  useEffect(() => {
    if (expanded && courseSlug) {
      fetchQuiz();
    }
  }, [expanded, courseSlug, fetchQuiz]);

  const updateQuestion = (
    index: number,
    field: keyof QuizQuestion,
    value: string | number | string[]
  ) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const changeQuestionType = (index: number, type: QuizQuestionType) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const base = emptyQuestion(type);
      questions[index] = {
        ...questions[index],
        type,
        options: base.options,
        correctAnswer: base.correctAnswer,
      };
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, emptyQuestion()],
    }));
  };

  const removeQuestion = (index: number) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= questions.length) return prev;
      [questions[index], questions[target]] = [
        questions[target],
        questions[index],
      ];
      return { ...prev, questions };
    });
  };

  const updateOption = (
    qIndex: number,
    optIndex: number,
    value: string
  ) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const options = [...(questions[qIndex].options || [])];
      options[optIndex] = value;
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...prev, questions };
    });
  };

  const addOption = (qIndex: number) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const options = [...(questions[qIndex].options || [])];
      if (options.length >= 6) return prev;
      options.push("");
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...prev, questions };
    });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const options = (questions[qIndex].options || []).filter(
        (_, i) => i !== optIndex
      );
      let correctAnswer = questions[qIndex].correctAnswer;
      if (parseInt(correctAnswer, 10) >= options.length) {
        correctAnswer = "0";
      }
      questions[qIndex] = { ...questions[qIndex], options, correctAnswer };
      return { ...prev, questions };
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert("Quiz title is required");
      return;
    }
    if (form.questions.length === 0) {
      alert("Add at least one question");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        questions: form.questions,
        passingScore: form.passingScore,
        maxAttempts: form.maxAttempts,
        timeLimit: form.timeLimit === "" ? undefined : Number(form.timeLimit),
        ...(lessonIndex !== undefined ? { lessonIndex } : {}),
      };

      let res: Response;
      if (hasQuiz && form._id) {
        res = await fetch(`/api/quizzes/${form._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/quizzes/course/${courseSlug}/${moduleIndex}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();
      if (result.success) {
        setHasQuiz(true);
        if (result.data?._id) {
          setForm((prev) => ({ ...prev, _id: result.data._id }));
        }
        alert("Quiz saved successfully");
      } else {
        alert(result.error || "Failed to save quiz");
      }
    } catch {
      alert("Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form._id) return;
    if (!confirm("Delete this quiz? All student attempts will also be removed.")) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/quizzes/${form._id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setHasQuiz(false);
        setForm(defaultForm);
        alert("Quiz deleted");
      } else {
        alert(result.error || "Failed to delete quiz");
      }
    } catch {
      alert("Failed to delete quiz");
    } finally {
      setSaving(false);
    }
  };

  const displayLabel =
    label ||
    (lessonIndex !== undefined
      ? `Lesson ${lessonIndex + 1} Quiz`
      : "Module Quiz");

  return (
    <div className="mt-4 border border-dashed border-purple-300 dark:border-purple-700 rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 font-medium text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
      >
        <span className="flex items-center gap-2">
          <GripVertical size={16} />
          {displayLabel}
          {hasQuiz && (
            <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </span>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4 bg-white dark:bg-[#0c1427]">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Loader2 className="animate-spin mr-2" size={20} />
              Loading quiz...
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="mb-1 text-sm font-medium block">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="E.g. Module 1 Assessment"
                    className="h-[40px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-3 block w-full outline-0 focus:border-purple-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 text-sm font-medium block">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Optional instructions for students"
                    className="rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] p-3 block w-full outline-0 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="mb-1 text-sm font-medium block">
                    Pass Score (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.passingScore}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        passingScore: Number(e.target.value),
                      }))
                    }
                    className="h-[40px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-3 block w-full outline-0"
                  />
                </div>
                <div>
                  <label className="mb-1 text-sm font-medium block">
                    Max Attempts (0 = unlimited)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxAttempts}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        maxAttempts: Number(e.target.value),
                      }))
                    }
                    className="h-[40px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-3 block w-full outline-0"
                  />
                </div>
                <div>
                  <label className="mb-1 text-sm font-medium block">
                    Time Limit (seconds, optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.timeLimit}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        timeLimit:
                          e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    placeholder="e.g. 600"
                    className="h-[40px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-3 block w-full outline-0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h6 className="font-semibold text-sm">Questions</h6>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                  >
                    <Plus size={16} /> Add Question
                  </button>
                </div>

                {form.questions.map((question, qIndex) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 dark:border-[#172036] rounded-md p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        Question {qIndex + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveQuestion(qIndex, "up")}
                          disabled={qIndex === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveQuestion(qIndex, "down")}
                          disabled={qIndex === form.questions.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) =>
                            updateQuestion(qIndex, "text", e.target.value)
                          }
                          placeholder="Question text *"
                          className="h-[40px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-3 block w-full outline-0"
                        />
                      </div>
                      <select
                        value={question.type}
                        onChange={(e) =>
                          changeQuestionType(
                            qIndex,
                            e.target.value as QuizQuestionType
                          )
                        }
                        className="h-[40px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-3 block w-full outline-0"
                      >
                        <option value="mcq">Multiple Choice</option>
                        <option value="true_false">True / False</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                    </div>

                    {question.type === "mcq" && (
                      <div className="space-y-2 pl-2 border-l-2 border-purple-200">
                        <p className="text-xs text-gray-500 font-medium">
                          Options (mark correct)
                        </p>
                        {(question.options || []).map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={
                                question.correctAnswer === String(optIndex)
                              }
                              onChange={() =>
                                updateQuestion(
                                  qIndex,
                                  "correctAnswer",
                                  String(optIndex)
                                )
                              }
                              className="w-4 h-4"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) =>
                                updateOption(qIndex, optIndex, e.target.value)
                              }
                              placeholder={`Option ${optIndex + 1}`}
                              className="flex-1 h-[36px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-3 block outline-0 text-sm"
                            />
                            {(question.options?.length || 0) > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(qIndex, optIndex)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        {(question.options?.length || 0) < 6 && (
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="text-xs text-purple-600 hover:underline"
                          >
                            + Add option
                          </button>
                        )}
                      </div>
                    )}

                    {question.type === "true_false" && (
                      <div className="flex gap-4 pl-2">
                        {["true", "false"].map((val) => (
                          <label
                            key={val}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`tf-${question.id}`}
                              checked={question.correctAnswer === val}
                              onChange={() =>
                                updateQuestion(qIndex, "correctAnswer", val)
                              }
                              className="w-4 h-4"
                            />
                            {val === "true" ? "True" : "False"}
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === "short_answer" && (
                      <input
                        type="text"
                        value={question.correctAnswer}
                        onChange={(e) =>
                          updateQuestion(
                            qIndex,
                            "correctAnswer",
                            e.target.value
                          )
                        }
                        placeholder="Correct answer (case-insensitive)"
                        className="h-[40px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-3 block w-full outline-0 text-sm"
                      />
                    )}

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">Points</label>
                        <input
                          type="number"
                          min={1}
                          value={question.points}
                          onChange={(e) =>
                            updateQuestion(
                              qIndex,
                              "points",
                              Number(e.target.value)
                            )
                          }
                          className="h-[36px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-3 block w-full outline-0 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">
                          Explanation (shown after submit)
                        </label>
                        <input
                          type="text"
                          value={question.explanation || ""}
                          onChange={(e) =>
                            updateQuestion(
                              qIndex,
                              "explanation",
                              e.target.value
                            )
                          }
                          placeholder="Why this answer is correct"
                          className="h-[36px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-3 block w-full outline-0 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-[#172036]">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {hasQuiz ? "Update Quiz" : "Create Quiz"}
                </button>
                {hasQuiz && form._id && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-md text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Delete Quiz
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
