import { getDatabase } from "@/lib/mongodb";
import { CourseDocument } from "@/models/Course";
import { FaqDocument } from "@/models/Faq";

export interface SafeCourseSummary {
  slug: string;
  title: string;
  price: string;
  pricingType: string;
  lessons: number;
  students: number;
  tutor: string;
  description: string;
  modulesSummary: string;
  rating: string;
  enrollUrl: string;
  detailsUrl: string;
}

const CACHE_TTL_MS = 60_000;
let cachedContext: { text: string; courses: SafeCourseSummary[]; at: number } | null =
  null;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toSafeCourseSummary(course: CourseDocument): SafeCourseSummary {
  const lessonCount =
    course.lessons ??
    course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) ??
    0;

  const modulesSummary =
    course.modules
      ?.map((mod) => {
        const lessonTitles = mod.lessons
          ?.slice(0, 5)
          .map((l) => l.title)
          .join(", ");
        const extra =
          (mod.lessons?.length || 0) > 5
            ? ` (+${mod.lessons.length - 5} more)`
            : "";
        return `${mod.title} [${mod.lessons?.length || 0} lessons: ${lessonTitles}${extra}]`;
      })
      .join(" | ") || "No modules listed";

  const rating =
    course.ratingAverage && course.ratingAverage > 0
      ? `${course.ratingAverage.toFixed(1)}/5 (${course.ratingCount || 0} reviews)`
      : "No ratings yet";

  const description = stripHtml(course.description || "").slice(0, 400);

  return {
    slug: course.slug,
    title: course.title,
    price: course.price || (course.pricingType === "free" ? "Free" : "See details"),
    pricingType: course.pricingType || "paid",
    lessons: lessonCount,
    students: course.students ?? 0,
    tutor: course.tutor || "Instructor",
    description,
    modulesSummary,
    rating,
    enrollUrl: `/courses/enroll/${course.slug}`,
    detailsUrl: `/courses/${course.slug}`,
  };
}

async function loadCourseSummaries(): Promise<SafeCourseSummary[]> {
  const db = await getDatabase();
  const courses = await db
    .collection<CourseDocument>("courses")
    .find(
      {},
      {
        projection: {
          slug: 1,
          title: 1,
          price: 1,
          pricingType: 1,
          lessons: 1,
          students: 1,
          tutor: 1,
          description: 1,
          modules: 1,
          ratingAverage: 1,
          ratingCount: 1,
        },
      }
    )
    .sort({ students: -1 })
    .limit(100)
    .toArray();

  return courses.map(toSafeCourseSummary);
}

async function loadPlatformFaqs(): Promise<{ question: string; answer: string }[]> {
  try {
    const db = await getDatabase();
    const faqDoc = await db.collection<FaqDocument>("faq").findOne({});
    return (
      faqDoc?.faqs?.map((f) => ({
        question: stripHtml(f.question || "").slice(0, 200),
        answer: stripHtml(f.answer || "").slice(0, 300),
      })) ?? []
    );
  } catch {
    return [];
  }
}

function scoreCourseRelevance(course: SafeCourseSummary, query: string): number {
  const haystack =
    `${course.title} ${course.description} ${course.modulesSummary} ${course.tutor}`.toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);

  if (terms.length === 0) return 0;

  return terms.reduce((score, term) => {
    if (haystack.includes(term)) return score + 2;
    // partial stem match for words like "freelance" / "freelancing"
    if (term.length > 4 && haystack.includes(term.slice(0, 4))) return score + 1;
    return score;
  }, 0);
}

function formatCourseBlock(course: SafeCourseSummary, index: number): string {
  return [
    `${index}. **${course.title}**`,
    `   - Price: ${course.price} (${course.pricingType})`,
    `   - Lessons: ${course.lessons} | Students enrolled: ${course.students}`,
    `   - Instructor: ${course.tutor}`,
    `   - Rating: ${course.rating}`,
    `   - Summary: ${course.description || "No description"}`,
    `   - Curriculum: ${course.modulesSummary}`,
    `   - View: ${course.detailsUrl} | Enroll: ${course.enrollUrl}`,
  ].join("\n");
}

function selectRelevantCourses(
  courses: SafeCourseSummary[],
  userMessage: string
): SafeCourseSummary[] {
  if (courses.length <= 12) return courses;

  const scored = courses
    .map((course) => ({
      course,
      score: scoreCourseRelevance(course, userMessage),
    }))
    .sort((a, b) => b.score - a.score);

  const relevant = scored.filter((s) => s.score > 0).map((s) => s.course);

  if (relevant.length >= 3) {
    return relevant.slice(0, 8);
  }

  // No keyword hits — return popular courses
  return courses.slice(0, 8);
}

export async function getCourseSummariesForQuery(
  userMessage: string
): Promise<SafeCourseSummary[]> {
  const { courses } = await getAIKnowledgeBundle();
  return selectRelevantCourses(courses, userMessage);
}

export async function getAIKnowledgeBundle(): Promise<{
  courses: SafeCourseSummary[];
  contextText: string;
}> {
  const now = Date.now();
  if (cachedContext && now - cachedContext.at < CACHE_TTL_MS) {
    return { courses: cachedContext.courses, contextText: cachedContext.text };
  }

  const [courses, faqs] = await Promise.all([
    loadCourseSummaries(),
    loadPlatformFaqs(),
  ]);

  const catalogLines =
    courses.length === 0
      ? "No courses are published yet."
      : courses.map((c, i) => formatCourseBlock(c, i + 1)).join("\n\n");

  const faqLines =
    faqs.length === 0
      ? ""
      : `\n\nPLATFORM FAQ:\n${faqs
          .slice(0, 8)
          .map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`)
          .join("\n")}`;

  const contextText = `LIVE COURSE CATALOG (${courses.length} courses — use ONLY these, never invent courses):
${catalogLines}
${faqLines}

PLATFORM RULES:
- Free courses: enroll at /courses/enroll/{slug}
- Paid courses: bKash payment during enrollment
- Full catalog page: /courses
- For account/billing issues: suggest Live Support`;

  cachedContext = { text: contextText, courses, at: now };
  return { courses, contextText };
}

export async function buildAIKnowledgeContext(
  userMessage: string
): Promise<string> {
  const { courses, contextText } = await getAIKnowledgeBundle();
  const relevant = selectRelevantCourses(courses, userMessage);

  if (relevant.length === courses.length || relevant.length === 0) {
    return contextText;
  }

  const focusedCatalog = relevant
    .map((c, i) => formatCourseBlock(c, i + 1))
    .join("\n\n");

  return `RELEVANT COURSES for this question (from our live catalog — recommend these with titles, prices, and links):
${focusedCatalog}

${courses.length > relevant.length ? `(Showing ${relevant.length} most relevant of ${courses.length} total courses. Full list at /courses)` : ""}

PLATFORM RULES:
- Enroll: /courses/enroll/{slug} | Details: /courses/{slug}
- Paid courses use bKash | Free courses enroll directly
- Do not invent course names or prices not listed above`;
}

export function findMatchingCoursesForFallback(
  courses: SafeCourseSummary[],
  userMessage: string
): SafeCourseSummary[] {
  const matches = courses
    .map((course) => ({
      course,
      score: scoreCourseRelevance(course, userMessage),
    }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((m) => m.course);

  return matches.slice(0, 3);
}
