import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  canAccessAdminDashboard,
  isDashboardRouteAllowed,
  normalizeRole,
} from "@/lib/adminAccess";
import { getOnboardingPath } from "@/lib/onboarding";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (path.startsWith("/onboarding")) {
    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  const needsAuth =
    path.startsWith("/mycourses") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/instructor") ||
    path.startsWith("/marketer");

  if (needsAuth) {
    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(signInUrl);
    }

    const role = normalizeRole(token.role as string) || (token.role as string);

    if (token.onboardingCompleted === false) {
      const onboardingUrl = new URL(getOnboardingPath(role), request.url);
      return NextResponse.redirect(onboardingUrl);
    }

    if (path.startsWith("/dashboard")) {
      if (!canAccessAdminDashboard(role)) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (!isDashboardRouteAllowed(path, role)) {
        const fallback =
          role === "marketer"
            ? "/marketer/"
            : role === "teacher"
              ? "/instructor/"
              : "/dashboard/courses/";
        return NextResponse.redirect(new URL(fallback, request.url));
      }
    }

    if (path.startsWith("/instructor")) {
      if (role !== "teacher" && role !== "admin" && role !== "superadmin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    if (path.startsWith("/marketer")) {
      if (role !== "marketer" && role !== "admin" && role !== "superadmin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/instructor/:path*",
    "/marketer/:path*",
    "/mycourses",
    "/mycourses/:path*",
    "/onboarding",
    "/onboarding/:path*",
  ],
};
