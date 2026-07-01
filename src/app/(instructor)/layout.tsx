import "material-symbols";
import "remixicon/fonts/remixicon.css";
import "react-calendar/dist/Calendar.css";
import "swiper/css";
import "swiper/css/bundle";

import "../globals.css";

import LayoutProvider from "@/providers/LayoutProvider";
import { ThemeScript } from "@/components/ThemeScript";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "../providers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { normalizeRole } from "@/lib/rbac";
import { BRAND } from "@/lib/brand";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND.name} — Instructor`,
  description: `${BRAND.name} instructor dashboard`,
  icons: { icon: BRAND.favicon },
};

export default async function InstructorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const role = normalizeRole(session?.user?.role);

  if (!session?.user || (role !== "teacher" && role !== "admin" && role !== "superadmin")) {
    redirect("/auth/signin");
  }

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <LayoutProvider>{children}</LayoutProvider>
        </Providers>
      </body>
    </html>
  );
}
