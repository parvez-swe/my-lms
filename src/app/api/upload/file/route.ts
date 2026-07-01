import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canEditCourseContent } from "@/lib/rbac";
import { uploadMedia } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canEditCourseContent(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "course-resources";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "File type not allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds 50MB limit" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const resourceType = file.type.startsWith("image/") ? "image" : "raw";
    const result = await uploadMedia(buffer, {
      folder,
      resourceType,
      mimeType: file.type,
      filename: file.name,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        provider: result.provider,
        name: file.name,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    );
  }
}
