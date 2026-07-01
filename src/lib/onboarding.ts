import { normalizeRole } from "@/lib/rbac";

export function needsOnboarding(
  role?: string | null,
  onboardingCompleted?: boolean | null
): boolean {
  const r = normalizeRole(role);
  if (!r) return false;
  if (r === "admin" || r === "superadmin" || r === "marketer") {
    return false;
  }
  return onboardingCompleted === false;
}

export function getOnboardingPath(role?: string | null): string {
  const r = normalizeRole(role);
  if (r === "teacher" || r === "mentor") {
    return "/onboarding/teacher/";
  }
  return "/onboarding/student/";
}

/** Where to send the user after sign-in or onboarding. */
export function resolvePostAuthPath(
  role?: string | null,
  onboardingCompleted?: boolean | null,
  callbackUrl?: string | null
): string {
  if (needsOnboarding(role, onboardingCompleted)) {
    return getOnboardingPath(role);
  }

  if (callbackUrl && !callbackUrl.startsWith("/onboarding")) {
    return callbackUrl;
  }

  if (role === "admin" || role === "superadmin") {
    return "/dashboard/";
  }
  if (role === "teacher" || role === "mentor") {
    return "/instructor/";
  }
  if (role === "marketer") {
    return "/marketer/";
  }
  return "/courses/";
}
