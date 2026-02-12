import { Wrench, CalendarCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-500/10">
          <Wrench className="h-10 w-10 text-teal-500" />
        </div>
        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      </div>
      <h1 className="font-heading text-2xl font-bold text-foreground">
        Smart Maintenance
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Track maintenance schedules, get reminders before things break, and keep a complete service history for every item in your home.
      </p>
      <div className="mt-8 flex gap-3">
        <Button disabled className="gap-2">
          <CalendarCheck className="h-4 w-4" />
          View Schedule
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Coming soon in Phase 2</p>
    </div>
  );
}
