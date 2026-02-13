"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";

interface PlanData {
  plan: string;
  usage: {
    items: { used: number; limit: number };
  };
}

export function SidebarPlanIndicator() {
  const [data, setData] = useState<PlanData | null>(null);

  useEffect(() => {
    fetch("/api/billing/subscription")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        }
      })
      .catch(() => {
        // Fallback to free plan display
      });
  }, []);

  const plan = data?.plan ?? "free";
  const planLabel = plan === "family" ? "Family" : plan === "pro" ? "Pro" : "Free";
  const itemsUsed = data?.usage?.items?.used ?? 0;
  const itemsLimit = data?.usage?.items?.limit ?? 25;
  const isUnlimited = itemsLimit === -1;
  const usagePercent = isUnlimited ? 5 : Math.min((itemsUsed / itemsLimit) * 100, 100);

  return (
    <Link
      href="/dashboard/billing"
      className="block rounded-lg bg-[hsl(var(--sidebar-accent))] p-3 transition-colors hover:bg-[hsl(var(--sidebar-accent))]/80"
    >
      <div className="flex items-center gap-2">
        {plan !== "free" && <Crown className="h-3.5 w-3.5 text-teal-500" />}
        <p className="text-xs font-medium text-[hsl(var(--sidebar-foreground))]">
          {planLabel} Plan
        </p>
      </div>
      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
        {isUnlimited
          ? `${itemsUsed} items`
          : `${itemsUsed} of ${itemsLimit} items used`}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--sidebar-border))]">
        <div
          className={`h-full rounded-full transition-all ${
            usagePercent > 90
              ? "bg-red-500"
              : usagePercent > 70
              ? "bg-amber-500"
              : "bg-teal-500"
          }`}
          style={{ width: `${Math.max(usagePercent, 2)}%` }}
        />
      </div>
    </Link>
  );
}
