"use client";

import { ShieldAlert } from "lucide-react";
import { RecallAlertCard } from "./recall-alert-card";

interface RecallItem {
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
}

interface RecallListProps {
  recalls: RecallItem[];
  onDismiss?: (recallId: string) => void;
}

export function RecallList({ recalls, onDismiss }: RecallListProps) {
  if (recalls.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <ShieldAlert className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="mt-4 text-sm font-semibold">No Active Recalls</h3>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          None of your items have any known product recalls. We check regularly
          to keep you informed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recalls.map((recall) => (
        <RecallAlertCard
          key={recall.id}
          recall={recall}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
