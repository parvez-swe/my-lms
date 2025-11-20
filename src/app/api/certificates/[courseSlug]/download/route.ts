import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { EnrollmentDocument } from "@/models/Enrollment";
import { ObjectId } from "mongodb";
import { Course } from "@/data/courses";

export const dynamic = "force-dynamic";

// GET certificate download (PDF or PNG)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { courseSlug } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "pdf";

    if (!["pdf", "png"].includes(format)) {
      return NextResponse.json(
        { success: false, error: "Invalid format. Use 'pdf' or 'png'" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    // Check enrollment and completion
    const enrollment = await db
      .collection<EnrollmentDocument>("enrollments")
      .findOne({
        userId: userId,
        courseSlug: courseSlug,
        status: "approved",
      });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Fetch course
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const courseResponse = await fetch(`${baseUrl}/api/courses/${courseSlug}`, {
      cache: "no-store",
    });
    const courseResult = await courseResponse.json();

    if (!courseResult.success) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const course: Course = courseResult.data;
    const totalLessons = course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    );
    const completedLessons =
      enrollment.progress?.completedLessons?.length || 0;

    // Check if course is completed
    if (completedLessons < totalLessons) {
      return NextResponse.json(
        {
          success: false,
          error: "Course not completed",
          progress: Math.round((completedLessons / totalLessons) * 100),
        },
        { status: 400 }
      );
    }

    // Get user information
    const user = await db.collection("users").findOne({ _id: userId });

    // Generate certificate data
    const certData = {
      studentName: user?.name || session.user.name || "Student",
      courseTitle: course.title,
      courseSlug: course.slug,
      instructorName: course.tutor,
      completionDate: enrollment.completedAt || new Date(),
      certificateId: `CERT-${courseSlug.toUpperCase()}-${userId.toString().slice(-6)}-${Date.now()}`,
    };

    // Store certificate in database
    await db.collection("certificates").updateOne(
      {
        userId: userId,
        courseSlug: courseSlug,
      },
      {
        $set: {
          ...certData,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Generate certificate HTML
    const certificateHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 60px;
      font-family: 'Georgia', 'Times New Roman', serif;
      background: linear-gradient(135deg, #fef3c7 0%, #ffffff 50%, #f3e8ff 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .certificate {
      width: 100%;
      max-width: 900px;
      background: white;
      border: 8px solid #fbbf24;
      border-radius: 20px;
      padding: 60px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      position: relative;
    }
    .certificate::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      border: 2px solid #a855f7;
      border-radius: 12px;
      pointer-events: none;
    }
    .header {
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 48px;
      font-weight: bold;
      background: linear-gradient(135deg, #7c3aed 0%, #f59e0b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      letter-spacing: 4px;
    }
    .header h2 {
      font-size: 28px;
      color: #6b21a8;
      margin: 10px 0 0 0;
      font-weight: 600;
      letter-spacing: 2px;
    }
    .body {
      margin: 50px 0;
    }
    .body p {
      font-size: 20px;
      color: #4b5563;
      margin: 20px 0;
    }
    .student-name {
      font-size: 42px;
      font-weight: bold;
      color: #7c3aed;
      margin: 30px 0;
      padding: 20px 0;
      border-top: 3px dashed #a855f7;
      border-bottom: 3px dashed #a855f7;
    }
    .course-title {
      font-size: 32px;
      font-weight: bold;
      color: #7c3aed;
      margin: 30px 0;
    }
    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin: 50px 0;
      text-align: left;
    }
    .detail-item {
      text-align: center;
    }
    .detail-label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 5px;
    }
    .detail-value {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
    .footer {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .signature {
      text-align: center;
      width: 200px;
    }
    .signature-line {
      border-top: 2px solid #4b5563;
      width: 150px;
      margin: 0 auto 10px;
    }
    .signature-label {
      font-size: 14px;
      color: #6b7280;
    }
    .certificate-id {
      text-align: center;
      margin: 0 40px;
    }
    .certificate-id-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto 10px;
      color: #f59e0b;
    }
    .certificate-id-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 5px;
    }
    .certificate-id-value {
      font-size: 12px;
      font-family: monospace;
      color: #374151;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <h1>CERTIFICATE</h1>
      <h2>OF COMPLETION</h2>
    </div>
    <div class="body">
      <p>This is to certify that</p>
      <div class="student-name">${certData.studentName}</div>
      <p>has successfully completed the course</p>
      <div class="course-title">${certData.courseTitle}</div>
    </div>
    <div class="details">
      <div class="detail-item">
        <div class="detail-label">Instructor</div>
        <div class="detail-value">${certData.instructorName}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Completion Date</div>
        <div class="detail-value">${new Date(certData.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>
    <div class="footer">
      <div class="signature">
        <div class="signature-line"></div>
        <div class="signature-label">Instructor Signature</div>
      </div>
      <div class="certificate-id">
        <svg class="certificate-id-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
        </svg>
        <div class="certificate-id-label">Certificate ID</div>
        <div class="certificate-id-value">${certData.certificateId}</div>
      </div>
      <div class="signature">
        <div class="signature-line"></div>
        <div class="signature-label">Date</div>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // For now, return the HTML as a data URL
    // In production, you'd use a library like puppeteer or @react-pdf/renderer for PDF/PNG generation
    const htmlBlob = new Blob([certificateHtml], { type: "text/html" });
    const htmlUrl = URL.createObjectURL(htmlBlob);

    // Return the certificate data and HTML URL
    // Note: For actual PDF/PNG generation, you'd need to use a service or library
    return NextResponse.json({
      success: true,
      data: {
        ...certData,
        downloadUrl: htmlUrl,
        html: certificateHtml,
        format: format,
      },
    });
  } catch (error) {
    console.error("Failed to generate certificate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}

