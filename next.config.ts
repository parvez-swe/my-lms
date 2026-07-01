import type { NextConfig } from "next";
import path from "path";

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://upload.wikimedia.org https://i.pravatar.cc",
  "font-src 'self' data:",
  "connect-src 'self' https://res.cloudinary.com https://api.cloudinary.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "media-src 'self' https://res.cloudinary.com blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
];

const nextConfig: NextConfig = {
  trailingSlash: true,
  // NextAuth calls /api/auth/* without a trailing slash; avoid 308 redirects that break sign-in.
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
