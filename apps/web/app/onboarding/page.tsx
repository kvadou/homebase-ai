import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "./components/onboarding-wizard";

export default async function OnboardingPage() {
  const user = await requireAuth();

  // If user already has homes, send them to dashboard
  const homeCount = await prisma.home.count({
    where: { users: { some: { userId: user.id } } },
  });

  if (homeCount > 0) {
    redirect("/dashboard");
  }

  return <OnboardingWizard firstName={user.firstName} />;
}
