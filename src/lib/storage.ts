import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  uploadImageToCloudinary,
  uploadRawToCloudinary,
  uploadVideoToCloudinary,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";

export type StorageProvider = "cloudinary" | "local";

export interface UploadResult {
  url: string;
  publicId?: string;
  provider: StorageProvider;
}

export type ResourceType = "image" | "video" | "raw";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

async function uploadToLocal(
  buffer: Buffer,
  folder: string,
  filename: string
): Promise<UploadResult> {
  const safeName = `${Date.now()}-${sanitizeFilename(filename)}`;
  const relativeDir = path.join("uploads", folder);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(absoluteDir, { recursive: true });
  const filePath = path.join(absoluteDir, safeName);
  await writeFile(filePath, buffer);
  return {
    url: `/${relativeDir.replace(/\\/g, "/")}/${safeName}`,
    provider: "local",
  };
}

export async function uploadMedia(
  buffer: Buffer,
  options: {
    folder: string;
    resourceType: ResourceType;
    mimeType: string;
    filename: string;
  }
): Promise<UploadResult> {
  const { folder, resourceType, mimeType, filename } = options;

  if (isCloudinaryConfigured()) {
    try {
      if (resourceType === "image") {
        const result = await uploadImageToCloudinary(buffer, folder);
        return { url: result.url, publicId: result.publicId, provider: "cloudinary" };
      }
      if (resourceType === "video") {
        const result = await uploadVideoToCloudinary(buffer, folder);
        return { url: result.url, publicId: result.publicId, provider: "cloudinary" };
      }
      const result = await uploadRawToCloudinary(buffer, folder, mimeType);
      return { url: result.url, publicId: result.publicId, provider: "cloudinary" };
    } catch (error) {
      console.warn("Cloudinary upload failed, falling back to local storage:", error);
    }
  }

  const ext =
    path.extname(filename) ||
    (resourceType === "image"
      ? ".jpg"
      : resourceType === "video"
        ? ".mp4"
        : ".bin");
  const localName = `${randomUUID()}${ext}`;
  return uploadToLocal(buffer, folder, localName);
}
