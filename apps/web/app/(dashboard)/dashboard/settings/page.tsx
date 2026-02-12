import { Settings } from "lucide-react";
import { SettingsLayout } from "@/components/settings/settings-layout";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
            <Settings className="h-5 w-5 text-teal-500" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
              Settings
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Manage your account, homes, and preferences.
            </p>
          </div>
        </div>
      </div>
      <SettingsLayout />
    </div>
  );
}
