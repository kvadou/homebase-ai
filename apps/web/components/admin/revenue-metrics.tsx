"use client";

import { DollarSign, Users, TrendingUp, CreditCard, UserMinus } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";

interface RevenueMetricsProps {
  mrr: number;
  arr: number;
  paidCustomers: number;
  arpu: number;
  totalSubscribers: number;
  loading?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RevenueMetrics({
  mrr,
  arr,
  paidCustomers,
  arpu,
  totalSubscribers,
  loading,
}: RevenueMetricsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[120px] animate-pulse rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
          />
        ))}
      </div>
    );
  }

  const churnRate =
    totalSubscribers > 0
      ? Math.round(((totalSubscribers - paidCustomers) / totalSubscribers) * 100 * 10) / 10
      : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Monthly Recurring Revenue"
        value={formatCurrency(mrr)}
        icon={DollarSign}
      />
      <StatCard
        label="Annual Recurring Revenue"
        value={formatCurrency(arr)}
        icon={TrendingUp}
      />
      <StatCard
        label="Paid Customers"
        value={paidCustomers.toLocaleString()}
        icon={Users}
      />
      <StatCard
        label="Avg Revenue / User"
        value={`$${arpu.toFixed(2)}`}
        icon={CreditCard}
      />
      <StatCard
        label="Free Tier Rate"
        value={`${churnRate}%`}
        icon={UserMinus}
      />
    </div>
  );
}
