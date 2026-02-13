"use client";

import { useState } from "react";
import { Brain, Plus, Loader2, AlertTriangle, Lightbulb, RefreshCw, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface MaintenancePrediction {
  title: string;
  description: string;
  urgency: "low" | "medium" | "high";
  estimatedDueDate: string;
  estimatedCost: string;
  reasoning: string;
  frequency: string;
}

interface PredictiveResult {
  predictions: MaintenancePrediction[];
  overallHealth: string;
  tips: string[];
}

interface AIPredictionsProps {
  itemId: string;
}

const urgencyConfig = {
  low: { label: "Low", variant: "success" as const },
  medium: { label: "Medium", variant: "warning" as const },
  high: { label: "High", variant: "destructive" as const },
};

export function AIPredictions({ itemId }: AIPredictionsProps) {
  const [result, setResult] = useState<PredictiveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingTask, setAddingTask] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchPredictions() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/items/${itemId}/predict-maintenance`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error ?? "Failed to get predictions");
      }
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function addAsTask(prediction: MaintenancePrediction) {
    setAddingTask(prediction.title);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          title: prediction.title,
          description: prediction.description,
          frequency: prediction.frequency,
          nextDueDate: prediction.estimatedDueDate,
          priority:
            prediction.urgency === "high"
              ? "high"
              : prediction.urgency === "medium"
                ? "medium"
                : "low",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error ?? "Failed to create task");
      }
      toast({
        title: "Task Created",
        description: `"${prediction.title}" has been added as a maintenance task.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setAddingTask(null);
    }
  }

  if (!result && !loading && !error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--muted))] mb-4">
          <Brain className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
        </div>
        <h3 className="text-lg font-semibold mb-2">AI Maintenance Predictions</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-md">
          Use AI to analyze this item and predict upcoming maintenance needs based on its age, condition, and history.
        </p>
        <Button onClick={fetchPredictions}>
          <Brain className="h-4 w-4" />
          Get AI Predictions
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B4A0] mb-4" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Analyzing item and predicting maintenance needs...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-500 mb-4" />
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
          {error}
        </p>
        <Button variant="outline" onClick={fetchPredictions}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#00B4A0]/10">
              <Brain className="h-5 w-5 text-[#00B4A0]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium mb-1">Overall Health Assessment</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {result.overallHealth}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchPredictions}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Cards */}
      {result.predictions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {result.predictions.map((prediction, idx) => {
            const config = urgencyConfig[prediction.urgency];
            return (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">
                      {prediction.title}
                    </CardTitle>
                    <Badge variant={config.variant} className="shrink-0">
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {prediction.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {prediction.estimatedDueDate && (
                      <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(
                            prediction.estimatedDueDate
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {prediction.estimatedCost && (
                      <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>{prediction.estimatedCost}</span>
                      </div>
                    )}
                  </div>

                  {prediction.frequency && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Frequency: {prediction.frequency}
                    </p>
                  )}

                  <details className="group">
                    <summary className="cursor-pointer text-xs font-medium text-[#00B4A0] hover:underline">
                      View reasoning
                    </summary>
                    <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                      {prediction.reasoning}
                    </p>
                  </details>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => addAsTask(prediction)}
                    disabled={addingTask === prediction.title}
                  >
                    {addingTask === prediction.title ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add as Maintenance Task
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tips */}
      {result.tips.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Maintenance Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.tips.map((tip, idx) => (
                <li
                  key={idx}
                  className={cn(
                    "flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]",
                    idx !== result.tips.length - 1 &&
                      "pb-2 border-b border-[hsl(var(--border))]"
                  )}
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00B4A0]" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
