import { courses } from "@/data/courses";
import { notFound } from "next/navigation";
import LessonView from "@/components/LMS/LessonView";

// --- Types ---
interface LessonPageParams {
  params: {
    slug: string;
    moduleId: string;
    lessonId: string;
  };
}

// --- Static Params Generation ---
export async function generateStaticParams() {
  const params: { slug: string; moduleId: string; lessonId: string }[] = [];

  courses.forEach((course) => {
    course.modules.forEach((module, modIdx) => {
      module.lessons.forEach((lesson, lessonIdx) => {
        params.push({
          slug: course.slug,
          moduleId: modIdx.toString(),
          lessonId: lessonIdx.toString(),
        });
      });
    });
  });

  return params;
}
export const dynamicParams = false;

// --- Helper: Get Navigation Links ---
function getNavigationLinks(
  slug: string,
  course: (typeof courses)[0],
  moduleIndex: number,
  lessonIndex: number
) {
  let prevLessonLink: string | null = null;
  let nextLessonLink: string | null = null;

  // Find previous lesson
  if (lessonIndex > 0) {
    prevLessonLink = `/mycourses/${slug}/${moduleIndex}/${lessonIndex - 1}`;
  } else if (moduleIndex > 0) {
    const prevModuleIndex = moduleIndex - 1;
    const prevModule = course.modules[prevModuleIndex];
    const prevLessonIndex = prevModule.lessons.length - 1;
    prevLessonLink = `/mycourses/${slug}/${prevModuleIndex}/${prevLessonIndex}`;
  }

  // Find next lesson
  const currentModuleLessonCount = course.modules[moduleIndex].lessons.length;
  if (lessonIndex < currentModuleLessonCount - 1) {
    nextLessonLink = `/mycourses/${slug}/${moduleIndex}/${lessonIndex + 1}`;
  } else if (moduleIndex < course.modules.length - 1) {
    const nextModuleIndex = moduleIndex + 1;
    nextLessonLink = `/mycourses/${slug}/${nextModuleIndex}/0`;
  }

  return { prevLessonLink, nextLessonLink };
}

// --- Page Component (Server Component) ---
export default async function LessonPage({ params }: LessonPageParams) {
  const { slug, moduleId, lessonId } = params;

  const course = courses.find((c) => c.slug === slug);
  const moduleIndex = parseInt(moduleId);
  const lessonIndex = parseInt(lessonId);

  // --- Data Validation ---
  if (!course || isNaN(moduleIndex) || isNaN(lessonIndex)) {
    notFound();
  }

  const mod = course.modules[moduleIndex];
  const lesson = mod?.lessons[lessonIndex];

  if (!lesson) {
    notFound();
  }

  // --- Mock Progress (replace with real user data) ---
  const completedLessonIds = new Set(["0-0", "0-1", "0-2"]);

  // --- Get Navigation Links ---
  const { prevLessonLink, nextLessonLink } = getNavigationLinks(
    slug,
    course,
    moduleIndex,
    lessonIndex
  );

  // --- Mock Comments (replace with real data) ---
  const comments = [
    {
      id: 1,
      author: "Jane Doe",
      avatar: "/images/clients/client1.jpg",
      text: "This was incredibly helpful, thank you for the clear explanation!",
      timestamp: "2 days ago",
      replies: [
        {
          id: 101,
          author: "Admin",
          avatar: "/images/admin.png",
          text: "You're welcome! Glad we could help.",
          timestamp: "1 day ago",
        },
      ],
    },
    {
      id: 2,
      author: "John Smith",
      avatar: "/images/clients/client2.jpg",
      text: "Could you elaborate on the part about asynchronous functions? I'm a bit lost.",
      timestamp: "1 day ago",
      replies: [],
    },
  ];

  return (
    <LessonView
      course={course}
      moduleIndex={moduleIndex}
      lessonIndex={lessonIndex}
      lesson={lesson}
      completedLessonIds={completedLessonIds}
      prevLessonLink={prevLessonLink}
      nextLessonLink={nextLessonLink}
      comments={comments}
      slug={slug}
    />
  );
}