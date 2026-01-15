import "material-symbols";
import "remixicon/fonts/remixicon.css";
import "react-calendar/dist/Calendar.css";
import "swiper/css";
import "swiper/css/bundle";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// globals
import "../globals.css";

import LayoutProvider from "@/providers/LayoutProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "../providers";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trezo - Tailwind Nextjs Admin Dashboard Templat",
  description: "Tailwind Nextjs Admin Dashboard Templat",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    redirect("/authentication/sign-in");
  }

  return (
    <html lang="en" dir="ltr">
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <LayoutProvider>{children}</LayoutProvider>{" "}
        </Providers>
      </body>
    </html>
  );
}
