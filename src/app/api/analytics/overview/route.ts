import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { EnrollmentDocument } from "@/models/Enrollment";
import { UserDocument } from "@/models/User";
import { CourseDocument } from "@/models/Course";

import { canViewAnalytics } from "@/lib/rbac";
import { Filter } from "mongodb";

export const dynamic = "force-dynamic";

const notDeleted = {
  $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
} as Filter<UserDocument>;

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function fillLast30Days(
  rows: { date: string; count: number }[]
): { date: string; count: number }[] {
  const map = new Map(rows.map((r) => [r.date, r.count]));
  const result: { date: string; count: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: map.get(key) ?? 0 });
  }

  return result;
}

export async function GET() {
  /* auth-guarded */
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canViewAnalytics(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const db = await getDatabase();
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(
      new Date(now.getFullYear(), now.getMonth() - 1, 1)
    );

    const usersCol = db.collection<UserDocument>("users");
    const coursesCol = db.collection<CourseDocument>("courses");
    const enrollmentsCol = db.collection<EnrollmentDocument>("enrollments");

    const [
      totalStudents,
      totalCourses,
      totalEnrollments,
      pendingEnrollments,
      approvedEnrollments,
      recentEnrollments,
      newStudentsThisMonth,
      enrollmentsThisMonth,
      enrollmentsLastMonth,
      statusCounts,
      enrollmentsByDayRaw,
      topCoursesRaw,
      completionStats,
      courseCompletionRaw,
      retentionRaw,
    ] = await Promise.all([
      usersCol.countDocuments({ role: "student", ...notDeleted }),
      coursesCol.countDocuments({}),
      enrollmentsCol.countDocuments({}),
      enrollmentsCol.countDocuments({ status: "pending" }),
      enrollmentsCol.countDocuments({ status: "approved" }),
      enrollmentsCol.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      usersCol.countDocuments({
        role: "student",
        createdAt: { $gte: thisMonthStart },
        ...notDeleted,
      }),
      enrollmentsCol.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      enrollmentsCol.countDocuments({
        createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
      }),
      enrollmentsCol
        .aggregate<{ _id: string; count: number }>([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ])
        .toArray(),
      enrollmentsCol
        .aggregate<{ _id: string; count: number }>([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),
      enrollmentsCol
        .aggregate<{
          slug: string;
          title: string;
          enrollmentCount: number;
        }>([
          { $group: { _id: "$courseSlug", enrollmentCount: { $sum: 1 } } },
          { $sort: { enrollmentCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "courses",
              localField: "_id",
              foreignField: "slug",
              as: "course",
            },
          },
          {
            $project: {
              slug: "$_id",
              title: {
                $ifNull: [
                  { $arrayElemAt: ["$course.title", 0] },
                  "$_id",
                ],
              },
              enrollmentCount: 1,
            },
          },
        ])
        .toArray(),
      enrollmentsCol
        .aggregate<{ total: number; completed: number }>([
          { $match: { status: "approved" } },
          {
            $lookup: {
              from: "courses",
              localField: "courseSlug",
              foreignField: "slug",
              as: "course",
            },
          },
          { $unwind: "$course" },
          {
            $addFields: {
              totalLessons: {
                $sum: {
                  $map: {
                    input: { $ifNull: ["$course.modules", []] },
                    as: "mod",
                    in: { $size: { $ifNull: ["$$mod.lessons", []] } },
                  },
                },
              },
              completedCount: {
                $size: { $ifNull: ["$progress.completedLessons", []] },
              },
            },
          },
          {
            $addFields: {
              isComplete: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$totalLessons", 0] },
                      { $gte: ["$completedCount", "$totalLessons"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: "$isComplete" },
            },
          },
        ])
        .toArray(),
      enrollmentsCol
        .aggregate<{
          slug: string;
          title: string;
          avgCompletionRate: number;
        }>([
          { $match: { status: "approved" } },
          {
            $lookup: {
              from: "courses",
              localField: "courseSlug",
              foreignField: "slug",
              as: "course",
            },
          },
          { $unwind: "$course" },
          {
            $addFields: {
              totalLessons: {
                $sum: {
                  $map: {
                    input: { $ifNull: ["$course.modules", []] },
                    as: "mod",
                    in: { $size: { $ifNull: ["$$mod.lessons", []] } },
                  },
                },
              },
              completedCount: {
                $size: { $ifNull: ["$progress.completedLessons", []] },
              },
            },
          },
          {
            $addFields: {
              completionPct: {
                $cond: [
                  { $gt: ["$totalLessons", 0] },
                  {
                    $multiply: [
                      { $divide: ["$completedCount", "$totalLessons"] },
                      100,
                    ],
                  },
                  0,
                ],
              },
            },
          },
          {
            $group: {
              _id: "$courseSlug",
              title: { $first: "$course.title" },
              avgCompletionRate: { $avg: "$completionPct" },
            },
          },
          { $sort: { avgCompletionRate: -1 } },
          { $limit: 10 },
          {
            $project: {
              slug: "$_id",
              title: 1,
              avgCompletionRate: { $round: ["$avgCompletionRate", 1] },
            },
          },
        ])
        .toArray(),
      enrollmentsCol
        .aggregate<{ multiCourse: number; singleCourse: number }>([
          { $match: { status: "approved" } },
          { $group: { _id: "$userId", courseCount: { $sum: 1 } } },
          {
            $group: {
              _id: null,
              multiCourse: {
                $sum: { $cond: [{ $gt: ["$courseCount", 1] }, 1, 0] },
              },
              singleCourse: {
                $sum: { $cond: [{ $eq: ["$courseCount", 1] }, 1, 0] },
              },
            },
          },
        ])
        .toArray(),
    ]);

    const enrollmentsByStatus = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    for (const row of statusCounts) {
      if (row._id === "pending") enrollmentsByStatus.pending = row.count;
      else if (row._id === "approved") enrollmentsByStatus.approved = row.count;
      else if (row._id === "rejected") enrollmentsByStatus.rejected = row.count;
    }

    const completionTotal = completionStats[0]?.total ?? 0;
    const completionCompleted = completionStats[0]?.completed ?? 0;
    const completionRate =
      completionTotal > 0
        ? Math.round((completionCompleted / completionTotal) * 100)
        : 0;

    const enrollmentsByDay = fillLast30Days(
      enrollmentsByDayRaw.map((r) => ({ date: r._id, count: r.count }))
    );

    const retention = retentionRaw[0] ?? { multiCourse: 0, singleCourse: 0 };
    const monthOverMonthChange =
      enrollmentsLastMonth > 0
        ? Math.round(
            ((enrollmentsThisMonth - enrollmentsLastMonth) /
              enrollmentsLastMonth) *
              100
          )
        : enrollmentsThisMonth > 0
          ? 100
          : 0;

    return NextResponse.json({
      totalStudents,
      totalCourses,
      totalEnrollments,
      pendingEnrollments,
      approvedEnrollments,
      completionRate,
      recentEnrollments,
      enrollmentsByDay,
      topCourses: topCoursesRaw,
      enrollmentsByStatus,
      newStudentsThisMonth,
      enrollmentsThisMonth,
      enrollmentsLastMonth,
      monthOverMonthChange,
      courseCompletionRates: courseCompletionRaw,
      studentRetention: {
        multiCourse: retention.multiCourse,
        singleCourse: retention.singleCourse,
      },
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
