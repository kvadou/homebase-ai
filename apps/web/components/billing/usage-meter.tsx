"use client";

import { cn } from "@/lib/utils";

interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
  icon?: React.ReactNode;
}

export function UsageMeter({ label, used, limit, icon }: UsageMeterProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  const getBarColor = () => {
    if (isUnlimited) return "bg-teal-500";
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-amber-500";
    return "bg-teal-500";
  };

  const getTextColor = () => {
    if (isUnlimited) return "text-teal-600 dark:text-teal-400";
    if (percentage >= 90) return "text-red-600 dark:text-red-400";
    if (percentage >= 70) return "text-amber-600 dark:text-amber-400";
    return "text-teal-600 dark:text-teal-400";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-[hsl(var(--muted-foreground))]">{icon}</span>}
          <span className="text-sm font-medium text-[hsl(var(--foreground))]">{label}</span>
        </div>
        <span className={cn("text-sm font-semibold", getTextColor())}>
          {used} / {isUnlimited ? "Unlimited" : limit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getBarColor())}
          style={{ width: isUnlimited ? "5%" : `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  );
}
