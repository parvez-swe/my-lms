import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { normalizeRole } from "@/lib/rbac";
import OnboardingShell from "@/components/Onboarding/OnboardingShell";
import TeacherOnboardingForm from "@/components/Onboarding/TeacherOnboardingForm";

export default async function TeacherOnboardingPage() {
  const session = await auth();
  const role = normalizeRole(session?.user?.role);
  if (role !== "teacher" && role !== "mentor") redirect("/onboarding/student/");

  return (
    <OnboardingShell
      step="Instructor onboarding"
      title="Set up your instructor profile"
      subtitle="Share your expertise and teaching background. Your profile will be reviewed before you can publish courses."
    >
      <TeacherOnboardingForm />
    </OnboardingShell>
  );
}
