"use client";

import { formatDistanceToNow } from "date-fns";
import { UserPlus, LifeBuoy, CheckCircle2, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "signup" | "ticket_opened" | "ticket_resolved" | "subscription";
  description: string;
  timestamp: string | Date;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

const iconMap = {
  signup: UserPlus,
  ticket_opened: LifeBuoy,
  ticket_resolved: CheckCircle2,
  subscription: CreditCard,
};

const colorMap = {
  signup: "text-teal-500 bg-teal-500/10",
  ticket_opened: "text-orange-500 bg-orange-500/10",
  ticket_resolved: "text-emerald-500 bg-emerald-500/10",
  subscription: "text-blue-500 bg-blue-500/10",
};

export function RecentActivityFeed({ activities, className }: RecentActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className={cn("flex flex-col items-center py-8 text-center", className)}>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {activities.map((activity) => {
        const Icon = iconMap[activity.type];
        const colors = colorMap[activity.type];
        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg border border-[hsl(var(--border))] p-3"
          >
            <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", colors)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">{activity.description}</p>
              <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
