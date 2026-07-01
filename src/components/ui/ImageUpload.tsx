"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Loader, Upload, X } from "lucide-react";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  required?: boolean;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  folder = "course-images",
  required,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        onChange(result.data.url);
      } else {
        setError(result.error || "Upload failed");
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-[10px] text-black dark:text-white font-medium block">
        {label} {required && <span className="text-danger-500">*</span>}
      </label>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {value ? (
          <div className="relative shrink-0">
            <Image
              src={value}
              alt="Preview"
              width={160}
              height={100}
              className="rounded-lg object-cover border border-gray-200 dark:border-[#172036]"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-2 -right-2 bg-danger-500 text-white rounded-full p-1 shadow"
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="w-40 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 text-xs">
            No image
          </div>
        )}

        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 text-sm font-medium transition disabled:opacity-50"
          >
            {uploading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            JPG, PNG or WebP · max 10MB · Cloudinary with local fallback
          </p>
          {error && <p className="text-xs text-danger-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
