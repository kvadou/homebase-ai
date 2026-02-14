import { Settings } from "lucide-react";
import { AdminSettingsLayout } from "@/components/admin/admin-settings-layout";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
            <Settings className="h-5 w-5 text-teal-500" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
              Admin Settings
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Platform configuration, API keys, and admin user management.
            </p>
          </div>
        </div>
      </div>
      <AdminSettingsLayout />
    </div>
  );
}
