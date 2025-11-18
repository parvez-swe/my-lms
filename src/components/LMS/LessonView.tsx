"use client";

import { courses } from "@/data/courses";
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
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

interface Reply {
  id: number;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  replies: Reply[];
}

// Define prop types for LessonView
interface LessonViewProps {
  course: (typeof courses)[0];
  moduleIndex: number;
  lessonIndex: number;
  lesson: {
    title: string;
    duration: string;
    resources?: { name: string; url: string }[];
  };
  completedLessonIds: Set<string>;
  prevLessonLink: string | null;
  nextLessonLink: string | null;
  comments: Comment[];
  slug: string;
}

export default function LessonView({
  course,
  moduleIndex,
  lessonIndex,
  lesson,
  completedLessonIds,
  prevLessonLink,
  nextLessonLink,
  comments,
  slug,
}: LessonViewProps) {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

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
          <button className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors">
            <CheckCircle2 size={18} />
            <span>Mark as Complete</span>
          </button>
        </div>

        {/* Video Player */}
        <div className="p-6">
          <div className="aspect-video bg-gray-900 rounded-lg shadow-lg relative flex items-center justify-center">
            {/* Mock Video Player */}
            <PlayCircle size={80} className="text-white opacity-30" />
            <div className="absolute bottom-4 left-4 p-2 bg-black/50 rounded">
              <span className="text-white text-lg font-semibold">
                Video: {lesson.title}
              </span>
            </div>
            {/* In a real app, you would embed a Vimeo or YouTube player here */}
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

          {/* Comments Section */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <MessageCircle className="mr-2 text-purple-600" />
              Comments ({comments.length})
            </h2>

            {/* New Comment Form */}
            <div className="flex items-start space-x-4 mb-8">
              <img
                src="/images/profile.jpg" // Assuming current user's profile
                alt="Your avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <textarea
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-shadow"
                  rows={3}
                  placeholder="Add a public comment..."
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
                    Post Comment
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Comments */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id}>
                  <div className="flex items-start space-x-4">
                    <img
                      src={comment.avatar}
                      alt={`${comment.author}'s avatar`}
                      className="w-12 h-12 rounded-full object-cover"
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
                    </div>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="ml-16 mt-4 flex items-start space-x-4">
                      <img
                        src="/images/profile.jpg"
                        alt="Your avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <textarea
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                          rows={2}
                          placeholder={`Reply to ${comment.author}...`}
                        ></textarea>
                        <div className="flex justify-end mt-2">
                          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700">
                            Post Reply
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
                          <img
                            src={reply.avatar}
                            alt={`${reply.author}'s avatar`}
                            className="w-10 h-10 rounded-full object-cover"
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
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            {prevLessonLink ? (
              <Link
                href={prevLessonLink}
                className="flex items-center space-x-2 bg-gray-200 text-gray-800 px-5 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft size={18} />
                <span>Previous Lesson</span>
              </Link>
            ) : (
              <div /> // Placeholder to keep "Next" button on the right
            )}

            {nextLessonLink ? (
              <Link
                href={nextLessonLink}
                className="flex items-center space-x-2 bg-purple-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                <span>Next Lesson</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <Link
                href={`/courses/enrolled/${slug}`} // Link back to course page when done
                className="flex items-center space-x-2 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <span>Finish Course</span>
                <CheckCircle2 size={18} />
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
