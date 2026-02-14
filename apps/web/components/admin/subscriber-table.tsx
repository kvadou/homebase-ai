"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Subscriber {
  id: string;
  userId: string;
  name: string;
  email: string;
  imageUrl: string | null;
  plan: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

interface SubscriberTableProps {
  loading?: boolean;
}

const PLAN_BADGE_COLORS: Record<string, string> = {
  starter: "bg-blue-100 text-blue-800",
  pro: "bg-teal-100 text-teal-800",
  business: "bg-purple-100 text-purple-800",
};

export function SubscriberTable({ loading: parentLoading }: SubscriberTableProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (search) params.set("search", search);
      if (planFilter !== "all") params.set("plan", planFilter);

      const res = await fetch(`/api/admin/revenue/subscribers?${params}`);
      const json = await res.json();
      if (json.success) {
        setSubscribers(json.data.subscribers);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [page, search, planFilter]);

  useEffect(() => {
    if (!parentLoading) {
      fetchSubscribers();
    }
  }, [fetchSubscribers, parentLoading]);

  useEffect(() => {
    setPage(1);
  }, [search, planFilter]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isLoading = parentLoading || loading;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">
            Paid Subscribers{" "}
            <span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">
              ({total})
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Search subscribers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-[200px] pl-8 text-sm"
              />
            </div>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-9 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 text-sm"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
            ))}
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
            No paid subscribers found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-left text-[hsl(var(--muted-foreground))]">
                    <th className="pb-3 pr-4 font-medium">Subscriber</th>
                    <th className="pb-3 pr-4 font-medium">Plan</th>
                    <th className="hidden pb-3 pr-4 font-medium md:table-cell">Status</th>
                    <th className="hidden pb-3 pr-4 font-medium lg:table-cell">Period Start</th>
                    <th className="hidden pb-3 font-medium lg:table-cell">Period End</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-[hsl(var(--border))]/50 last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-xs font-medium">
                            {sub.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium">{sub.name}</div>
                            <div className="text-xs text-[hsl(var(--muted-foreground))]">
                              {sub.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            PLAN_BADGE_COLORS[sub.plan] ?? "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)}
                        </span>
                      </td>
                      <td className="hidden py-3 pr-4 md:table-cell">
                        <Badge
                          variant={sub.cancelAtPeriodEnd ? "warning" : "success"}
                        >
                          {sub.cancelAtPeriodEnd ? "Canceling" : "Active"}
                        </Badge>
                      </td>
                      <td className="hidden py-3 pr-4 text-[hsl(var(--muted-foreground))] lg:table-cell">
                        {formatDate(sub.currentPeriodStart)}
                      </td>
                      <td className="hidden py-3 text-[hsl(var(--muted-foreground))] lg:table-cell">
                        {formatDate(sub.currentPeriodEnd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--border))] disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--border))] disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
