import "material-symbols";
import "remixicon/fonts/remixicon.css";
import "react-calendar/dist/Calendar.css";
import "swiper/css";
import "swiper/css/bundle";

// globals
import "../globals.css";

// import LayoutProvider from "@/providers/LayoutProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/FrontPage/Navbar";
import FloatingChatbot from "@/components/FloatingChatbot";
import { ThemeScript } from "@/components/ThemeScript";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: BRAND.name,
  description: `${BRAND.tagline} — Online courses and learning management`,
  icons: { icon: BRAND.favicon },
};

import { Providers } from "../providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${inter.variable} antialiased bg-white dark:bg-[#0c1427] text-slate-900 dark:text-gray-100`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen pt-28 has-[[data-full-bleed]]:pt-0">{children}</main>
          <FloatingChatbot />
        </Providers>
      </body>
    </html>
  );
}
