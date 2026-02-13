"use client";

import { useMemo } from "react";

interface CategoryBreakdownProps {
  data: { category: string; count: number; totalValue: number }[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const maxCount = useMemo(
    () => Math.max(...data.map((d) => d.count), 1),
    [data]
  );

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          No items categorized yet.
        </p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Add items to see your category breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const widthPct = (item.count / maxCount) * 100;
        return (
          <div key={item.category} className="group">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                {item.category}
              </span>
              <div className="flex items-center gap-3">
                {item.totalValue > 0 && (
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    $
                    {item.totalValue.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                )}
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  {item.count}
                </span>
              </div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
                style={{
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, var(--color-teal-600), var(--color-teal-400))`,
                  opacity: 1 - i * 0.08,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
