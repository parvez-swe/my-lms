import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { CourseDocument } from "@/models/Course";
import { Course } from "@/data/courses";
import { ObjectId } from "mongodb";
import { canDeleteCourse, canEditCourse, canViewCoursePublicly, isCourseOwner } from "@/lib/courseAccess";
import { DEFAULT_CURRENCY, parsePriceString } from "@/lib/currency";
import { getCourseStatus } from "@/lib/instructorProfile";
import { isAdminRole, normalizeRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

async function findCourse(db: Awaited<ReturnType<typeof getDatabase>>, id: string) {
  let course = await db
    .collection<CourseDocument>("courses")
    .findOne({ slug: id });
  let query: { slug?: string; _id?: ObjectId } = { slug: id };

  if (!course && ObjectId.isValid(id)) {
    query = { _id: new ObjectId(id) };
    course = await db.collection<CourseDocument>("courses").findOne(query);
  }

  return { course, query };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const { course } = await findCourse(db, id);

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const session = await auth();
    const isOwner = isCourseOwner(session?.user, course);
    const isAdmin = isAdminRole(session?.user?.role);

    if (!canViewCoursePublicly(course) && !isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const { _id: _courseId, ...courseData } = course;
    return NextResponse.json({
      success: true,
      data: {
        ...courseData,
        instructorId: course.instructorId?.toString(),
        status: getCourseStatus(course),
      } as Course,
    });
  } catch (error) {
    console.error("Failed to fetch course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();
    const { course, query } = await findCourse(db, id);

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    if (!canEditCourse(session.user, course)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isTeacherOwner =
      isCourseOwner(session.user, course) &&
      normalizeRole(session.user.role) === "teacher";

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

    const currency = body.currency || course.currency || DEFAULT_CURRENCY;
    let priceAmount =
      typeof body.priceAmount === "number"
        ? body.priceAmount
        : course.priceAmount;
    let price =
      pricingType === "free"
        ? "Free"
        : body.price ?? course.price ?? "$0";

    if (pricingType === "paid" && body.price) {
      const parsed = parsePriceString(body.price);
      priceAmount = parsed.amount;
    }

    if (pricingType === "paid" && priceAmount !== undefined) {
      const symbol = currency === "BDT" ? "৳" : currency === "USD" ? "$" : "";
      price = `${symbol}${priceAmount.toLocaleString()}`;
    }

    const updatedCourse: Partial<CourseDocument> = {
      title: body.title ?? course.title,
      price,
      priceAmount: pricingType === "free" ? 0 : priceAmount,
      currency,
      pricingType,
      image: body.image ?? course.image,
      tutor: body.tutor ?? course.tutor,
      tutorImage: body.tutorImage ?? course.tutorImage,
      instructorEmail: body.instructorEmail ?? course.instructorEmail,
      description: body.description ?? course.description,
      tutorBio: body.tutorBio ?? course.tutorBio,
      tutorSocials: body.tutorSocials ?? course.tutorSocials,
      modules: body.modules ?? course.modules,
      students: body.students ?? course.students,
      slug: course.slug,
      lessons,
      faqs: body.faqs ?? course.faqs ?? [],
      ratingAverage: course.ratingAverage ?? 0,
      ratingCount: course.ratingCount ?? 0,
      updatedAt: new Date(),
    };

    if (isTeacherOwner && getCourseStatus(course) === "published") {
      updatedCourse.status = "pending_approval";
      updatedCourse.submittedAt = new Date();
      updatedCourse.publishedAt = undefined;
    }

    if (body.instructorId) {
      updatedCourse.instructorId = body.instructorId;
    }

    await db.collection("courses").updateOne(query, { $set: updatedCourse });

    const updated = await db
      .collection<CourseDocument>("courses")
      .findOne(query);
    const { _id: _courseId, ...courseData } = updated!;

    return NextResponse.json({
      success: true,
      data: {
        ...courseData,
        instructorId: updated?.instructorId?.toString(),
      } as Course,
    });
  } catch (error) {
    console.error("Failed to update course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canDeleteCourse(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const db = await getDatabase();
    const { course, query } = await findCourse(db, id);

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
