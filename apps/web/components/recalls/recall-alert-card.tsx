"use client";

import { useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, ExternalLink, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecallAlertCardProps {
  recall: {
    id: string;
    title: string;
    description?: string | null;
    severity?: string | null;
    recallDate?: string | null;
    sourceUrl?: string | null;
    item: {
      id: string;
      name: string;
      brand?: string | null;
      model?: string | null;
      room?: { name: string } | null;
      home?: { id: string; name: string } | null;
    };
  };
  onDismiss?: (recallId: string) => void;
}

const severityConfig: Record<string, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  high: {
    label: "High",
    className: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  moderate: {
    label: "Moderate",
    className: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  low: {
    label: "Low",
    className: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

export function RecallAlertCard({ recall, onDismiss }: RecallAlertCardProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const severity = recall.severity ?? "low";
  const config = severityConfig[severity] ?? severityConfig.low;
  const borderColor =
    severity === "critical"
      ? "border-red-300 dark:border-red-900/50"
      : severity === "high"
      ? "border-amber-300 dark:border-amber-900/50"
      : severity === "moderate"
      ? "border-yellow-300 dark:border-yellow-900/50"
      : "border-blue-300 dark:border-blue-900/50";

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.(recall.id);
  };

  return (
    <Card className={`${borderColor} relative`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold truncate">{recall.title}</h3>
                  <Badge className={config.className}>{config.label}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                  {recall.item.name}
                  {recall.item.brand && ` - ${recall.item.brand}`}
                  {recall.item.model && ` ${recall.item.model}`}
                  {recall.item.home && ` | ${recall.item.home.name}`}
                  {recall.item.room && ` / ${recall.item.room.name}`}
                </p>
              </div>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={handleDismiss}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Dismiss</span>
                </Button>
              )}
            </div>
            {recall.description && (
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                {recall.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              {recall.recallDate && (
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  Recalled: {format(new Date(recall.recallDate), "MMM d, yyyy")}
                </span>
              )}
              {recall.sourceUrl && (
                <a
                  href={recall.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                >
                  View Details
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
