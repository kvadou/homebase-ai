"use client";

import * as React from "react";
import { DollarSign, RefreshCw, TrendingUp, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";

interface HomeValueCardProps {
  homeId: string;
  initialValue?: number | null;
  initialSource?: string | null;
  initialDate?: string | null;
}

interface ValuationData {
  estimatedValue: number | null;
  source: string;
  confidence: "low" | "medium" | "high";
  lastUpdated: string;
  totalMaintenanceInvestment: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const CONFIDENCE_VARIANT = {
  low: "secondary",
  medium: "warning",
  high: "success",
} as const;

export function HomeValueCard({
  homeId,
  initialValue,
  initialSource,
  initialDate,
}: HomeValueCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<ValuationData | null>(
    initialValue
      ? {
          estimatedValue: initialValue,
          source: initialSource ?? "Unknown",
          confidence: "medium",
          lastUpdated: initialDate ?? new Date().toISOString(),
          totalMaintenanceInvestment: 0,
        }
      : null
  );

  const fetchValuation = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/homes/${homeId}/valuation`);
      const result = await res.json();

      if (!res.ok) {
        toast({
          title: "Valuation unavailable",
          description: result.error || "Could not fetch home valuation",
          variant: "destructive",
        });
        return;
      }

      setData(result.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch valuation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [homeId, toast]);

  // Auto-fetch on mount if no initial data
  React.useEffect(() => {
    if (!data) {
      fetchValuation();
    }
  }, [data, fetchValuation]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
          <TrendingUp className="h-4 w-4 text-teal-500" />
          Home Value
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchValuation}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          <div className="flex items-center gap-2 py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-[hsl(var(--muted-foreground))]" />
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              Estimating value...
            </span>
          </div>
        ) : data?.estimatedValue ? (
          <div className="space-y-3">
            <div>
              <p className="text-3xl font-bold">
                {formatCurrency(data.estimatedValue)}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={CONFIDENCE_VARIANT[data.confidence]} className="text-[10px]">
                  {data.confidence} confidence
                </Badge>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {data.source}
                </span>
              </div>
            </div>

            {data.totalMaintenanceInvestment > 0 && (
              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Wrench className="h-4 w-4 text-teal-500" />
                  <span className="text-[hsl(var(--muted-foreground))]">
                    You&apos;ve invested{" "}
                    <span className="font-semibold text-[hsl(var(--foreground))]">
                      {formatCurrency(data.totalMaintenanceInvestment)}
                    </span>{" "}
                    maintaining your{" "}
                    <span className="font-semibold text-[hsl(var(--foreground))]">
                      {formatCurrency(data.estimatedValue)}
                    </span>{" "}
                    home
                  </span>
                </div>
              </div>
            )}

            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Last updated:{" "}
              {new Date(data.lastUpdated).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        ) : (
          <div className="py-4 text-center">
            <DollarSign className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))]" />
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Add your home address to get a value estimate.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
