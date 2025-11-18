"use client";

import { Download, Share2 } from "lucide-react";

interface ProgressBannerProps {
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
}

export default function ProgressBanner({
  courseTitle,
  completedLessons,
  totalLessons,
  progressPercentage,
}: ProgressBannerProps) {
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
            <button className="bg-white text-purple-600 px-4 py-2 rounded-md font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2">
              <Share2 size={18} />
              <span>Share</span>
            </button>
            <button className="bg-purple-800 text-white px-4 py-2 rounded-md font-semibold hover:bg-purple-900 transition-colors flex items-center space-x-2">
              <Download size={18} />
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
