"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import LessonView from "@/components/LMS/LessonView";
import { Course } from "@/data/courses";
import { EnrollmentDocument } from "@/models/Enrollment";

interface LessonClientPageProps {
  course: Course;
  moduleIndex: number;
  lessonIndex: number;
  slug: string;
  enrollment: EnrollmentDocument;
}

function getNavigationLinks(
  slug: string,
  course: Course,
  moduleIndex: number,
  lessonIndex: number
) {
  let prevLessonLink: string | null = null;
  let nextLessonLink: string | null = null;

  // Find previous lesson
  if (lessonIndex > 0) {
    prevLessonLink = `/mycourses/${slug}/${moduleIndex}/${lessonIndex - 1}`;
  } else if (moduleIndex > 0) {
    const prevModuleIndex = moduleIndex - 1;
    const prevModule = course.modules[prevModuleIndex];
    const prevLessonIndex = prevModule.lessons.length - 1;
    prevLessonLink = `/mycourses/${slug}/${prevModuleIndex}/${prevLessonIndex}`;
  }

  // Find next lesson
  const currentModuleLessonCount = course.modules[moduleIndex].lessons.length;
  if (lessonIndex < currentModuleLessonCount - 1) {
    nextLessonLink = `/mycourses/${slug}/${moduleIndex}/${lessonIndex + 1}`;
  } else if (moduleIndex < course.modules.length - 1) {
    const nextModuleIndex = moduleIndex + 1;
    nextLessonLink = `/mycourses/${slug}/${nextModuleIndex}/0`;
  }

  return { prevLessonLink, nextLessonLink };
}

const LessonClientPage: React.FC<LessonClientPageProps> = ({
  course,
  moduleIndex,
  lessonIndex,
  slug,
  enrollment: initialEnrollment,
}) => {
  const { status } = useSession();
  const [enrollment, setEnrollment] =
    useState<EnrollmentDocument>(initialEnrollment);
  const [hasQuiz, setHasQuiz] = useState<boolean | null>(null);

  const lessonId = `${moduleIndex}-${lessonIndex}`;

  const checkForQuiz = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/quizzes/course/${slug}/${moduleIndex}?lessonIndex=${lessonIndex}`
      );
      const result = await res.json();
      setHasQuiz(result.success && !!result.data);
    } catch {
      setHasQuiz(false);
    }
  }, [slug, moduleIndex, lessonIndex]);

  useEffect(() => {
    checkForQuiz();
  }, [checkForQuiz]);

  const checkCertificate = async (completedLessons: string[]) => {
    const totalLessons = course.modules.reduce(
      (acc, mod) => acc + mod.lessons.length,
      0
    );
    if (completedLessons.length >= totalLessons) {
      try {
        await fetch(`/api/certificates/${slug}`);
      } catch (error) {
        console.error("Failed to check certificate:", error);
      }
    }
  };

  const updateProgress = async (lessonIdToUpdate: string, completed: boolean) => {
    try {
      const response = await fetch("/api/progress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseSlug: slug,
          lessonId: lessonIdToUpdate,
          completed,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setEnrollment((prev) => ({
            ...prev,
            progress: {
              ...prev.progress,
              completedLessons: result.data.completedLessons,
            },
          }));
          if (completed) {
            await checkCertificate(result.data.completedLessons);
          }
          return result.data.completedLessons as string[];
        }
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
    return null;
  };

  const handleQuizPassed = async () => {
    await updateProgress(lessonId, true);
  };

  useEffect(() => {
    // Auto-mark complete only when lesson has no linked quiz
    if (hasQuiz === false) {
      const completedLessonIds = new Set(
        enrollment.progress?.completedLessons || []
      );
      if (!completedLessonIds.has(lessonId)) {
        updateProgress(lessonId, true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, slug, moduleIndex, lessonIndex, hasQuiz]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  const mod = course.modules[moduleIndex];
  const lesson = mod?.lessons[lessonIndex];

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600">Lesson not found</p>
      </div>
    );
  }

  const completedLessonIds = new Set(
    enrollment.progress?.completedLessons || []
  );

  const { prevLessonLink, nextLessonLink } = getNavigationLinks(
    slug,
    course,
    moduleIndex,
    lessonIndex
  );

  const handleToggleComplete = async (lessonId: string, completed: boolean) => {
    await updateProgress(lessonId, !completed);
  };

  return (
    <LessonView
      course={course}
      moduleIndex={moduleIndex}
      lessonIndex={lessonIndex}
      lesson={lesson}
      completedLessonIds={completedLessonIds}
      prevLessonLink={prevLessonLink}
      nextLessonLink={nextLessonLink}
      slug={slug}
      onToggleComplete={handleToggleComplete}
      onQuizPassed={handleQuizPassed}
    />
  );
};

export default LessonClientPage;
