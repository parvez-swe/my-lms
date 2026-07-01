import "material-symbols";
import "remixicon/fonts/remixicon.css";
import "react-calendar/dist/Calendar.css";
import "swiper/css";
import "swiper/css/bundle";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canAccessAdminDashboard } from "@/lib/adminAccess";

// globals
import "../globals.css";

import LayoutProvider from "@/providers/LayoutProvider";
import { ThemeScript } from "@/components/ThemeScript";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "../providers";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${BRAND.name} — Admin`,
  description: `Admin dashboard for ${BRAND.name}`,
  icons: { icon: BRAND.favicon },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user || !canAccessAdminDashboard(session.user.role)) {
    redirect("/auth/signin");
  }

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <LayoutProvider>{children}</LayoutProvider>{" "}
        </Providers>
      </body>
    </html>
  );
}
