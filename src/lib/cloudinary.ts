import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function uploadBuffer(
  buffer: Buffer,
  options: Record<string, unknown>
): Promise<{ publicId: string; url: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
          });
        } else {
          reject(new Error("Upload failed"));
        }
      })
      .end(buffer);
  });
}

export async function uploadVideoToCloudinary(
  buffer: Buffer,
  folder: string = "course-videos"
): Promise<{ publicId: string; url: string }> {
  return uploadBuffer(buffer, {
    resource_type: "video",
    folder,
    chunk_size: 6000000,
  });
}

export async function uploadImageToCloudinary(
  buffer: Buffer,
  folder: string = "course-images"
): Promise<{ publicId: string; url: string }> {
  return uploadBuffer(buffer, {
    resource_type: "image",
    folder,
  });
}

export async function uploadRawToCloudinary(
  buffer: Buffer,
  folder: string = "course-files",
  mimeType?: string
): Promise<{ publicId: string; url: string }> {
  return uploadBuffer(buffer, {
    resource_type: "raw",
    folder,
    format: mimeType?.includes("pdf") ? "pdf" : undefined,
  });
}

export function validateYouTubeUrl(url: string): boolean {
  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

export function extractYouTubeVideoId(url: string): string | null {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
