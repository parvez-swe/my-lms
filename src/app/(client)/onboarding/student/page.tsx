import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { normalizeRole } from "@/lib/rbac";
import OnboardingShell from "@/components/Onboarding/OnboardingShell";
import StudentOnboardingForm from "@/components/Onboarding/StudentOnboardingForm";

export default async function StudentOnboardingPage() {
  const session = await auth();
  const role = normalizeRole(session?.user?.role);
  if (role === "teacher") redirect("/onboarding/teacher/");

  return (
    <OnboardingShell
      step="Student onboarding"
      title="Set up your learner profile"
      subtitle="Tell us a bit about yourself so we can recommend the right courses and track your progress."
    >
      <StudentOnboardingForm />
    </OnboardingShell>
  );
}
