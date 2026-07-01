import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { normalizeRole } from "@/lib/rbac";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/onboarding/");
  }

  const role = normalizeRole(session.user.role);
  if (session.user.onboardingCompleted !== false) {
    if (role === "teacher") redirect("/instructor/");
    if (role === "admin" || role === "superadmin") redirect("/dashboard/");
    if (role === "marketer") redirect("/marketer/");
    redirect("/courses/");
  }

  return <>{children}</>;
}
