import React from "react";
import Image from "next/image";
import { courses } from "@/data/courses";
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
  // MessageSquare,
  Award,
  // Download,
  // Share2,
} from "lucide-react";
import Link from "next/link";
import DiscussionSection from "./DiscussionSection";
import ProgressBanner from "./ProgressBanner";
import AchievementCard from "./AchievementCard";

// Generate static params
export async function generateStaticParams() {
  return courses.map((course) => ({
    slug: course.slug,
  }));
}

export const dynamicParams = false;

// Helper Components
const SocialIcon = ({ platform }: { platform: string }) => {
  if (platform === "linkedin") return <Linkedin size={20} />;
  if (platform === "twitter") return <Twitter size={20} />;
  if (platform === "github") return <Github size={20} />;
  return null;
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }
      />
    ))}
  </div>
);

const EnrolledCoursePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const course = courses.find((course) => course.slug === slug);

  if (!course) {
    return <div>Course not found</div>;
  }

  // Mock data for enrolled student (in production, fetch from API/database)
  const totalLessons = course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );
  const completedLessons = 8; // Mock completed lessons
  const progressPercentage = Math.round(
    (completedLessons / totalLessons) * 100
  );

  // Mock completed lesson IDs (in production, fetch from user progress)
  const completedLessonIds = new Set([
    "0-0",
    "0-1",
    "0-2",
    "0-3", // Module 1 completed
    "1-0",
    "1-1",
    "1-2",
    "1-3", // Module 2 completed
  ]);

  // Mock discussion data
  const discussions = [
    {
      id: 1,
      userName: "Alex Rodriguez",
      userImage: "/images/users/user15.jpg",
      timeAgo: "2 hours ago",
      text: "Great explanation on React Hooks! Quick question: when should I use useCallback vs useMemo?",
      likes: 12,
    },
    {
      id: 2,
      userName: "Maria Garcia",
      userImage: "/images/users/user16.jpg",
      timeAgo: "5 hours ago",
      text: "Just finished Module 2! The DOM manipulation exercises were really helpful. Thanks John!",
      likes: 8,
    },
    {
      id: 3,
      userName: "James Wilson",
      userImage: "/images/users/user17.jpg",
      timeAgo: "1 day ago",
      text: "Is anyone else having trouble with the final project deployment? Getting an error with environment variables.",
      likes: 5,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Progress Banner */}
      <ProgressBanner
        courseTitle={course.title}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        progressPercentage={progressPercentage}
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
                                <Link
                                  href={`/mycourses/${slug}/${moduleIndex}/${lessonIndex}`}
                                  className="flex items-center flex-1 hover:text-purple-600"
                                >
                                  {isCompleted ? (
                                    <CheckCircle2
                                      size={20}
                                      className="mr-3 text-green-500 flex-shrink-0"
                                    />
                                  ) : (
                                    <Circle
                                      size={20}
                                      className="mr-3 text-gray-400 flex-shrink-0"
                                    />
                                  )}
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
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm text-gray-600 flex items-center">
                                    <Clock size={14} className="mr-1" />
                                    {lesson.duration}
                                  </span>

                                  {/* --- THIS IS THE FIX --- */}
                                  <Link
                                    href={`/mycourses/${slug}/${moduleIndex}/${lessonIndex}`}
                                    aria-label={`Play lesson: ${lesson.title}`}
                                  >
                                    <PlayCircle
                                      size={20}
                                      className="text-purple-600 cursor-pointer hover:text-purple-700"
                                    />
                                  </Link>
                                  {/* --- END OF FIX --- */}
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
            <DiscussionSection discussions={discussions} />

            {/* Student Feedback */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {course.testimonials.map((testimonial, index) => (
                  <div key={index} className="border p-4 rounded-lg bg-gray-50">
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
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Achievement Card */}
            <AchievementCard
              progressPercentage={progressPercentage}
              completedLessons={completedLessons}
              totalLessons={totalLessons}
            />

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
              <p className="text-gray-700 text-sm mb-4">{course.tutorBio}</p>
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
              <button className="w-full mt-4 bg-purple-100 text-purple-600 py-2 rounded-md font-semibold hover:bg-purple-200 transition-colors">
                Message Instructor
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
                  <span className="font-semibold">{course.lessons}</span>
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
                  <button className="bg-yellow-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-yellow-600 transition-colors">
                    Download Certificate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrolledCoursePage;
