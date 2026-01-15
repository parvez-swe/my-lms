"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Course } from "@/data/courses";
import Image from "next/image";
import {
  Clock,
  Github,
  Linkedin,
  PlayCircle,
  Star,
  Twitter,
  Users,
  BookOpen,
  CheckCircle2,
  Circle,
  Award,
  X,
  Loader2,
  MessageSquare,
  Eye,
  FileDown,
} from "lucide-react";
import Link from "next/link";
import DiscussionSection from "./DiscussionSection";
import ProgressBanner from "./ProgressBanner";
import AchievementCard from "./AchievementCard";
import { EnrollmentDocument } from "@/models/Enrollment";

// Helper Components
const SocialIcon = ({ platform }: { platform: string }) => {
  if (platform === "linkedin") return <Linkedin size={20} />;
  if (platform === "twitter") return <Twitter size={20} />;
  if (platform === "github") return <Github size={20} />;
  return null;
};

const StarRating = ({ rating }: { rating: number }) => {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < rounded ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );
};

interface EnrolledCourseClientProps {
  course: Course;
  enrollment: Omit<EnrollmentDocument, "_id" | "userId"> & {
    _id?: string;
    userId: string;
  };
}

const EnrolledCourseClient: React.FC<EnrolledCourseClientProps> = ({
  course,
  enrollment,
}) => {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isDownloadingCertificate, setIsDownloadingCertificate] =
    useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [localCompletedLessons, setLocalCompletedLessons] = useState<
    Set<string>
  >(new Set(enrollment.progress?.completedLessons || []));
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [feedbackState, setFeedbackState] = useState(
    enrollment.feedback || null
  );
  const [ratingValue, setRatingValue] = useState(
    enrollment.feedback?.rating || 5
  );
  const [feedbackComment, setFeedbackComment] = useState(
    enrollment.feedback?.comment || ""
  );
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackAlert, setFeedbackAlert] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [courseRating, setCourseRating] = useState({
    average: course.ratingAverage ?? 0,
    count: course.ratingCount ?? 0,
  });
  const { data: session } = useSession();

  const totalLessons = course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );
  const completedLessons = localCompletedLessons.size;
  const progressPercentage = Math.round(
    (completedLessons / totalLessons) * 100
  );
  const canSubmitFeedback = progressPercentage === 100 && !feedbackState;

  // Use local state for completed lessons
  const completedLessonIds = localCompletedLessons;

  // Update local progress when enrollment changes
  useEffect(() => {
    setLocalCompletedLessons(
      new Set(enrollment.progress?.completedLessons || [])
    );
  }, [enrollment.progress?.completedLessons]);

  const handleToggleLesson = async (lessonId: string, isCompleted: boolean) => {
    if (isUpdatingProgress) return;

    setIsUpdatingProgress(true);
    try {
      const response = await fetch("/api/progress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseSlug: course.slug,
          lessonId,
          completed: !isCompleted,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Update local state
        const newSet = new Set(localCompletedLessons);
        if (!isCompleted) {
          newSet.add(lessonId);
        } else {
          newSet.delete(lessonId);
        }
        setLocalCompletedLessons(newSet);

        // Refresh the page to update progress percentage
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    setMessageError(null);
    setMessageSuccess(false);

    try {
      // Get instructor email - for now, we'll use a placeholder
      // In a real app, you'd fetch this from the course or user data
      const instructorEmail = "instructor@example.com"; // This should come from course data

      const response = await fetch("/api/messages/instructor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseSlug: course.slug,
          message: messageText,
          instructorEmail: instructorEmail,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMessageSuccess(true);
        setMessageText("");
        setTimeout(() => {
          setShowMessageModal(false);
          setMessageSuccess(false);
        }, 2000);
      } else {
        setMessageError(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessageError("Failed to send message. Please try again.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleDownloadCertificate = async (format: "pdf" | "png" = "pdf") => {
    if (isDownloadingCertificate || progressPercentage < 100) return;

    setIsDownloadingCertificate(true);
    try {
      const response = await fetch(
        `/api/certificates/${course.slug}/download?format=${format}`
      );
      const result = await response.json();

      if (result.success) {
        // Create download link
        const link = document.createElement("a");
        link.href = result.data.downloadUrl;
        link.download = `certificate-${course.slug}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(result.error || "Failed to generate certificate");
      }
    } catch (error) {
      console.error("Failed to download certificate:", error);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setIsDownloadingCertificate(false);
    }
  };

  const handlePreviewCertificate = async () => {
    if (progressPercentage < 100) return;
    setShowCertificateModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!canSubmitFeedback || isSubmittingFeedback) return;
    setIsSubmittingFeedback(true);
    setFeedbackAlert(null);

    try {
      const response = await fetch("/api/enrollments/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseSlug: course.slug,
          rating: ratingValue,
          comment: feedbackComment,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setFeedbackState(result.data.feedback);
        setCourseRating({
          average: result.data.ratingAverage,
          count: result.data.ratingCount,
        });
        setFeedbackAlert({
          type: "success",
          text: "Thanks for sharing your feedback!",
        });
      } else {
        setFeedbackAlert({
          type: "error",
          text: result.error || "Failed to submit feedback",
        });
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      setFeedbackAlert({
        type: "error",
        text: "Failed to submit feedback. Please try again.",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Progress Banner */}
      <ProgressBanner
        courseTitle={course.title}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        progressPercentage={progressPercentage}
        courseSlug={course.slug}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Curriculum with Progress */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <BookOpen className="mr-2 text-purple-600" size={24} />
                Course Curriculum
              </h2>
              <div className="space-y-4">
                {course.modules.map((module, moduleIndex) => {
                  const moduleLessonsCompleted = module.lessons.filter(
                    (_, lessonIndex) =>
                      completedLessonIds.has(`${moduleIndex}-${lessonIndex}`)
                  ).length;
                  const moduleProgress = Math.round(
                    (moduleLessonsCompleted / module.lessons.length) * 100
                  );

                  return (
                    <details
                      key={moduleIndex}
                      className="border rounded-lg"
                      open={moduleIndex === 0}
                    >
                      <summary className="font-semibold text-lg p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <span>{module.title}</span>
                          {moduleProgress === 100 && (
                            <Award size={20} className="text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-purple-600 font-semibold">
                            {moduleLessonsCompleted}/{module.lessons.length}{" "}
                            completed
                          </span>
                        </div>
                      </summary>
                      <div className="p-4 border-t bg-gray-50">
                        {/* Module Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${moduleProgress}%` }}
                          />
                        </div>

                        <ul className="space-y-3">
                          {module.lessons.map((lesson, lessonIndex) => {
                            const lessonId = `${moduleIndex}-${lessonIndex}`;
                            const isCompleted =
                              completedLessonIds.has(lessonId);

                            return (
                              <li
                                key={lessonIndex}
                                className={`flex justify-between items-center p-3 rounded-md hover:bg-white transition-colors ${
                                  isCompleted ? "bg-green-50" : ""
                                }`}
                              >
                                <div className="flex items-center flex-1">
                                  <button
                                    onClick={() =>
                                      handleToggleLesson(lessonId, isCompleted)
                                    }
                                    disabled={isUpdatingProgress}
                                    className="mr-3 flex-shrink-0 hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={
                                      isCompleted
                                        ? "Click to uncheck"
                                        : "Click to check"
                                    }
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2
                                        size={20}
                                        className="text-green-500"
                                      />
                                    ) : (
                                      <Circle
                                        size={20}
                                        className="text-gray-400"
                                      />
                                    )}
                                  </button>
                                  <Link
                                    href={`/mycourses/${course.slug}/${moduleIndex}/${lessonIndex}`}
                                    className="flex items-center flex-1 hover:text-purple-600"
                                  >
                                    <span
                                      className={
                                        isCompleted
                                          ? "line-through text-gray-500"
                                          : ""
                                      }
                                    >
                                      {lesson.title}
                                    </span>
                                  </Link>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm text-gray-600 flex items-center">
                                    <Clock size={14} className="mr-1" />
                                    {lesson.duration}
                                  </span>

                                  <Link
                                    href={`/mycourses/${course.slug}/${moduleIndex}/${lessonIndex}`}
                                    aria-label={`Play lesson: ${lesson.title}`}
                                  >
                                    <PlayCircle
                                      size={20}
                                      className="text-purple-600 cursor-pointer hover:text-purple-700"
                                    />
                                  </Link>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>

            {/* Discussion Section */}
            <DiscussionSection courseSlug={course.slug} />

            {/* Student Feedback */}
            {course.testimonials && course.testimonials.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {course.testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className="border p-4 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center mb-2">
                        <Image
                          src={testimonial.studentImage}
                          alt={testimonial.studentName}
                          className="w-10 h-10 rounded-full mr-3"
                          width={40}
                          height={40}
                        />
                        <div>
                          <p className="font-semibold">
                            {testimonial.studentName}
                          </p>
                          <StarRating rating={testimonial.rating} />
                        </div>
                      </div>
                      <p className="text-gray-700 italic">
                        &quot;{testimonial.comment}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Achievement Card */}
            <AchievementCard
              progressPercentage={progressPercentage}
              completedLessons={completedLessons}
              totalLessons={totalLessons}
            />

            {/* Course Rating */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Course Rating</h3>
                <span className="text-sm text-gray-500">
                  {courseRating.count > 0
                    ? `${courseRating.count} review${
                        courseRating.count > 1 ? "s" : ""
                      }`
                    : "No reviews yet"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-4xl font-extrabold text-gray-900">
                  {courseRating.count > 0
                    ? courseRating.average.toFixed(1)
                    : "New"}
                </p>
                <div>
                  <StarRating rating={courseRating.average} />
                  <p className="text-sm text-gray-500 mt-1">
                    {courseRating.count > 0
                      ? "Average rating"
                      : "Be the first to review"}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructor Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-4">Your Instructor</h3>
              <div className="flex items-center mb-4">
                <Image
                  src={course.tutorImage}
                  alt={course.tutor}
                  className="w-16 h-16 rounded-full mr-4"
                  width={64}
                  height={64}
                />
                <div>
                  <p className="text-lg font-semibold">{course.tutor}</p>
                  <span className="text-gray-500 text-sm">Senior Engineer</span>
                </div>
              </div>
              {course.tutorBio && (
                <p className="text-gray-700 text-sm mb-4">{course.tutorBio}</p>
              )}
              {course.tutorSocials && course.tutorSocials.length > 0 && (
                <div className="flex space-x-3">
                  {course.tutorSocials.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-purple-600"
                      aria-label={social.platform}
                    >
                      <SocialIcon platform={social.platform} />
                    </a>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowMessageModal(true)}
                className="w-full mt-4 bg-purple-100 text-purple-600 py-2 rounded-md font-semibold hover:bg-purple-200 transition-colors flex items-center justify-center space-x-2"
              >
                <MessageSquare size={18} />
                <span>Message Instructor</span>
              </button>
            </div>

            {/* Course Stats */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-4">Course Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <BookOpen size={18} className="mr-2" />
                    Total Lessons
                  </span>
                  <span className="font-semibold">{totalLessons}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <Users size={18} className="mr-2" />
                    Students Enrolled
                  </span>
                  <span className="font-semibold">{course.students}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <CheckCircle2 size={18} className="mr-2" />
                    Your Progress
                  </span>
                  <span className="font-semibold text-purple-600">
                    {progressPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback Form */}
            {progressPercentage >= 100 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4">
                  Share Your Experience
                </h3>
                {feedbackState ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <StarRating rating={feedbackState.rating} />
                      <span className="font-semibold text-gray-800">
                        {feedbackState.rating}/5
                      </span>
                    </div>
                    {feedbackState.comment && (
                      <p className="text-gray-600 mb-3">
                        &ldquo;{feedbackState.comment}&rdquo;
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Submitted on{" "}
                      {new Date(
                        feedbackState.submittedAt || new Date()
                      ).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Rate this course
                      </p>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingValue(star)}
                            className="focus:outline-none"
                            aria-label={`Set rating to ${star}`}
                          >
                            <Star
                              size={28}
                              className={
                                star <= ratingValue
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Feedback (optional)
                      </label>
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        rows={4}
                        placeholder="What did you like about this course?"
                        className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {feedbackAlert && (
                      <div
                        className={`p-3 rounded-md text-sm ${
                          feedbackAlert.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {feedbackAlert.text}
                      </div>
                    )}

                    <button
                      onClick={handleSubmitFeedback}
                      disabled={!canSubmitFeedback || isSubmittingFeedback}
                      className="w-full bg-purple-600 text-white py-2 rounded-md font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmittingFeedback ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        "Submit Review"
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Certificate Preview */}
            {progressPercentage === 100 && (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 p-6 rounded-lg shadow-sm">
                <div className="text-center">
                  <Award size={48} className="text-yellow-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Certificate Ready!
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Congratulations on completing the course!
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handlePreviewCertificate}
                      className="bg-yellow-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Eye size={18} />
                      <span>Preview Certificate</span>
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadCertificate("pdf")}
                        disabled={isDownloadingCertificate}
                        className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isDownloadingCertificate ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <FileDown size={16} />
                            <span>PDF</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDownloadCertificate("png")}
                        disabled={isDownloadingCertificate}
                        className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isDownloadingCertificate ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <FileDown size={16} />
                            <span>PNG</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Instructor Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Message Instructor
                </h3>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageText("");
                    setMessageError(null);
                    setMessageSuccess(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course: {course.title}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor: {course.tutor}
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message to the instructor..."
                  className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
                  rows={6}
                  disabled={isSendingMessage}
                />
              </div>

              {messageError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {messageError}
                </div>
              )}

              {messageSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                  Message sent successfully!
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageText("");
                    setMessageError(null);
                    setMessageSuccess(false);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={isSendingMessage}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSendingMessage}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSendingMessage ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare size={16} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Certificate Preview
                </h3>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Certificate Design */}
              <div className="bg-gradient-to-br from-yellow-50 via-white to-purple-50 border-4 border-yellow-400 rounded-lg p-12 text-center shadow-2xl">
                <div className="mb-8">
                  <div className="inline-block bg-gradient-to-r from-purple-600 to-yellow-500 text-transparent bg-clip-text">
                    <h1 className="text-5xl font-bold mb-2">CERTIFICATE</h1>
                    <h2 className="text-3xl font-semibold">OF COMPLETION</h2>
                  </div>
                </div>

                <div className="my-8">
                  <p className="text-gray-600 text-lg mb-4">
                    This is to certify that
                  </p>
                  <div className="border-b-2 border-purple-600 border-dashed w-3/4 mx-auto mb-4"></div>
                  <h3 className="text-4xl font-bold text-purple-700 mb-4">
                    {session?.user?.name || "Student Name"}
                  </h3>
                  <div className="border-b-2 border-purple-600 border-dashed w-3/4 mx-auto mb-4"></div>
                </div>

                <p className="text-gray-700 text-lg mb-2">
                  has successfully completed the course
                </p>
                <h4 className="text-2xl font-bold text-purple-600 mb-8">
                  {course.title}
                </h4>

                <div className="grid grid-cols-2 gap-8 mt-8 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Instructor</p>
                    <p className="font-semibold">{course.tutor}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Completion Date</p>
                    <p className="font-semibold">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-12 flex justify-between items-end">
                  <div className="text-center">
                    <div className="border-t-2 border-gray-400 w-32 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">
                      Instructor Signature
                    </p>
                  </div>
                  <div className="text-center">
                    <Award size={48} className="text-yellow-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Certificate ID</p>
                    <p className="text-xs font-mono">
                      CERT-{course.slug.toUpperCase()}-
                      {Date.now().toString().slice(-6)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-gray-400 w-32 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Date</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownloadCertificate("pdf");
                    setShowCertificateModal(false);
                  }}
                  disabled={isDownloadingCertificate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isDownloadingCertificate ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FileDown size={16} />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    handleDownloadCertificate("png");
                    setShowCertificateModal(false);
                  }}
                  disabled={isDownloadingCertificate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isDownloadingCertificate ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FileDown size={16} />
                      <span>Download PNG</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrolledCourseClient;
