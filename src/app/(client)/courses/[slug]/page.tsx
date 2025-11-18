import React from "react";
import Image from "next/image";
import { courses } from "@/data/courses"; // <-- Make sure this path is correct
import {
  Clock,
  Github,
  Linkedin,
  PlayCircle,
  Star,
  Twitter,
  Users,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

// This function generates the static pages at build time
export async function generateStaticParams() {
  return courses.map((course) => ({
    slug: course.slug,
  }));
}

// Helper component for Social Icons
const SocialIcon = ({ platform }: { platform: string }) => {
  if (platform === "linkedin") return <Linkedin size={20} />;
  if (platform === "twitter") return <Twitter size={20} />;
  if (platform === "github") return <Github size={20} />;
  return null;
};

// Helper component for Star Ratings
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

const CourseDetailsPage = ({ params }: { params: { slug: string } }) => {
  const course = courses.find((course) => course.slug === params.slug);

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="bg-gray-50">
      {/* --- Hero Section --- */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Title, Info, Mentor */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-gray-600 mb-6">
                {/* Short description (first sentence of full description) */}
                {course.description.split(".")[0]}.
              </p>
              <div className="flex items-center mb-6">
                <Image
                  src={course.tutorImage}
                  alt={course.tutor}
                  className="w-12 h-12 rounded-full mr-3"
                  width={48}
                  height={48}
                />
                <div>
                  <span className="text-gray-500 text-sm">Created by</span>
                  <p className="text-lg font-semibold">{course.tutor}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-gray-700">
                <div className="flex items-center space-x-2">
                  <BookOpen size={20} />
                  <span>{course.lessons} lessons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users size={20} />
                  <span>{course.students} students</span>
                </div>
              </div>
            </div>

            {/* Right Column: Enroll Card */}
            <div className="lg:col-span-1 row-start-1 lg:row-start-auto">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  className="w-full h-56 object-cover"
                  width={800}
                  height={450}
                  priority
                />
                <div className="p-6">
                  <span className="text-4xl font-bold text-purple-600 block mb-4">
                    {course.price}
                  </span>
                  <Link
                    href={`/courses/enroll/${course.slug}`}
                    className="block mb-4 text-center bg-purple-600 text-white w-full px-6 py-3 rounded-md text-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Enroll Now
                  </Link>
                  {/* <button className="bg-purple-600 text-white w-full px-6 py-3 rounded-md text-lg font-semibold hover:bg-purple-700 transition-colors">
                    Enroll Now
                  </button> */}
                  <p className="text-sm text-gray-500 text-center mt-3">
                    30-Day Money-Back Guarantee
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="container mx-auto px-4 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-12">
            {/* --- About Section --- */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold mb-4">About this course</h2>
              <p className="text-gray-700 leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* --- Module Section --- */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold mb-6">Course Curriculum</h2>
              <div className="space-y-4">
                {course.modules.map((module, index) => (
                  <details
                    key={index}
                    className="border rounded-lg"
                    open={index === 0} // Open the first module by default
                  >
                    <summary className="font-semibold text-lg p-4 cursor-pointer flex justify-between items-center">
                      {module.title}
                      <span className="text-sm text-gray-500">
                        {module.lessons.length} lessons
                      </span>
                    </summary>
                    <div className="p-4 border-t bg-gray-50">
                      <ul className="space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <li
                            key={lessonIndex}
                            className="flex justify-between items-center"
                          >
                            <span className="flex items-center">
                              <PlayCircle
                                size={18}
                                className="mr-2 text-purple-600"
                              />
                              {lesson.title}
                            </span>
                            <span className="text-sm text-gray-600 flex items-center">
                              <Clock size={14} className="mr-1" />
                              {lesson.duration}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* --- Student Feedback Section --- */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold mb-6">Student Feedback</h2>
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

            {/* --- Success Story Section --- */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold mb-6">Success Stories</h2>
              {course.successStories.map((story, index) => (
                <div
                  key={index}
                  className="bg-purple-50 border border-purple-200 p-6 rounded-lg"
                >
                  <div className="flex items-center mb-4">
                    <Image
                      src={story.studentImage}
                      alt={story.studentName}
                      className="w-14 h-14 rounded-full mr-4"
                      width={56}
                      height={56}
                    />
                    <div>
                      <p className="text-xl font-semibold">
                        {story.studentName}
                      </p>
                      <span className="text-purple-700">Course Graduate</span>
                    </div>
                  </div>
                  <p className="text-gray-800 leading-relaxed mb-4">
                    &quot;{story.story}&quot;
                  </p>
                  {story.projectUrl && (
                    <Link
                      href={story.projectUrl}
                      className="font-semibold text-purple-600 hover:underline"
                    >
                      View their project
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* --- Right Sidebar: Mentor Section --- */}
          <div className="lg:col-span-1 mt-12 lg:mt-0">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-8">
              <h2 className="text-2xl font-bold mb-4">Meet Your Mentor</h2>
              <div className="flex items-center mb-4">
                <Image
                  src={course.tutorImage}
                  alt={course.tutor}
                  className="w-16 h-16 rounded-full mr-4"
                  width={64}
                  height={64}
                />
                <div>
                  <p className="text-xl font-semibold">{course.tutor}</p>
                  <span className="text-gray-500">Senior Engineer</span>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{course.tutorBio}</p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
