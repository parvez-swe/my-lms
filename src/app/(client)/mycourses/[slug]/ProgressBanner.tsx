"use client";

import { useState } from "react";
import { Download, Share2, Loader2, Check } from "lucide-react";

interface Module {
  lessons: Lesson[];
}

interface Lesson {
  resources?: Array<{ name: string; url: string }>;
}

interface ProgressBannerProps {
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  courseSlug: string;
}

export default function ProgressBanner({
  courseTitle,
  completedLessons,
  totalLessons,
  progressPercentage,
  courseSlug,
}: ProgressBannerProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/courses/${courseSlug}`;
    const text = `Check out this course: ${courseTitle}`;

    try {
      setIsSharing(true);
      setShareSuccess(false);

      // Try Web Share API first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: courseTitle,
          text: text,
          url: url,
        });
        setShareSuccess(true);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Share failed:", error);
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(url);
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 2000);
        } catch (clipboardError) {
          console.error("Clipboard copy failed:", clipboardError);
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadResources = async () => {
    setIsDownloading(true);
    try {
      // Collect all resources from all lessons
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/courses/${courseSlug}`);
      const result = await response.json();

      if (result.success) {
        const course = result.data;
        const resources: { name: string; url: string }[] = [];

        course.modules.forEach((module: Module) => {
          module.lessons.forEach((lesson: Lesson) => {
            if (lesson.resources && Array.isArray(lesson.resources)) {
              resources.push(...lesson.resources);
            }
          });
        });

        if (resources.length === 0) {
          alert("No resources available for this course.");
          return;
        }

        // Create a text file with all resource links
        const resourcesText = resources
          .map(
            (resource, index) =>
              `${index + 1}. ${resource.name}\n   ${resource.url}`
          )
          .join("\n\n");

        const blob = new Blob([resourcesText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${courseSlug}-resources.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to download resources:", error);
      alert("Failed to download resources. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{courseTitle}</h1>
            <p className="text-purple-100">
              Your Progress: {completedLessons} of {totalLessons} lessons
              completed
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="bg-white text-purple-600 px-4 py-2 rounded-md font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? (
                <Loader2 size={18} className="animate-spin" />
              ) : shareSuccess ? (
                <Check size={18} />
              ) : (
                <Share2 size={18} />
              )}
              <span>{shareSuccess ? "Copied!" : "Share"}</span>
            </button>
            <button
              onClick={handleDownloadResources}
              disabled={isDownloading}
              className="bg-purple-800 text-white px-4 py-2 rounded-md font-semibold hover:bg-purple-900 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              <span>Resources</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-purple-800 rounded-full h-3">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-sm text-purple-100 mt-2">
          {progressPercentage}% Complete
        </p>
      </div>
    </div>
  );
}
