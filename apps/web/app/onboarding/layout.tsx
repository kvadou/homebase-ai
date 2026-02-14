import { requireAuth } from "@/lib/auth";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-white dark:bg-[hsl(var(--background))]">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-teal-50/40 dark:to-teal-950/10" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        {children}
      </div>
    </div>
  );
}
