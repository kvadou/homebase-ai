import { ShieldAlert } from "lucide-react";

interface ItemRecallBannerProps {
  recallCount: number;
}

export function ItemRecallBanner({ recallCount }: ItemRecallBannerProps) {
  if (recallCount === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50">
        <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-red-800 dark:text-red-300">
          Product Recall {recallCount === 1 ? "Alert" : "Alerts"}
        </p>
        <p className="text-xs text-red-600 dark:text-red-400">
          This item has {recallCount} active recall{" "}
          {recallCount === 1 ? "notice" : "notices"}. Check the recalls tab for
          safety details.
        </p>
      </div>
    </div>
  );
}
