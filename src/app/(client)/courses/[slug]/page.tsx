"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  Facebook,
  Youtube,
  Globe,
  Award,
  ShieldCheck,
  MonitorPlay,
  FileText,
  HelpCircle,
} from "lucide-react";
import { Course } from "@/data/courses";
import Link from "next/link";

// --- HELPER FUNCTIONS ---
const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;

  // Handle youtu.be format
  if (url.includes("youtu.be/")) {
    const match = url.match(/youtu\.be\/([^?&]+)/);
    return match ? match[1] : null;
  }

  // Handle youtube.com format
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/v\/)([^?&]+)/
  );
  return match ? match[1] : null;
};

// --- HELPER COMPONENTS ---
const SocialIcon = ({ platform }: { platform: string }) => {
  if (platform === "linkedin") return <Linkedin size={20} />;
  if (platform === "twitter") return <Twitter size={20} />;
  if (platform === "github") return <Github size={20} />;
  if (platform === "facebook") return <Facebook size={20} />;
  if (platform === "youtube") return <Youtube size={20} />;
  return <Globe size={20} />;
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

// --- MAIN COMPONENT ---
type CourseLesson = Course["modules"][number]["lessons"][number];

const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

const resolveLessonVideoUrl = (lesson: CourseLesson) => {
  if (lesson.videoUrl) {
    return lesson.videoUrl;
  }
  if (lesson.cloudinaryPublicId && cloudinaryCloudName) {
    return `https://res.cloudinary.com/${cloudinaryCloudName}/video/upload/${lesson.cloudinaryPublicId}`;
  }
  return null;
};

const CourseDetailsPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModuleIndex, setOpenModuleIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<{
    lesson: CourseLesson;
    moduleTitle: string;
  } | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${slug}`);
        const result = await response.json();
        if (result.success) {
          setCourse(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-red-600">Course not found</p>
      </div>
    );
  }

  const isFreeCourse =
    course.pricingType === "free" ||
    course.price?.toLowerCase() === "free" ||
    course.price === "$0";
  const ratingAverage = course.ratingAverage ?? 0;
  const ratingCount = course.ratingCount ?? 0;

  // Calculate total lessons
  const totalLessons = course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );

  const defaultFaqs = [
    {
      question: "এই কোর্সটি কার জন্য উপযুক্ত?",
      answer:
        "যারা ডিজাইন সম্পর্কে কিছুই জানেন না কিন্তু UI/UX শিখে ক্যারিয়ার শুরু করতে চান—এটা তাদের জন্য পারফেক্ট।",
    },
  ];
  const faqs =
    course.faqs && course.faqs.length > 0 ? course.faqs : defaultFaqs;

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* --- Hero Section --- */}
      <div className="bg-gradient-to-r from-purple-600  to-purple-800 pt-20 text-white shadow-sm">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Title, Info, Mentor */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 text-xs font-bold tracking-wider text-purple-900 uppercase bg-yellow-400 rounded-full">
                  Best Seller
                </span>
                <span className="px-3 py-1 text-xs font-bold tracking-wider text-white uppercase bg-purple-500/30 rounded-full border border-purple-400">
                  Level 1: Beginner
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl text-white font-extrabold mb-4 leading-tight">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <span
                  className={`px-4 py-1.5 rounded-full border ${
                    isFreeCourse
                      ? "border-green-300/60 text-green-100 bg-green-500/10"
                      : "border-purple-300/50 text-yellow-200 bg-yellow-500/10"
                  }`}
                >
                  {isFreeCourse ? "Free Course" : "Paid Course"}
                </span>
                <div className="flex items-center gap-2 text-yellow-300">
                  <StarRating rating={ratingAverage} />
                  <span className="font-semibold">
                    {ratingCount > 0 ? ratingAverage.toFixed(1) : "New"}
                  </span>
                  {ratingCount > 0 && (
                    <span className="text-purple-100">
                      ({ratingCount} ratings)
                    </span>
                  )}
                </div>
              </div>
              <div
                className="prose max-w-none text-gray-200 leading-relaxed prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700 prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-purple-600 prose-blockquote:pl-4 prose-blockquote:italic"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />

              <div className="flex flex-wrap items-center gap-6 mb-8 text-purple-50">
                <div className="flex items-center">
                  <Image
                    src={course.tutorImage}
                    alt={course.tutor}
                    className="w-10 h-10 rounded-full mr-3 border-2 border-purple-400"
                    width={40}
                    height={40}
                  />
                  <div>
                    <span className="text-purple-300 text-xs uppercase tracking-wide block">
                      Created by
                    </span>
                    <p className="text-sm font-bold text-white">
                      {course.tutor}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-purple-500"></div>
                <div className="flex items-center space-x-2">
                  <MonitorPlay size={20} className="text-yellow-400" />
                  <span className="font-medium">{totalLessons} Lessons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users size={20} className="text-yellow-400" />
                  <span className="font-medium">
                    {course.students} Students
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-purple-200">
                <ShieldCheck size={16} />
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Right Column: Enroll Card */}
            <div className="lg:col-span-1 row-start-1 lg:row-start-auto relative z-10">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-100 sticky top-6">
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    fill
                    priority
                  />
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                    <PlayCircle
                      size={48}
                      className="text-white drop-shadow-lg"
                    />
                  </div>
                </div>

                <div className="p-6 text-gray-800">
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {isFreeCourse ? "Free" : course.price}
                    </span>
                  </div>

                  <Link
                    href={`/courses/enroll/${course.slug}`}
                    className="w-full bg-purple-600 text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-purple-700 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-purple-200 mb-4 flex justify-center items-center gap-2"
                  >
                    {isFreeCourse ? "Start for Free" : "Enroll Now"}
                  </Link>

                  <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
                    <Award size={14} className="text-purple-600" /> 30-Day
                    Money-Back Guarantee
                  </p>

                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                    <h4 className="font-bold text-sm text-gray-900">
                      This course includes:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <MonitorPlay size={16} className="text-purple-500" />{" "}
                        {totalLessons} recorded video lectures
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText size={16} className="text-purple-500" /> 10+
                        Downloadable resources
                      </li>
                      <li className="flex items-center gap-2">
                        <Globe size={16} className="text-purple-500" /> Full
                        lifetime access
                      </li>
                      <li className="flex items-center gap-2">
                        <MonitorPlay size={16} className="text-purple-500" />{" "}
                        Access on mobile and TV
                      </li>
                      <li className="flex items-center gap-2">
                        <Award size={16} className="text-purple-500" />{" "}
                        Certificate of completion
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="container mx-auto px-4 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-10">
            {/* --- About Section --- */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <BookOpen className="text-purple-600" size={24} /> About this
                course
              </h2>
              <div
                className="prose max-w-none text-gray-700 leading-relaxed prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700 prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-purple-600 prose-blockquote:pl-4 prose-blockquote:italic"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </div>

            {/* --- Module Section --- */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MonitorPlay className="text-purple-600" size={24} /> Course
                  Curriculum
                </h2>
                <span className="text-sm text-gray-500 font-medium">
                  {course.modules.length} Modules • {totalLessons} Lessons
                </span>
              </div>

              <div className="space-y-4">
                {course.modules.map((module, index) => (
                  <div
                    key={index}
                    className="border rounded-xl overflow-hidden bg-white"
                  >
                    <button
                      onClick={() =>
                        setOpenModuleIndex(
                          openModuleIndex === index ? -1 : index
                        )
                      }
                      className={`w-full flex justify-between items-center p-4 text-left font-semibold transition-colors ${
                        openModuleIndex === index
                          ? "bg-purple-50 text-purple-900"
                          : "bg-white hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {openModuleIndex === index ? (
                          <ChevronUp size={20} className="text-purple-600" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                        <span className="flex-1">{module.title}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-normal hidden sm:block bg-gray-100 px-2 py-1 rounded">
                        {module.lessons.length} lessons
                      </span>
                    </button>

                    {/* Accordion Content */}
                    {openModuleIndex === index && (
                      <div className="p-4 border-t border-purple-100 bg-gray-50/50">
                        <ul className="space-y-3">
                          {module.lessons.map((lesson, i) => {
                            const isPublic = lesson.isPublic === true;
                            const resolvedVideoUrl =
                              resolveLessonVideoUrl(lesson);
                            const hasVideo = Boolean(resolvedVideoUrl);

                            return (
                              <li
                                key={i}
                                className={`flex justify-between items-center text-sm group p-2 rounded-lg transition-colors border ${
                                  isPublic
                                    ? "border-green-200 bg-green-50/50 hover:bg-green-50 cursor-pointer"
                                    : "border-transparent hover:border-purple-100 hover:bg-white"
                                }`}
                                onClick={() => {
                                  if (isPublic && hasVideo) {
                                    setSelectedLesson({
                                      lesson: lesson,
                                      moduleTitle: module.title,
                                    });
                                  }
                                }}
                              >
                                <span className="flex items-center text-gray-700 group-hover:text-purple-700 font-medium flex-1">
                                  <PlayCircle
                                    size={16}
                                    className={`mr-3 ${
                                      isPublic
                                        ? "text-green-600"
                                        : "text-purple-500"
                                    }`}
                                  />
                                  {lesson.title}
                                  {isPublic && (
                                    <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                                      FREE
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center bg-white px-2 py-1 rounded border">
                                  <Clock size={12} className="mr-1" />
                                  {lesson.duration}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* --- FAQ Section --- */}
            {faqs.length > 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  <HelpCircle className="text-purple-600" size={24} /> Common
                  Questions (FAQ)
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setOpenFaqIndex(openFaqIndex === index ? -1 : index)
                        }
                        className="w-full flex justify-between items-center p-4 text-left font-semibold bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-800">{faq.question}</span>
                        {openFaqIndex === index ? (
                          <ChevronUp
                            size={20}
                            className="text-gray-400 flex-shrink-0 ml-2"
                          />
                        ) : (
                          <ChevronDown
                            size={20}
                            className="text-gray-400 flex-shrink-0 ml-2"
                          />
                        )}
                      </button>
                      {openFaqIndex === index && (
                        <div className="p-4 border-t bg-purple-50/30 text-gray-600 leading-relaxed text-sm">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- Student Feedback Section --- */}
            {course.testimonials && course.testimonials.length > 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  <MessageCircle className="text-purple-600" size={24} />{" "}
                  Student Feedback
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {course.testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className="border p-6 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md hover:border-purple-200 transition-all"
                    >
                      <div className="flex items-center mb-4">
                        <Image
                          src={testimonial.studentImage}
                          alt={testimonial.studentName}
                          className="w-12 h-12 rounded-full mr-4 bg-purple-100 border-2 border-white shadow-sm"
                          width={48}
                          height={48}
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {testimonial.studentName}
                          </p>
                          <StarRating rating={testimonial.rating} />
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm italic leading-relaxed relative">
                        <span className="text-4xl text-purple-200 absolute -top-4 -left-2 font-serif">
                          &quot;
                        </span>
                        {testimonial.comment}
                        <span className="text-4xl text-purple-200 absolute -bottom-6 -right-2 font-serif leading-none">
                          &quot;
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- Success Story Section --- */}
            {course.successStories && course.successStories.length > 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  <Award className="text-purple-600" size={24} /> Success
                  Stories
                </h2>
                {course.successStories.map((story, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-bl-full opacity-50"></div>
                    <Image
                      src={story.studentImage}
                      alt={story.studentName}
                      className="w-16 h-16 rounded-full bg-purple-200 flex-shrink-0 border-4 border-white shadow-sm z-10"
                      width={64}
                      height={64}
                    />
                    <div className="z-10">
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className="text-lg font-bold text-gray-900">
                          {story.studentName}
                        </p>
                        <span className="text-xs font-bold text-purple-600 bg-white px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Course Graduate
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        &quot;{story.story}&quot;
                      </p>
                      {story.projectUrl && (
                        <a
                          href={story.projectUrl}
                          className="inline-flex items-center text-sm font-bold text-purple-700 hover:text-purple-900 hover:underline"
                        >
                          View their project{" "}
                          <PlayCircle size={14} className="ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- Right Sidebar: Mentor Section --- */}
          <div className="lg:col-span-1 mt-12 lg:mt-0 space-y-6">
            {/* Mentor Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Meet Your Mentor
              </h2>
              <div className="flex items-center mb-4">
                <Image
                  src={course.tutorImage}
                  alt={course.tutor}
                  className="w-16 h-16 rounded-full mr-4 border-2 border-purple-100"
                  width={64}
                  height={64}
                />
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {course.tutor}
                  </p>
                </div>
              </div>
              {course.tutorBio && (
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {course.tutorBio}
                </p>
              )}
              {course.tutorSocials && course.tutorSocials.length > 0 && (
                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                  {course.tutorSocials.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-purple-600 transition-colors p-2 hover:bg-purple-50 rounded-full"
                      aria-label={social.platform}
                    >
                      <SocialIcon platform={social.platform} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Support Box */}
            <div className="bg-purple-900 text-white p-6 rounded-2xl shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-800 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-800 rounded-full blur-2xl -ml-10 -mb-10"></div>

              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <MessageCircle size={18} /> Need Help?
                </h3>
                <p className="text-purple-200 text-sm mb-6 opacity-90">
                  Contact our support team for any assistance.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center group cursor-pointer bg-purple-800/50 p-3 rounded-lg hover:bg-purple-800 transition-colors border border-purple-700">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3 shadow-lg">
                      <MessageCircle size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-300 uppercase tracking-wider">
                        WhatsApp Support
                      </p>
                      <p className="font-bold text-sm">Contact Us</p>
                    </div>
                  </div>

                  <div className="flex items-center group cursor-pointer bg-purple-800/50 p-3 rounded-lg hover:bg-purple-800 transition-colors border border-purple-700">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3 shadow-lg">
                      <Mail size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-300 uppercase tracking-wider">
                        Email Us
                      </p>
                      <p className="font-bold text-xs truncate">
                        support@example.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      {selectedLesson && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLesson(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-50 to-white">
              <div className="flex-1">
                <p className="text-sm text-green-600 font-medium mb-1">
                  {selectedLesson.moduleTitle}
                </p>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedLesson.lesson.title}
                </h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-medium">
                    FREE PREVIEW
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock size={14} />
                    {selectedLesson.lesson.duration}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Video Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {(() => {
                  const resolvedVideoUrl = resolveLessonVideoUrl(
                    selectedLesson.lesson
                  );
                  if (
                    selectedLesson.lesson.videoType === "youtube" &&
                    selectedLesson.lesson.videoUrl
                  ) {
                    const videoId = extractYouTubeId(
                      selectedLesson.lesson.videoUrl!
                    );
                    return videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={selectedLesson.lesson.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white">
                          <PlayCircle
                            size={48}
                            className="mx-auto opacity-50 mb-2"
                          />
                          <p className="text-sm">Invalid YouTube URL</p>
                        </div>
                      </div>
                    );
                  }

                  if (resolvedVideoUrl) {
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
                        <PlayCircle
                          size={48}
                          className="mx-auto opacity-50 mb-2"
                        />
                        <p className="text-sm">No video available</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  This is a free preview lesson. Enroll in the course to access
                  all lessons.
                </p>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;
