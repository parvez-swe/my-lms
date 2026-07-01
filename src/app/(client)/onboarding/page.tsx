import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOnboardingPath } from "@/lib/onboarding";
import { normalizeRole } from "@/lib/rbac";

export default async function OnboardingIndexPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/onboarding/");
  }

  const role = normalizeRole(session.user.role);
  redirect(getOnboardingPath(role));
}
