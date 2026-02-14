"use client";

import * as React from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GrowthChart } from "@/components/admin/growth-chart";
import { FeatureUsage } from "@/components/admin/feature-usage";
import { EngagementMetrics } from "@/components/admin/engagement-metrics";
import { ConversionFunnel } from "@/components/admin/conversion-funnel";

interface OverviewData {
  totalUsers: number;
  totalHomes: number;
  totalItems: number;
  totalRooms: number;
  totalMaintenanceTasks: number;
  totalChatSessions: number;
  totalManuals: number;
  totalServiceRequests: number;
  totalInsuranceClaims: number;
}

interface FeatureData {
  features: { name: string; count: number }[];
  total: number;
}

interface EngagementData {
  dau: number;
  wau: number;
  mau: number;
  dauWauRatio: number;
  wauMauRatio: number;
}

interface GrowthDataPoint {
  month: string;
  signups: number;
  conversions: number;
}

export default function AnalyticsPage() {
  const [overview, setOverview] = React.useState<OverviewData | null>(null);
  const [features, setFeatures] = React.useState<FeatureData | null>(null);
  const [engagement, setEngagement] = React.useState<EngagementData | null>(null);
  const [growth, setGrowth] = React.useState<GrowthDataPoint[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [paidUsers, setPaidUsers] = React.useState(0);
  const [premiumUsers, setPremiumUsers] = React.useState(0);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, featuresRes, engagementRes, growthRes] =
        await Promise.all([
          fetch("/api/admin/analytics/overview"),
          fetch("/api/admin/analytics/features"),
          fetch("/api/admin/analytics/engagement"),
          fetch("/api/admin/analytics/growth"),
        ]);

      const [overviewJson, featuresJson, engagementJson, growthJson] =
        await Promise.all([
          overviewRes.json(),
          featuresRes.json(),
          engagementRes.json(),
          growthRes.json(),
        ]);

      if (overviewJson.success) setOverview(overviewJson.data);
      if (featuresJson.success) setFeatures(featuresJson.data);
      if (engagementJson.success) {
        setEngagement(engagementJson.data);
        setPaidUsers(0);
        setPremiumUsers(0);
      }
      if (growthJson.success) {
        setGrowth(growthJson.data);
        // Sum conversions for funnel paid count
        const totalConversions = growthJson.data.reduce(
          (sum: number, d: GrowthDataPoint) => sum + d.conversions,
          0
        );
        setPaidUsers(totalConversions);
        setPremiumUsers(Math.floor(totalConversions * 0.3));
      }
    } catch {
      // Errors handled gracefully - states remain null/empty
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#0A2E4D] p-2">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">Platform Analytics</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Track engagement, growth, and feature adoption
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
            <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
              Loading analytics...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Engagement Metrics Row */}
          <EngagementMetrics
            data={
              engagement ?? {
                dau: 0,
                wau: 0,
                mau: 0,
                dauWauRatio: 0,
                wauMauRatio: 0,
              }
            }
          />

          {/* Growth Chart (full width) */}
          <GrowthChart data={growth} />

          {/* Feature Usage + Conversion Funnel (side by side) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <FeatureUsage
              features={features?.features ?? []}
              total={features?.total ?? 0}
            />
            <ConversionFunnel
              totalUsers={overview?.totalUsers ?? 0}
              activeUsers={engagement?.mau ?? 0}
              paidUsers={paidUsers}
              premiumUsers={premiumUsers}
            />
          </div>
        </>
      )}
    </div>
  );
}
