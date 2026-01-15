import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { CourseDocument } from "@/models/Course";
import { Course } from "@/data/courses";

// Force dynamic rendering for API routes
export const dynamic = "force-dynamic";

// GET all courses
export async function GET() {
  try {
    const db = await getDatabase();
    const courses = await db
      .collection<CourseDocument>("courses")
      .find({})
      .toArray();

    // Convert MongoDB documents to Course format (remove _id, add slug)
    const coursesData: Course[] = courses.map((course) => {
      const { _id: _courseId, ...courseData } = course;
      return courseData as Course;
    });

    return NextResponse.json({ success: true, data: coursesData });
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST create new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Calculate total lessons
    const lessons =
      body.modules?.reduce(
        (acc: number, module: { lessons?: unknown[] }) =>
          acc + (module.lessons?.length || 0),
        0
      ) || 0;

    const pricingType =
      body.pricingType === "free" || body.pricingType === "paid"
        ? body.pricingType
        : "paid";

    const price = pricingType === "free" ? "$0" : body.price || "$0";

    const newCourse: CourseDocument = {
      slug,
      title: body.title,
      price,
      pricingType,
      image: body.image || "/images/courses/course1.jpg",
      tutor: body.tutor || "",
      tutorImage: body.tutorImage || "/images/users/user1.jpg",
      lessons,
      students: body.students || 0,
      description: body.description || "",
      tutorBio: body.tutorBio || "",
      tutorSocials: body.tutorSocials || [],
      modules: body.modules || [],
      faqs: body.faqs || [],
      testimonials: body.testimonials || [],
      successStories: body.successStories || [],
      ratingAverage: 0,
      ratingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();

    // Check if slug already exists
    const existingCourse = await db.collection("courses").findOne({ slug });
    if (existingCourse) {
      return NextResponse.json(
        { success: false, error: "Course with this title already exists" },
        { status: 400 }
      );
    }

    const result = await db.collection("courses").insertOne(newCourse);

    return NextResponse.json(
      { success: true, data: { ...newCourse, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create course" },
      { status: 500 }
    );
  }
}
