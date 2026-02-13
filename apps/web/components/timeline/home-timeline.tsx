"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddEventDialog } from "./add-event-dialog";
import {
  Wrench,
  Package,
  Star,
  Shield,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  date: string;
  cost: number | null;
  metadata: Record<string, unknown> | null;
}

interface TimelineData {
  events: TimelineEvent[];
  totalCost: number;
  costByType: Record<string, number>;
  count: number;
}

interface HomeTimelineProps {
  homeId: string;
}

const TYPE_CONFIG: Record<
  string,
  { icon: typeof Wrench; label: string; color: string }
> = {
  maintenance: {
    icon: Wrench,
    label: "Maintenance",
    color: "text-orange-500 bg-orange-500/10",
  },
  purchase: {
    icon: Package,
    label: "Purchase",
    color: "text-blue-500 bg-blue-500/10",
  },
  improvement: {
    icon: Star,
    label: "Improvement",
    color: "text-teal-500 bg-teal-500/10",
  },
  warranty: {
    icon: Shield,
    label: "Warranty",
    color: "text-purple-500 bg-purple-500/10",
  },
  custom: {
    icon: Calendar,
    label: "Event",
    color: "text-gray-500 bg-gray-500/10",
  },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.custom;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function groupByMonth(
  events: TimelineEvent[]
): Map<string, TimelineEvent[]> {
  const groups = new Map<string, TimelineEvent[]>();
  for (const event of events) {
    const date = new Date(event.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(event);
  }
  return groups;
}

export function HomeTimeline({ homeId }: HomeTimelineProps) {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(
        `/api/homes/${homeId}/timeline?${params.toString()}`
      );
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } finally {
      setLoading(false);
    }
  }, [homeId, startDate, endDate]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`/api/homes/${homeId}/timeline/seed`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data.seeded > 0) {
          fetchTimeline();
        }
      }
    } finally {
      setSeeding(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredEvents =
    data?.events.filter(
      (e) => filterType === "all" || e.type === filterType
    ) ?? [];

  const grouped = groupByMonth(filteredEvents);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Total Events
              </div>
              <div className="text-2xl font-bold">{data.count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Total Cost
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(data.totalCost)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Maintenance
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(data.costByType.maintenance ?? 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Purchases
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(data.costByType.purchase ?? 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and actions */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">From</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">To</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <div className="flex gap-2">
          <AddEventDialog homeId={homeId} onEventAdded={fetchTimeline} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeed}
            disabled={seeding}
            className="gap-2"
          >
            {seeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Auto-populate
          </Button>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-3 h-10 w-10 text-[hsl(var(--muted-foreground))]" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              No timeline events yet. Add events manually or use auto-populate
              to import from your maintenance and purchase history.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([monthLabel, events]) => (
            <div key={monthLabel}>
              <h3 className="mb-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                {monthLabel}
              </h3>
              <div className="relative ml-4 border-l-2 border-[hsl(var(--border))] pl-6 space-y-4">
                {events.map((event) => {
                  const config = getTypeConfig(event.type);
                  const Icon = config.icon;
                  const isExpanded = expandedIds.has(event.id);

                  return (
                    <div key={event.id} className="relative">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-[calc(1.5rem+5px)] flex h-4 w-4 items-center justify-center rounded-full border-2 border-[hsl(var(--background))] ${config.color}`}
                      >
                        <div className="h-2 w-2 rounded-full bg-current" />
                      </div>

                      <Card className="transition-shadow hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.color}`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm">
                                    {event.title}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {config.label}
                                  </Badge>
                                </div>
                                <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                                  {formatDate(event.date)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {event.cost != null && event.cost > 0 && (
                                <span className="flex items-center gap-1 text-sm font-medium">
                                  <DollarSign className="h-3 w-3" />
                                  {formatCurrency(event.cost)}
                                </span>
                              )}
                              {(event.description || event.metadata) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => toggleExpand(event.id)}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-3 ml-11 space-y-2 border-t border-[hsl(var(--border))] pt-3">
                              {event.description && (
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                  {event.description}
                                </p>
                              )}
                              {event.metadata && (
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(event.metadata)
                                    .filter(
                                      ([key]) =>
                                        !key.startsWith("source") &&
                                        key !== "taskId" &&
                                        key !== "itemId"
                                    )
                                    .map(([key, value]) =>
                                      value ? (
                                        <Badge
                                          key={key}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {key}: {String(value)}
                                        </Badge>
                                      ) : null
                                    )}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
