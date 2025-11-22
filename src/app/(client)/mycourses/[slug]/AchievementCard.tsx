"use client";

import { Award } from "lucide-react";

interface AchievementCardProps {
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
}

export default function AchievementCard({
  progressPercentage,
  completedLessons,
  totalLessons,
}: AchievementCardProps) {
  // Calculate next milestone
  const milestones = [25, 50, 75, 100];
  const nextMilestone =
    milestones.find((milestone) => progressPercentage < milestone) || 100;

  const lessonsForNextMilestone = Math.ceil(
    (totalLessons * nextMilestone) / 100
  );
  const lessonsRemaining = Math.max(
    0,
    lessonsForNextMilestone - completedLessons
  );

  const getMessage = () => {
    if (progressPercentage === 100) {
      return "Congratulations! You've completed the course!";
    } else if (progressPercentage >= 75) {
      return "You're almost there! Keep pushing!";
    } else if (progressPercentage >= 50) {
      return "You're making great progress! Keep it up!";
    } else if (progressPercentage >= 25) {
      return "Great start! You're on the right track!";
    } else {
      return "You're just getting started! Keep learning!";
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Your Achievement</h3>
        <Award size={32} className="text-yellow-300" />
      </div>
      <p className="text-purple-100 mb-4">{getMessage()}</p>
      {progressPercentage < 100 ? (
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <p className="text-sm mb-2">Next Milestone</p>
          <p className="text-2xl font-bold">{nextMilestone}% Complete</p>
          <p className="text-sm text-purple-100 mt-1">
            {lessonsRemaining} {lessonsRemaining === 1 ? "lesson" : "lessons"}{" "}
            to go
          </p>
        </div>
      ) : (
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <p className="text-sm mb-2">Course Status</p>
          <p className="text-2xl font-bold">100% Complete</p>
          <p className="text-sm text-purple-100 mt-1">
            All lessons completed! 🎉
          </p>
        </div>
      )}
    </div>
  );
}
