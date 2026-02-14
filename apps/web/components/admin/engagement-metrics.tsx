"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";

interface EngagementData {
  dau: number;
  wau: number;
  mau: number;
  dauWauRatio: number;
  wauMauRatio: number;
}

interface EngagementMetricsProps {
  data: EngagementData;
}

export function EngagementMetrics({ data }: EngagementMetricsProps) {
  const metrics = [
    {
      label: "Daily Active Users",
      shortLabel: "DAU",
      value: data.dau,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
    },
    {
      label: "Weekly Active Users",
      shortLabel: "WAU",
      value: data.wau,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      label: "Monthly Active Users",
      shortLabel: "MAU",
      value: data.mau,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  const ratios = [
    {
      label: "DAU/WAU Ratio",
      value: data.dauWauRatio,
      description: "Daily stickiness",
    },
    {
      label: "WAU/MAU Ratio",
      value: data.wauMauRatio,
      description: "Weekly stickiness",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.shortLabel} className={`border ${metric.borderColor}`}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-lg ${metric.bgColor} p-2.5`}>
                <Users className={`h-5 w-5 ${metric.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold tabular-nums">{metric.value.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ratios.map((ratio) => (
          <Card key={ratio.label}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{ratio.label}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {ratio.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-xl font-bold tabular-nums">{ratio.value}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
