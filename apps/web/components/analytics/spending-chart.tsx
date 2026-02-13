"use client";

import { useMemo } from "react";

interface SpendingChartProps {
  data: { month: string; amount: number }[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  const maxAmount = useMemo(
    () => Math.max(...data.map((d) => d.amount), 1),
    [data]
  );

  // Generate nice Y-axis ticks
  const yTicks = useMemo(() => {
    if (maxAmount <= 0) return [0];
    const step = Math.ceil(maxAmount / 4 / 50) * 50 || 1;
    const ticks: number[] = [];
    for (let i = 0; i <= 4; i++) {
      ticks.push(step * i);
    }
    return ticks;
  }, [maxAmount]);

  const yMax = yTicks[yTicks.length - 1] || 1;
  const hasData = data.some((d) => d.amount > 0);

  const formatDollar = (val: number) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val}`;
  };

  return (
    <div className="w-full">
      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No spending data recorded yet.
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Spending will appear here as you log maintenance costs.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 flex h-[200px] flex-col-reverse justify-between pr-2">
            {yTicks.map((tick) => (
              <span
                key={tick}
                className="text-[10px] text-[hsl(var(--muted-foreground))] leading-none"
              >
                {formatDollar(tick)}
              </span>
            ))}
          </div>

          {/* Chart area */}
          <div className="ml-12">
            {/* Grid lines */}
            <div className="relative h-[200px]">
              {yTicks.map((tick) => (
                <div
                  key={tick}
                  className="absolute left-0 right-0 border-t border-dashed border-[hsl(var(--border))]"
                  style={{
                    bottom: `${(tick / yMax) * 100}%`,
                  }}
                />
              ))}

              {/* Bars */}
              <div className="relative flex h-full items-end gap-1">
                {data.map((item, i) => {
                  const heightPct =
                    yMax > 0 ? (item.amount / yMax) * 100 : 0;
                  return (
                    <div
                      key={item.month}
                      className="group relative flex flex-1 flex-col items-center justify-end"
                      style={{ height: "100%" }}
                    >
                      {/* Tooltip */}
                      {item.amount > 0 && (
                        <div className="pointer-events-none absolute -top-8 z-10 whitespace-nowrap rounded-md bg-navy-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          ${item.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      )}
                      {/* Bar */}
                      <div
                        className="w-full max-w-[32px] rounded-t-sm transition-all duration-500 ease-out group-hover:opacity-80"
                        style={{
                          height: `${heightPct}%`,
                          minHeight: item.amount > 0 ? "4px" : "0px",
                          background:
                            i % 2 === 0
                              ? "var(--color-navy-900)"
                              : "var(--color-teal-500)",
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
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-navy-900" />
              <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                Maintenance
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-teal-500" />
              <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                Services
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
