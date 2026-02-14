"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FunnelStage {
  label: string;
  count: number;
  color: string;
}

interface ConversionFunnelProps {
  totalUsers: number;
  activeUsers: number;
  paidUsers: number;
  premiumUsers: number;
}

export function ConversionFunnel({
  totalUsers,
  activeUsers,
  paidUsers,
  premiumUsers,
}: ConversionFunnelProps) {
  const stages: FunnelStage[] = [
    { label: "Total Users", count: totalUsers, color: "bg-[#0A2E4D]" },
    { label: "Active (30d)", count: activeUsers, color: "bg-blue-500" },
    { label: "Paid", count: paidUsers, color: "bg-[#00B4A0]" },
    { label: "Premium", count: premiumUsers, color: "bg-orange-500" },
  ];

  const maxCount = Math.max(totalUsers, 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage, i) => {
          const widthPercent = Math.max((stage.count / maxCount) * 100, 4);
          const conversionFromPrev =
            i > 0 && stages[i - 1].count > 0
              ? Math.round((stage.count / stages[i - 1].count) * 100)
              : null;

          return (
            <div key={stage.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{stage.label}</span>
                <div className="flex items-center gap-2">
                  {conversionFromPrev !== null && (
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {conversionFromPrev}% conversion
                    </span>
                  )}
                  <span className="tabular-nums font-semibold">
                    {stage.count.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="h-8 w-full overflow-hidden rounded-md bg-[hsl(var(--muted))]">
                <div
                  className={`h-full rounded-md ${stage.color} flex items-center justify-end pr-2 transition-all duration-700`}
                  style={{ width: `${widthPercent}%` }}
                >
                  {widthPercent > 15 && (
                    <span className="text-xs font-medium text-white">
                      {stage.count.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
