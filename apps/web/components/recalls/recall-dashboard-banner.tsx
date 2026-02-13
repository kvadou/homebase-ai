import Link from "next/link";
import { ShieldAlert, ChevronRight } from "lucide-react";

interface RecallDashboardBannerProps {
  recallCount: number;
}

export function RecallDashboardBanner({ recallCount }: RecallDashboardBannerProps) {
  if (recallCount === 0) return null;

  return (
    <Link href="/items" className="block">
      <div className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 p-4 transition-all hover:shadow-md dark:border-red-900/50 dark:bg-red-950/30">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50">
          <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
            Product Recall {recallCount === 1 ? "Alert" : "Alerts"}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400">
            {recallCount} {recallCount === 1 ? "item has" : "items have"} active
            recall {recallCount === 1 ? "notice" : "notices"}. Review for safety information.
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-red-400 dark:text-red-500" />
      </div>
    </Link>
  );
}
