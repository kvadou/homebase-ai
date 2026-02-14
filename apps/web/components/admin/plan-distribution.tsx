"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlanBreakdown {
  [plan: string]: { count: number; revenue: number };
}

interface PlanDistributionProps {
  planBreakdown: PlanBreakdown;
  loading?: boolean;
}

const PLAN_COLORS: Record<string, { bg: string; bar: string; text: string }> = {
  free: { bg: "bg-gray-100", bar: "bg-gray-400", text: "text-gray-700" },
  starter: { bg: "bg-blue-50", bar: "bg-blue-500", text: "text-blue-700" },
  pro: { bg: "bg-teal-50", bar: "bg-teal-500", text: "text-teal-700" },
  business: { bg: "bg-purple-50", bar: "bg-purple-500", text: "text-purple-700" },
};

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  business: "Business",
};

export function PlanDistribution({ planBreakdown, loading }: PlanDistributionProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plan Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCount = Object.values(planBreakdown).reduce((sum, p) => sum + p.count, 0);
  const plans = ["free", "starter", "pro", "business"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Plan Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {plans.map((plan) => {
            const data = planBreakdown[plan] ?? { count: 0, revenue: 0 };
            const percentage = totalCount > 0 ? (data.count / totalCount) * 100 : 0;
            const colors = PLAN_COLORS[plan] ?? PLAN_COLORS.free;

            return (
              <div key={plan} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${colors.bar}`} />
                    <span className="font-medium">{PLAN_LABELS[plan] ?? plan}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[hsl(var(--muted-foreground))]">
                    <span>{data.count} users</span>
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className={`h-2.5 w-full overflow-hidden rounded-full ${colors.bg}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                    style={{ width: `${Math.max(percentage, 0)}%` }}
                  />
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  ${data.revenue.toLocaleString()}/mo revenue
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
