"use client";

import { useState, useEffect } from "react";
import { DollarSign, RefreshCw } from "lucide-react";
import { RevenueMetrics } from "@/components/admin/revenue-metrics";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { PlanDistribution } from "@/components/admin/plan-distribution";
import { SubscriberTable } from "@/components/admin/subscriber-table";

interface RevenueData {
  mrr: number;
  arr: number;
  paidCustomers: number;
  arpu: number;
  totalSubscribers: number;
  planBreakdown: Record<string, { count: number; revenue: number }>;
}

interface HistoryDataPoint {
  month: string;
  mrr: number;
  subscribers: number;
}

export default function RevenuePage() {
  const [metrics, setMetrics] = useState<RevenueData | null>(null);
  const [history, setHistory] = useState<HistoryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, historyRes] = await Promise.all([
        fetch("/api/admin/revenue"),
        fetch("/api/admin/revenue/history"),
      ]);

      const [metricsJson, historyJson] = await Promise.all([
        metricsRes.json(),
        historyRes.json(),
      ]);

      if (metricsJson.success) {
        setMetrics(metricsJson.data);
      } else {
        setError(metricsJson.error ?? "Failed to load revenue data");
      }

      if (historyJson.success) {
        setHistory(historyJson.data);
      }
    } catch {
      setError("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Revenue & Billing</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Subscription metrics and subscriber management
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))]"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Metrics */}
      <RevenueMetrics
        mrr={metrics?.mrr ?? 0}
        arr={metrics?.arr ?? 0}
        paidCustomers={metrics?.paidCustomers ?? 0}
        arpu={metrics?.arpu ?? 0}
        totalSubscribers={metrics?.totalSubscribers ?? 0}
        loading={loading}
      />

      {/* Revenue Chart */}
      <RevenueChart data={history} loading={loading} />

      {/* Bottom section: Plan Distribution + Subscriber Table */}
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <PlanDistribution
          planBreakdown={
            metrics?.planBreakdown ?? {
              free: { count: 0, revenue: 0 },
              starter: { count: 0, revenue: 0 },
              pro: { count: 0, revenue: 0 },
              business: { count: 0, revenue: 0 },
            }
          }
          loading={loading}
        />
        <SubscriberTable loading={loading} />
      </div>
    </div>
  );
}
