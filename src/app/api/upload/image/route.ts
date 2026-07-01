import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canEditCourseContent } from "@/lib/rbac";
import { uploadMedia } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

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
    const folder = (formData.get("folder") as string) || "course-images";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Image exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadMedia(buffer, {
      folder,
      resourceType: "image",
      mimeType: file.type,
      filename: file.name,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        provider: result.provider,
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload image",
      },
      { status: 500 }
    );
  }
}
