"use client";

import { Award } from "lucide-react";

interface AchievementCardProps {
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
}

export default function AchievementCard({
  //   progressPercentage,
  completedLessons,
  totalLessons,
}: AchievementCardProps) {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Your Achievement</h3>
        <Award size={32} className="text-yellow-300" />
      </div>
      <p className="text-purple-100 mb-4">
        You&apos;re making great progress! Keep it up!
      </p>
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
        <p className="text-sm mb-2">Next Milestone</p>
        <p className="text-2xl font-bold">50% Complete</p>
        <p className="text-sm text-purple-100 mt-1">
          {Math.ceil(totalLessons * 0.5 - completedLessons)} lessons to go
        </p>
      </div>
    </div>
  );
}
