"use client";

import { Course } from "@/data/courses";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  BookOpen,
  MessageCircle,
  CornerDownRight,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import QuizView from "@/components/LMS/QuizView";

interface Reply {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  replies: Reply[];
}

// Define prop types for LessonView
interface LessonViewProps {
  course: Course;
  moduleIndex: number;
  lessonIndex: number;
  lesson: {
    title: string;
    duration: string;
    videoType?: "youtube" | "cloudinary" | "url";
    videoUrl?: string;
    cloudinaryPublicId?: string;
    resources?: { name: string; url: string }[];
  };
  completedLessonIds: Set<string>;
  prevLessonLink: string | null;
  nextLessonLink: string | null;
  slug: string;
  onToggleComplete?: (lessonId: string, completed: boolean) => void;
  onQuizPassed?: () => void;
}

export default function LessonView({
  course,
  moduleIndex,
  lessonIndex,
  lesson,
  completedLessonIds,
  prevLessonLink,
  nextLessonLink,
  slug,
  onToggleComplete,
  onQuizPassed,
}: LessonViewProps) {
  const { data: session } = useSession();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState<{
    [key: string]: boolean;
  }>({});

  const lessonId = `${moduleIndex}-${lessonIndex}`;
  const isCompleted = completedLessonIds.has(lessonId);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoadingComments(true);
        const response = await fetch(
          `/api/lessons/comments?courseSlug=${slug}&moduleIndex=${moduleIndex}&lessonIndex=${lessonIndex}`
        );
        const result = await response.json();
        if (result.success) {
          setComments(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchComments();
  }, [slug, moduleIndex, lessonIndex]);

  const handlePostComment = async () => {
    if (!newComment.trim() || isSubmittingComment || !session?.user) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch("/api/lessons/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseSlug: slug,
          moduleIndex,
          lessonIndex,
          text: newComment,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setComments([result.data, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handlePostReply = async (commentId: string) => {
    const text = replyText[commentId];
    if (!text?.trim() || isSubmittingReply[commentId] || !session?.user) return;

    setIsSubmittingReply((prev) => ({ ...prev, [commentId]: true }));
    try {
      const response = await fetch("/api/lessons/comments/replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId,
          text,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setComments(
          comments.map((comment) =>
            comment.id === commentId
              ? { ...comment, replies: [...comment.replies, result.data] }
              : comment
          )
        );
        setReplyText((prev) => ({ ...prev, [commentId]: "" }));
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Failed to post reply:", error);
    } finally {
      setIsSubmittingReply((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleToggleComplete = () => {
    if (onToggleComplete) {
      onToggleComplete(lessonId, isCompleted);
    }
  };

  const isYouTubeUrl = (url: string) =>
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i.test(
      url
    );

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;

    const patterns = [
      /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([A-Za-z0-9_-]{11})/,
      /(?:youtube-nocookie\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    try {
      const urlObj = new URL(url);
      const id = urlObj.searchParams.get("v");
      if (id && id.length === 11) {
        return id;
      }
    } catch {
      // Ignore invalid URL errors
    }

    return null;
  };

  const buildCloudinaryUrlFromPublicId = () => {
    if (!lesson.cloudinaryPublicId) return null;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return null;
    return `https://res.cloudinary.com/${cloudName}/video/upload/${lesson.cloudinaryPublicId}`;
  };

  const resolvedVideoUrl = lesson.videoUrl || buildCloudinaryUrlFromPublicId();

  const effectiveVideoType = (() => {
    if (lesson.videoType) {
      return lesson.videoType;
    }
    if (resolvedVideoUrl) {
      if (isYouTubeUrl(resolvedVideoUrl)) {
        return "youtube";
      }
      return "url";
    }
    return undefined;
  })();

  // Render video player
  const renderVideoPlayer = () => {
    if (effectiveVideoType === "youtube" && resolvedVideoUrl) {
      const videoId = extractYouTubeId(resolvedVideoUrl);
      if (videoId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lesson.title}
          />
        );
      } else {
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white px-4">
              <PlayCircle size={80} className="mx-auto opacity-30 mb-4" />
              <p className="text-lg font-semibold">Invalid YouTube link</p>
              <p className="text-sm opacity-75 mt-2">
                Please check the URL for this lesson&apos;s video.
              </p>
            </div>
          </div>
        );
      }
    } else if (resolvedVideoUrl) {
      return (
        <video
          src={resolvedVideoUrl}
          className="w-full h-full object-cover"
          controls
          autoPlay
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-white">
          <PlayCircle size={80} className="mx-auto opacity-30 mb-4" />
          <p className="text-lg font-semibold">No video available</p>
          <p className="text-sm opacity-75 mt-2">
            Video content will be available here
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* --- Sidebar --- */}
      <aside className="w-80 border-r bg-gray-50 flex-col fixed h-screen overflow-y-auto hidden lg:flex">
        <div className="p-4 border-b h-16 flex items-center">
          <Link
            href={`/mycourses/${slug}`}
            className="text-lg font-bold text-gray-800 hover:text-purple-600"
          >
            &larr; Back to Course
          </Link>
        </div>
        <nav className="flex-1 py-4">
          <span className="px-4 text-sm font-semibold text-gray-500 uppercase">
            {course.title}
          </span>
          <div className="space-y-2 mt-4">
            {course.modules.map((mod, modIdx) => (
              <div key={modIdx} className="px-2">
                <h3 className="px-3 py-2 text-sm font-semibold text-gray-700">
                  {mod.title}
                </h3>
                <ul className="space-y-1">
                  {mod.lessons.map((les, lesIdx) => {
                    const lessonId = `${modIdx}-${lesIdx}`;
                    const isCurrent =
                      modIdx === moduleIndex && lesIdx === lessonIndex;
                    const isCompleted = completedLessonIds.has(lessonId);

                    return (
                      <li key={lesIdx}>
                        <Link
                          href={`/mycourses/${slug}/${modIdx}/${lesIdx}`}
                          className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                            isCurrent
                              ? "bg-purple-100 text-purple-700 font-semibold"
                              : "text-gray-600 hover:bg-gray-200" // <-- This line was corrected
                          }`}
                        >
                          {isCurrent ? (
                            <PlayCircle
                              size={18}
                              className="text-purple-600 flex-shrink-0"
                            />
                          ) : isCompleted ? (
                            <CheckCircle2
                              size={18}
                              className="text-green-500 flex-shrink-0"
                            />
                          ) : (
                            <Circle
                              size={18}
                              className="text-gray-400 flex-shrink-0"
                            />
                          )}
                          <span className="flex-1">{les.title}</span>
                          <span className="text-xs text-gray-500">
                            {les.duration}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 lg:pl-80">
        {/* Top Bar */}
        <div className="h-16 border-b flex items-center justify-between px-6 bg-white sticky top-0 z-10">
          <h1 className="text-xl font-semibold truncate">{lesson.title}</h1>
          <button
            onClick={handleToggleComplete}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              isCompleted
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            <CheckCircle2
              size={18}
              className={isCompleted ? "fill-white" : ""}
            />
            <span>{isCompleted ? "Completed" : "Mark as Complete"}</span>
          </button>
        </div>

        {/* Video Player */}
        <div className="p-6">
          <div className="aspect-video bg-gray-900 rounded-lg shadow-lg relative overflow-hidden">
            {renderVideoPlayer()}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {prevLessonLink ? (
              <Link
                href={prevLessonLink}
                className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-5 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft size={18} />
                <span>Previous Lesson</span>
              </Link>
            ) : (
              <div className="h-0 md:h-auto" />
            )}

            {nextLessonLink ? (
              <Link
                href={nextLessonLink}
                className="flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                <span>Next Lesson</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <Link
                href={`/mycourses/${slug}`}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <span>Finish Course</span>
                <CheckCircle2 size={18} />
              </Link>
            )}
          </div>

          {/* Lesson Content */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <BookOpen className="mr-2 text-purple-600" />
              About this lesson
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This is where the text content, code snippets, or images for the
              lesson &quot;{lesson.title}&quot; would go. For now, this is a
              placeholder.
            </p>
            <p className="text-gray-700 mt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              euismod, nisl nec ultricies lacinia, nisl nisl aliquet nisl, nec
              lacinia nisl nisl sit amet nisl.
            </p>
          </div>

          {/* --- [NEW] Downloadable Resources --- */}
          {lesson.resources && lesson.resources.length > 0 && (
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Download className="mr-2 text-purple-600" />
                Downloadable Resources
              </h2>
              <div className="space-y-3">
                {lesson.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border"
                  >
                    <FileText
                      className="text-gray-600 flex-shrink-0"
                      size={20}
                    />
                    <span className="font-medium text-purple-700 hover:underline">
                      {resource.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
          {/* --- End of Downloadable Resources --- */}

          {/* Quiz Section */}
          {onQuizPassed && (
            <QuizView
              courseSlug={slug}
              moduleIndex={moduleIndex}
              lessonIndex={lessonIndex}
              lessonId={lessonId}
              onQuizPassed={onQuizPassed}
            />
          )}

          {/* Comments Section */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <MessageCircle className="mr-2 text-purple-600" />
              Comments ({comments.length})
            </h2>

            {/* New Comment Form */}
            {session?.user && (
              <div className="flex items-start space-x-4 mb-8">
                <Image
                  src={session.user.image || "/images/profile.jpg"}
                  alt="Your avatar"
                  className="w-12 h-12 rounded-full object-cover"
                  width={48}
                  height={48}
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-shadow"
                    rows={3}
                    placeholder="Add a public comment..."
                    disabled={isSubmittingComment}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handlePostComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSubmittingComment ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <span>Post Comment</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Comments */}
            {isLoadingComments ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 size={24} className="animate-spin text-purple-600" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id}>
                    <div className="flex items-start space-x-4">
                      <Image
                        src={comment.avatar}
                        alt={`${comment.author}'s avatar`}
                        className="w-12 h-12 rounded-full object-cover"
                        width={48}
                        height={48}
                      />
                      <div className="flex-1">
                        <div className="flex items-baseline space-x-2">
                          <p className="font-semibold text-gray-800">
                            {comment.author}
                          </p>
                          <p className="text-xs text-gray-500">
                            {comment.timestamp}
                          </p>
                        </div>
                        <p className="text-gray-700 mt-1">{comment.text}</p>
                        {session?.user && (
                          <button
                            onClick={() =>
                              setReplyingTo(
                                replyingTo === comment.id ? null : comment.id
                              )
                            }
                            className="text-xs text-purple-600 font-semibold mt-2 flex items-center hover:text-purple-800"
                          >
                            <CornerDownRight size={14} className="mr-1" />
                            Reply
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && session?.user && (
                      <div className="ml-16 mt-4 flex items-start space-x-4">
                        <Image
                          src={session.user.image || "/images/profile.jpg"}
                          alt="Your avatar"
                          className="w-10 h-10 rounded-full object-cover"
                          width={40}
                          height={40}
                        />
                        <div className="flex-1">
                          <textarea
                            value={replyText[comment.id] || ""}
                            onChange={(e) =>
                              setReplyText((prev) => ({
                                ...prev,
                                [comment.id]: e.target.value,
                              }))
                            }
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                            rows={2}
                            placeholder={`Reply to ${comment.author}...`}
                            disabled={isSubmittingReply[comment.id]}
                          />
                          <div className="flex justify-end mt-2 space-x-2">
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText((prev) => ({
                                  ...prev,
                                  [comment.id]: "",
                                }));
                              }}
                              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handlePostReply(comment.id)}
                              disabled={
                                !replyText[comment.id]?.trim() ||
                                isSubmittingReply[comment.id]
                              }
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                              {isSubmittingReply[comment.id] ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" />
                                  <span>Posting...</span>
                                </>
                              ) : (
                                <span>Post Reply</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-16 mt-6 space-y-6 border-l-2 border-gray-200 pl-6">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="flex items-start space-x-4"
                          >
                            <Image
                              src={reply.avatar}
                              alt={`${reply.author}'s avatar`}
                              className="w-10 h-10 rounded-full object-cover"
                              width={40}
                              height={40}
                            />
                            <div className="flex-1">
                              <div className="flex items-baseline space-x-2">
                                <p className="font-semibold text-gray-800">
                                  {reply.author}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {reply.timestamp}
                                </p>
                              </div>
                              <p className="text-gray-700 mt-1">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
