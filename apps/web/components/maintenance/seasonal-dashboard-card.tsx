"use client";

import Link from "next/link";
import {
  Sun,
  Snowflake,
  Leaf,
  Flower2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getClimateZone,
  getCurrentSeason,
  getSeasonalTasksForSeason,
} from "@/lib/climate-zones";

interface SeasonalDashboardCardProps {
  zipCode: string;
}

const SEASON_CONFIG = {
  spring: { icon: Flower2, label: "Spring", color: "text-green-500" },
  summer: { icon: Sun, label: "Summer", color: "text-amber-500" },
  fall: { icon: Leaf, label: "Fall", color: "text-orange-500" },
  winter: { icon: Snowflake, label: "Winter", color: "text-blue-500" },
} as const;

export function SeasonalDashboardCard({ zipCode }: SeasonalDashboardCardProps) {
  const climateZone = getClimateZone(zipCode);
  const currentSeason = getCurrentSeason();
  const tasks = getSeasonalTasksForSeason(climateZone.zone, currentSeason);

  const highPriorityTasks = tasks
    .filter((t) => t.priority === "high")
    .slice(0, 5);
  const displayTasks = highPriorityTasks.length > 0
    ? highPriorityTasks
    : tasks.slice(0, 5);

  const SeasonIcon = SEASON_CONFIG[currentSeason].icon;

  if (displayTasks.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <SeasonIcon className={cn("h-5 w-5", SEASON_CONFIG[currentSeason].color)} />
          {SEASON_CONFIG[currentSeason].label} Maintenance
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
          <Link href="/dashboard/maintenance">
            View All <ChevronRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayTasks.map((task) => (
            <div
              key={task.title}
              className="flex items-start gap-3 rounded-lg border border-[hsl(var(--border))] p-3"
            >
              <AlertCircle className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                task.priority === "high"
                  ? "text-red-500"
                  : task.priority === "medium"
                  ? "text-amber-500"
                  : "text-[hsl(var(--muted-foreground))]"
              )} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))] line-clamp-1">
                  {task.description}
                </p>
              </div>
              <Badge
                variant={
                  task.priority === "high"
                    ? "destructive"
                    : task.priority === "medium"
                    ? "warning"
                    : "secondary"
                }
                className="shrink-0 text-[10px]"
              >
                {task.priority}
              </Badge>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
          Climate Zone {climateZone.zone} ({climateZone.description.split(" (")[0]})
        </p>
      </CardContent>
    </Card>
  );
}
