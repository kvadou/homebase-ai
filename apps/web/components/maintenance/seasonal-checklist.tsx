"use client";

import * as React from "react";
import {
  Sun,
  Snowflake,
  Leaf,
  Flower2,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getClimateZone,
  getCurrentSeason,
  getNextSeason,
  getSeasonalTasksForSeason,
  type SeasonalTask,
  type ClimateZone,
} from "@/lib/climate-zones";

interface SeasonalChecklistProps {
  zipCode: string;
}

const SEASON_CONFIG = {
  spring: { icon: Flower2, label: "Spring", color: "text-green-500" },
  summer: { icon: Sun, label: "Summer", color: "text-amber-500" },
  fall: { icon: Leaf, label: "Fall", color: "text-orange-500" },
  winter: { icon: Snowflake, label: "Winter", color: "text-blue-500" },
} as const;

const PRIORITY_VARIANT = {
  low: "secondary",
  medium: "warning",
  high: "destructive",
} as const;

export function SeasonalChecklist({ zipCode }: SeasonalChecklistProps) {
  const [completed, setCompleted] = React.useState<Set<string>>(new Set());
  const [showNext, setShowNext] = React.useState(false);

  const climateZone = getClimateZone(zipCode);
  const currentSeason = getCurrentSeason();
  const nextSeason = getNextSeason(currentSeason);

  const currentTasks = getSeasonalTasksForSeason(climateZone.zone, currentSeason);
  const nextTasks = getSeasonalTasksForSeason(climateZone.zone, nextSeason);

  const toggleTask = (title: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const completedCount = currentTasks.filter((t) => completed.has(t.title)).length;
  const CurrentIcon = SEASON_CONFIG[currentSeason].icon;
  const NextIcon = SEASON_CONFIG[nextSeason].icon;

  return (
    <div className="space-y-6">
      {/* Climate Zone Info */}
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Climate Zone {climateZone.zone}: {climateZone.description}
        </p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Based on ZIP code {zipCode}
        </p>
      </div>

      {/* Current Season Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CurrentIcon className={cn("h-5 w-5", SEASON_CONFIG[currentSeason].color)} />
              {SEASON_CONFIG[currentSeason].label} Checklist
            </CardTitle>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              {completedCount}/{currentTasks.length} done
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-2 rounded-full bg-[hsl(var(--muted))]">
            <div
              className="h-2 rounded-full bg-teal-500 transition-all"
              style={{
                width: currentTasks.length > 0
                  ? `${(completedCount / currentTasks.length) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentTasks
              .sort((a, b) => {
                const order = { high: 0, medium: 1, low: 2 };
                return order[a.priority] - order[b.priority];
              })
              .map((task) => (
                <TaskItem
                  key={task.title}
                  task={task}
                  isCompleted={completed.has(task.title)}
                  onToggle={() => toggleTask(task.title)}
                />
              ))}
            {currentTasks.length === 0 && (
              <p className="py-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                No specific tasks for this season in your climate zone.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Coming Up Next Season */}
      <Card>
        <CardHeader className="pb-3">
          <button
            type="button"
            onClick={() => setShowNext(!showNext)}
            className="flex w-full items-center justify-between"
          >
            <CardTitle className="flex items-center gap-2 text-lg">
              <NextIcon className={cn("h-5 w-5", SEASON_CONFIG[nextSeason].color)} />
              Coming Up: {SEASON_CONFIG[nextSeason].label}
            </CardTitle>
            {showNext ? (
              <ChevronUp className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            )}
          </button>
        </CardHeader>
        {showNext && (
          <CardContent>
            <div className="space-y-2">
              {nextTasks
                .sort((a, b) => {
                  const order = { high: 0, medium: 1, low: 2 };
                  return order[a.priority] - order[b.priority];
                })
                .map((task) => (
                  <div
                    key={task.title}
                    className="rounded-lg border border-[hsl(var(--border))] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                          {task.description}
                        </p>
                      </div>
                      <Badge variant={PRIORITY_VARIANT[task.priority]} className="shrink-0 text-[10px]">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function TaskItem({
  task,
  isCompleted,
  onToggle,
}: {
  task: SeasonalTask;
  isCompleted: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
        isCompleted
          ? "border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/20"
          : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50"
      )}
    >
      {isCompleted ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
      ) : (
        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--muted-foreground))]" />
      )}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            isCompleted && "text-[hsl(var(--muted-foreground))] line-through"
          )}
        >
          {task.title}
        </p>
        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
          {task.description}
        </p>
      </div>
      <Badge variant={PRIORITY_VARIANT[task.priority]} className="shrink-0 text-[10px]">
        {task.priority}
      </Badge>
    </button>
  );
}
