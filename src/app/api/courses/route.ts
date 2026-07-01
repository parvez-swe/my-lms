import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { CourseDocument } from "@/models/Course";
import { Course } from "@/data/courses";
import { canCreateCourse } from "@/lib/courseAccess";
import { DEFAULT_CURRENCY, parsePriceString } from "@/lib/currency";
import { isAdminRole, normalizeRole } from "@/lib/rbac";
import { getCourseStatus } from "@/lib/instructorProfile";
import { UserDocument } from "@/models/User";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "true";
    const includeAll = searchParams.get("all") === "true";

    const db = await getDatabase();
    let query: Record<string, unknown> = {};

    if (mine && session?.user) {
      const role = normalizeRole(session.user.role);
      if (role === "teacher" || role === "mentor") {
        query = {
          $or: [
            { instructorId: session.user.id },
            { instructorEmail: session.user.email },
          ],
        };
      }
    } else if (includeAll && session?.user && isAdminRole(session.user.role)) {
      query = {};
    } else {
      query = {
        $or: [
          { status: "published" },
          { status: { $exists: false } },
        ],
      };
    }

    const courses = await db
      .collection<CourseDocument>("courses")
      .find(query)
      .sort({ updatedAt: -1 })
      .toArray();

    const coursesData: Course[] = courses.map((course) => {
      const { _id: _courseId, ...courseData } = course;
      return {
        ...courseData,
        instructorId: course.instructorId?.toString(),
        status: getCourseStatus(course),
      } as Course;
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

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDatabase();
  const userDoc = session.user.id
    ? await db.collection<UserDocument>("users").findOne({
        _id: new ObjectId(session.user.id),
      })
    : null;

  if (!canCreateCourse(session.user.role, userDoc || undefined)) {
    const role = normalizeRole(session.user.role);
    if (role === "teacher") {
      return NextResponse.json(
        {
          error:
            "Instructor profile must be approved by admin before creating courses",
        },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();

    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

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

    const currency = body.currency || DEFAULT_CURRENCY;
    let priceAmount =
      typeof body.priceAmount === "number" ? body.priceAmount : undefined;
    let price =
      pricingType === "free"
        ? "Free"
        : body.price || `${currency === "BDT" ? "৳" : "$"}0`;

    if (pricingType === "paid" && priceAmount === undefined && body.price) {
      const parsed = parsePriceString(body.price);
      priceAmount = parsed.amount;
    }

    if (pricingType === "paid" && priceAmount !== undefined) {
      const symbol = currency === "BDT" ? "৳" : currency === "USD" ? "$" : "";
      price = `${symbol}${priceAmount.toLocaleString()}`;
    }

    const isTeacher =
      session.user.role === "teacher" || session.user.role === "mentor";
    const instructorId = isTeacher
      ? session.user.id
      : body.instructorId || undefined;

    const now = new Date();
    const courseStatus = isTeacher ? "pending_approval" : "published";

    const newCourse: CourseDocument = {
      slug,
      title: body.title,
      price,
      priceAmount: pricingType === "free" ? 0 : priceAmount,
      currency,
      pricingType,
      image: body.image || "/images/courses/course1.jpg",
      tutor: body.tutor || userDoc?.name || "",
      tutorImage: body.tutorImage || userDoc?.image || "/images/users/user1.jpg",
      instructorId: instructorId || undefined,
      instructorEmail: body.instructorEmail || session.user.email || "",
      lessons,
      students: body.students || 0,
      description: body.description || "",
      tutorBio: body.tutorBio || userDoc?.bio || "",
      tutorSocials: body.tutorSocials || [],
      modules: body.modules || [],
      faqs: body.faqs || [],
      testimonials: body.testimonials || [],
      successStories: body.successStories || [],
      ratingAverage: 0,
      ratingCount: 0,
      status: courseStatus,
      submittedAt: isTeacher ? now : undefined,
      publishedAt: isTeacher ? undefined : now,
      createdAt: now,
      updatedAt: now,
    };

    const existingCourse = await db.collection("courses").findOne({ slug });
    if (existingCourse) {
      return NextResponse.json(
        { success: false, error: "Course with this title already exists" },
        { status: 400 }
      );
    }

    const result = await db.collection("courses").insertOne(newCourse);

    return NextResponse.json(
      {
        success: true,
        data: { ...newCourse, _id: result.insertedId },
        message: isTeacher
          ? "Course submitted for admin approval"
          : "Course published",
      },
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
