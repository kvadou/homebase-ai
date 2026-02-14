"use client";

import * as React from "react";
import {
  Loader2,
  Sparkles,
  Calendar,
  DollarSign,
  Check,
  Home,
  Package,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface PlanTask {
  title: string;
  description: string;
  frequency: string;
  nextDueDate: string;
  priority: "low" | "medium" | "high" | "critical";
  estimatedCost: string;
  linkedItemId: string | null;
}

interface PlanResult {
  plan: {
    tasks: PlanTask[];
    seasonalNotes: string[];
    estimatedAnnualCost: string;
  };
  existingTaskCount: number;
  itemCount: number;
}

interface StepMaintenanceProps {
  homeId: string;
  homeName: string;
  itemCount: number;
  onComplete: () => void;
}

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

type Phase = "generating" | "applying" | "complete" | "failed";

export function StepMaintenance({
  homeId,
  homeName,
  itemCount,
  onComplete,
}: StepMaintenanceProps) {
  const { toast } = useToast();
  const [phase, setPhase] = React.useState<Phase>("generating");
  const [tasks, setTasks] = React.useState<PlanTask[]>([]);
  const [annualCost, setAnnualCost] = React.useState("");
  const [appliedCount, setAppliedCount] = React.useState(0);
  const [visibleTasks, setVisibleTasks] = React.useState(0);

  // Generate and apply maintenance plan on mount
  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // Step 1: Generate plan
        const genRes = await fetch(
          `/api/homes/${homeId}/generate-maintenance-plan`,
          { method: "POST" }
        );
        const genData = await genRes.json();

        if (cancelled) return;

        if (!genRes.ok || !genData.success) {
          setPhase("failed");
          return;
        }

        const planResult: PlanResult = genData.data;
        const planTasks = planResult.plan.tasks;
        setTasks(planTasks);
        setAnnualCost(planResult.plan.estimatedAnnualCost);

        // Step 2: Apply all tasks
        setPhase("applying");

        const applyRes = await fetch(
          `/api/homes/${homeId}/apply-maintenance-plan`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tasks: planTasks.map((t) => ({
                title: t.title,
                description: t.description,
                frequency: t.frequency,
                nextDueDate: t.nextDueDate,
                priority: t.priority,
                linkedItemId: t.linkedItemId,
              })),
            }),
          }
        );
        const applyData = await applyRes.json();

        if (cancelled) return;

        if (applyData.success) {
          setAppliedCount(applyData.data.count);
        }

        // Step 3: Reveal tasks with staggered animation
        setPhase("complete");
      } catch {
        if (cancelled) return;
        setPhase("failed");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [homeId, toast]);

  // Staggered task reveal animation
  React.useEffect(() => {
    if (phase !== "complete" || tasks.length === 0) return;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleTasks(i);
      if (i >= tasks.length) clearInterval(interval);
    }, 150);

    return () => clearInterval(interval);
  }, [phase, tasks.length]);

  // Failed state — home + item created but plan failed
  if (phase === "failed") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-lg text-center animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#00B4A0] shadow-lg shadow-[#00B4A0]/25">
            <Check className="h-7 w-7 text-white" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-[#0A2E4D] dark:text-white">
            Your home is set up!
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            We couldn&apos;t generate a maintenance plan right now, but you can
            create one anytime from your dashboard using AI Autopilot.
          </p>

          {/* Stats */}
          <div className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3">
            <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
              <Home className="mb-1.5 h-4 w-4 text-[#0A2E4D] dark:text-teal-400" />
              <span className="text-lg font-bold text-[#0A2E4D] dark:text-white">1</span>
              <span className="text-[10px] text-gray-500">Home</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
              <Package className="mb-1.5 h-4 w-4 text-[#0A2E4D] dark:text-teal-400" />
              <span className="text-lg font-bold text-[#0A2E4D] dark:text-white">{itemCount}</span>
              <span className="text-[10px] text-gray-500">{itemCount === 1 ? "Item" : "Items"}</span>
            </div>
          </div>

          <div className="mt-8">
            <Button
              onClick={onComplete}
              size="lg"
              className="gap-2 bg-[#0A2E4D] px-8 text-base font-semibold text-white shadow-md hover:bg-[#0d3d66]"
            >
              Go to Your Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading states
  if (phase === "generating" || phase === "applying") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00B4A0]/10">
              <Sparkles className="h-8 w-8 text-[#00B4A0]" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-900">
              <Loader2 className="h-4 w-4 animate-spin text-[#00B4A0]" />
            </div>
          </div>
          <h2 className="font-heading text-xl font-bold text-[#0A2E4D] dark:text-white">
            {phase === "generating"
              ? "Generating your maintenance plan..."
              : "Setting up your tasks..."}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {phase === "generating"
              ? "AI is analyzing your home and items to create a personalized schedule."
              : "Almost there — saving your maintenance tasks."}
          </p>

          {/* Animated dots */}
          <div className="mt-6 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-[#00B4A0] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Complete — celebration reveal
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Success header */}
        <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#00B4A0] shadow-lg shadow-[#00B4A0]/25">
            <Check className="h-7 w-7 text-white" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-[#0A2E4D] dark:text-white">
            You&apos;re all set!
          </h2>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            Your home is ready with a personalized maintenance plan.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both delay-200">
          <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
            <Home className="mb-1.5 h-4 w-4 text-[#0A2E4D] dark:text-teal-400" />
            <span className="text-lg font-bold text-[#0A2E4D] dark:text-white">
              1
            </span>
            <span className="text-[10px] text-gray-500">Home</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
            <Package className="mb-1.5 h-4 w-4 text-[#0A2E4D] dark:text-teal-400" />
            <span className="text-lg font-bold text-[#0A2E4D] dark:text-white">
              {itemCount}
            </span>
            <span className="text-[10px] text-gray-500">
              {itemCount === 1 ? "Item" : "Items"}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
            <Wrench className="mb-1.5 h-4 w-4 text-[#0A2E4D] dark:text-teal-400" />
            <span className="text-lg font-bold text-[#0A2E4D] dark:text-white">
              {appliedCount || tasks.length}
            </span>
            <span className="text-[10px] text-gray-500">Tasks</span>
          </div>
        </div>

        {/* Task list with staggered reveal */}
        {tasks.length > 0 && (
          <div className="mb-6 space-y-2">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Your Maintenance Schedule
            </h3>
            {tasks.map((task, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition-all duration-300 dark:border-gray-800 dark:bg-gray-900/50",
                  index < visibleTasks
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                )}
              >
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#00B4A0]">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#0A2E4D] dark:text-white">
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {task.frequency}
                    </span>
                    {task.estimatedCost && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {task.estimatedCost}
                      </span>
                    )}
                    <Badge
                      className={cn(
                        "text-[10px]",
                        priorityColors[task.priority] || priorityColors.medium
                      )}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Annual cost summary */}
        {annualCost && (
          <div className="mb-6 rounded-lg border border-[#00B4A0]/20 bg-[#00B4A0]/5 p-3 text-center animate-in fade-in duration-500 fill-mode-both delay-700">
            <p className="text-xs text-[#00B4A0]">
              Estimated annual maintenance cost:{" "}
              <span className="font-semibold">{annualCost}</span>
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both delay-1000">
          <Button
            onClick={onComplete}
            size="lg"
            className="gap-2 bg-[#0A2E4D] px-8 text-base font-semibold text-white shadow-md hover:bg-[#0d3d66]"
          >
            Go to Your Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
