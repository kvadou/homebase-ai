"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Camera,
  MessageSquare,
  Wrench,
  BookOpen,
  Briefcase,
  Shield,
  FileText,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface Feature {
  name: string;
  count: number;
}

interface FeatureUsageProps {
  features: Feature[];
  total: number;
}

const featureIcons: Record<string, LucideIcon> = {
  "Items Scanned": Camera,
  "Chat Sessions": MessageSquare,
  "Maintenance Tasks": Wrench,
  "Manuals Uploaded": BookOpen,
  "Service Requests": Briefcase,
  "Insurance Claims": Shield,
  "Home Passports": FileText,
  "Safety Entries": AlertTriangle,
  "Timeline Events": Clock,
};

const featureColors: Record<string, string> = {
  "Items Scanned": "bg-teal-500",
  "Chat Sessions": "bg-blue-500",
  "Maintenance Tasks": "bg-orange-500",
  "Manuals Uploaded": "bg-purple-500",
  "Service Requests": "bg-amber-500",
  "Insurance Claims": "bg-red-500",
  "Home Passports": "bg-emerald-500",
  "Safety Entries": "bg-rose-500",
  "Timeline Events": "bg-indigo-500",
};

export function FeatureUsage({ features, total }: FeatureUsageProps) {
  const sorted = [...features].sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Feature Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No feature usage data yet.
          </p>
        ) : (
          sorted.map((feature) => {
            const Icon = featureIcons[feature.name] || FileText;
            const barColor = featureColors[feature.name] || "bg-gray-400";
            const percentage = total > 0 ? (feature.count / total) * 100 : 0;

            return (
              <div key={feature.name} className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{feature.name}</span>
                    <span className="ml-2 shrink-0 tabular-nums text-[hsl(var(--muted-foreground))]">
                      {feature.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className={`h-full rounded-full ${barColor} transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 1)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
