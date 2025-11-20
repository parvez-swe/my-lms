import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { CourseDocument } from "@/models/Course";
import { Course } from "@/data/courses";
import { ObjectId } from "mongodb";

// Force dynamic rendering for API routes
export const dynamic = "force-dynamic";

// GET course by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    // Try to find by slug first, then by _id
    let course = await db
      .collection<CourseDocument>("courses")
      .findOne({ slug: id });

    if (!course && ObjectId.isValid(id)) {
      course = await db.collection<CourseDocument>("courses").findOne({
        _id: new ObjectId(id),
      });
    }

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...courseData } = course;
    return NextResponse.json({ success: true, data: courseData as Course });
  } catch (error) {
    console.error("Failed to fetch course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// PUT update course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();

    // Find course by slug or _id
    let course = await db
      .collection<CourseDocument>("courses")
      .findOne({ slug: id });
    let query: { slug?: string; _id?: ObjectId } = { slug: id };

    if (!course && ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
      course = await db.collection<CourseDocument>("courses").findOne(query);
    }

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Calculate total lessons
    const lessons =
      body.modules?.reduce(
        (acc: number, module: { lessons?: unknown[] }) =>
          acc + (module.lessons?.length || 0),
        0
      ) || course.lessons;

    const pricingType =
      body.pricingType === "free" || body.pricingType === "paid"
        ? body.pricingType
        : course.pricingType || "paid";

    const price =
      pricingType === "free"
        ? "$0"
        : body.price ?? course.price ?? "$0";

    const updatedCourse: Partial<CourseDocument> = {
      ...body,
      price,
      pricingType,
      slug: course.slug, // Keep original slug
      lessons,
      faqs: body.faqs ?? course.faqs ?? [],
      ratingAverage: course.ratingAverage ?? 0,
      ratingCount: course.ratingCount ?? 0,
      updatedAt: new Date(),
    };

    const result = await db.collection("courses").updateOne(query, {
      $set: updatedCourse,
    });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const updated = await db
      .collection<CourseDocument>("courses")
      .findOne(query);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...courseData } = updated!;

    return NextResponse.json({ success: true, data: courseData as Course });
  } catch (error) {
    console.error("Failed to update course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    // Try to find by slug first, then by _id
    let course = await db
      .collection<CourseDocument>("courses")
      .findOne({ slug: id });
    let query: { slug?: string; _id?: ObjectId } = { slug: id };

    if (!course && ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
      course = await db.collection<CourseDocument>("courses").findOne(query);
    }

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const result = await db.collection("courses").deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Course deleted" });
  } catch (error) {
    console.error("Failed to delete course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
