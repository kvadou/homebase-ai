"use client";

import { useMemo } from "react";

interface MaintenanceTrendsProps {
  data: { month: string; completed: number; overdue: number }[];
}

export function MaintenanceTrends({ data }: MaintenanceTrendsProps) {
  const maxValue = useMemo(
    () => Math.max(...data.map((d) => Math.max(d.completed, d.overdue)), 1),
    [data]
  );

  const hasData = data.some((d) => d.completed > 0 || d.overdue > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          No maintenance history yet.
        </p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Trends will appear as you complete maintenance tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Chart */}
      <div className="relative h-[200px]">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <div
            key={pct}
            className="absolute left-0 right-0 border-t border-dashed border-[hsl(var(--border))]"
            style={{ bottom: `${pct * 100}%` }}
          />
        ))}

        {/* Bars */}
        <div className="relative flex h-full items-end gap-1">
          {data.map((item) => {
            const completedPct = (item.completed / maxValue) * 100;
            const overduePct = (item.overdue / maxValue) * 100;

            return (
              <div
                key={item.month}
                className="group relative flex flex-1 items-end justify-center gap-[2px]"
                style={{ height: "100%" }}
              >
                {/* Tooltip */}
                {(item.completed > 0 || item.overdue > 0) && (
                  <div className="pointer-events-none absolute -top-10 z-10 whitespace-nowrap rounded-md bg-navy-900 px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    <span className="text-teal-300">{item.completed} done</span>
                    {item.overdue > 0 && (
                      <>
                        {" / "}
                        <span className="text-red-300">
                          {item.overdue} overdue
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Completed bar */}
                <div
                  className="w-full max-w-[14px] rounded-t-sm bg-teal-500 transition-all duration-500 ease-out"
                  style={{
                    height: `${completedPct}%`,
                    minHeight: item.completed > 0 ? "4px" : "0px",
                  }}
                />
                {/* Overdue bar */}
                <div
                  className="w-full max-w-[14px] rounded-t-sm bg-red-400 transition-all duration-500 ease-out"
                  style={{
                    height: `${overduePct}%`,
                    minHeight: item.overdue > 0 ? "4px" : "0px",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="mt-2 flex gap-1">
        {data.map((item) => (
          <div key={item.month} className="flex-1 text-center">
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
              {item.month}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-teal-500" />
          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
            Completed
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-red-400" />
          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
            Overdue
          </span>
        </div>
      </div>
    </div>
  );
}
