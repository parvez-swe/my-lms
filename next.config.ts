import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Note: output: 'export' is commented out because API routes require a server
  // If you need static export, you'll need to remove API routes or use a separate backend
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    // Additional Sass options can go here
  },
};

export default nextConfig;