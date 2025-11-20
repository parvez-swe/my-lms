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

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trezo - Tailwind Nextjs Admin Dashboard Templat",
  description: "Tailwind Nextjs Admin Dashboard Templat",
};

import { Providers } from "../providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <Navbar />
          <div className=" ">{children}</div>
          <FloatingChatbot />
        </Providers>
      </body>
    </html>
  );
}
