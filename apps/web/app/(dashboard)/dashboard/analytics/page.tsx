"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Loader2,
  Heart,
  Wrench,
  DollarSign,
  Shield,
  TrendingUp,
  Package,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HealthScoreRing } from "@/components/analytics/health-score-ring";
import { SpendingChart } from "@/components/analytics/spending-chart";
import { CategoryBreakdown } from "@/components/analytics/category-breakdown";
import { MaintenanceTrends } from "@/components/analytics/maintenance-trends";

interface AnalyticsData {
  homeHealthScore: number;
  maintenanceCompliance: number;
  totalItemValue: number;
  warrantyFreshness: number;
  monthlySpending: { month: string; amount: number }[];
  categoryBreakdown: { category: string; count: number; totalValue: number }[];
  maintenanceTrends: { month: string; completed: number; overdue: number }[];
  _summary: {
    totalItems: number;
    totalTasks: number;
    completedTasks: number;
    itemsWithActiveWarranty: number;
    itemsWithWarranty: number;
    documentedItems: number;
    avgCondition: number;
    documentationCompleteness: number;
  };
}

interface HomeOption {
  id: string;
  name: string;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [homes, setHomes] = useState<HomeOption[]>([]);
  const [selectedHome, setSelectedHome] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomes = useCallback(async () => {
    try {
      const res = await fetch("/api/homes");
      const data = await res.json();
      if (data.success) setHomes(data.data);
    } catch {
      // Homes fetch is non-critical
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedHome !== "all") params.set("homeId", selectedHome);

      const res = await fetch(`/api/analytics?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.error || "Failed to load analytics");
      }
    } catch {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [selectedHome]);

  useEffect(() => {
    fetchHomes();
  }, [fetchHomes]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatDollar = (val: number) =>
    val.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[hsl(var(--foreground))]">
            <BarChart3 className="h-6 w-6 text-teal-500" />
            Analytics
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Home health insights and spending trends.
          </p>
        </div>
        {homes.length > 1 && (
          <Select value={selectedHome} onValueChange={setSelectedHome}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select home" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Homes</SelectItem>
              {homes.map((home) => (
                <SelectItem key={home.id} value={home.id}>
                  {home.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
            <p className="mt-4 text-sm font-medium text-[hsl(var(--foreground))]">
              Unable to load analytics
            </p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Analytics content */}
      {analytics && !loading && (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  Health Score
                </CardTitle>
                <Heart className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.homeHealthScore}
                  <span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">
                    /100
                  </span>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {analytics.homeHealthScore >= 71
                    ? "Your home is in great shape"
                    : analytics.homeHealthScore >= 41
                      ? "Some areas need attention"
                      : "Immediate attention needed"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  Maintenance Compliance
                </CardTitle>
                <Wrench className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.maintenanceCompliance}%
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {analytics._summary.completedTasks} of{" "}
                  {analytics._summary.totalTasks} tasks completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  Total Item Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDollar(analytics.totalItemValue)}
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {analytics._summary.totalItems} items tracked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  Warranty Coverage
                </CardTitle>
                <Shield className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.warrantyFreshness}%
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {analytics._summary.itemsWithActiveWarranty} of{" "}
                  {analytics._summary.itemsWithWarranty} warranties active
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Health Score Ring + Score Breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Activity className="h-5 w-5 text-teal-500" />
                  Home Health
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <HealthScoreRing score={analytics.homeHealthScore} />
                {/* Score breakdown */}
                <div className="mt-6 w-full space-y-3">
                  <ScoreBreakdownRow
                    label="Maintenance Compliance"
                    value={analytics.maintenanceCompliance}
                    weight="40%"
                  />
                  <ScoreBreakdownRow
                    label="Warranty Coverage"
                    value={analytics.warrantyFreshness}
                    weight="20%"
                  />
                  <ScoreBreakdownRow
                    label="Item Condition"
                    value={analytics._summary.avgCondition}
                    weight="20%"
                  />
                  <ScoreBreakdownRow
                    label="Documentation"
                    value={analytics._summary.documentationCompleteness}
                    weight="20%"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Package className="h-5 w-5 text-teal-500" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryBreakdown data={analytics.categoryBreakdown} />
              </CardContent>
            </Card>
          </div>

          {/* Spending Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5 text-teal-500" />
                Monthly Spending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingChart data={analytics.monthlySpending} />
            </CardContent>
          </Card>

          {/* Maintenance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Wrench className="h-5 w-5 text-teal-500" />
                Maintenance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MaintenanceTrends data={analytics.maintenanceTrends} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function ScoreBreakdownRow({
  label,
  value,
  weight,
}: {
  label: string;
  value: number;
  weight: string;
}) {
  const getBarColor = (v: number) => {
    if (v <= 40) return "bg-red-500";
    if (v <= 70) return "bg-amber-500";
    return "bg-teal-500";
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[hsl(var(--foreground))]">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            ({weight})
          </span>
          <span className="font-medium text-[hsl(var(--foreground))]">
            {value}%
          </span>
        </div>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
