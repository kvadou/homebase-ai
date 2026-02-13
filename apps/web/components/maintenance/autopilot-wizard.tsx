"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Loader2,
  Check,
  X,
  Calendar,
  DollarSign,
  AlertTriangle,
  Leaf,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface HomeOption {
  id: string;
  name: string;
  _count: { items: number };
}

interface PlanTask {
  title: string;
  description: string;
  frequency: string;
  nextDueDate: string;
  priority: "low" | "medium" | "high" | "critical";
  reasoning: string;
  estimatedCost: string;
  linkedItemId: string | null;
  approved: boolean;
}

interface PlanResult {
  plan: {
    tasks: Omit<PlanTask, "approved">[];
    seasonalNotes: string[];
    estimatedAnnualCost: string;
  };
  existingTaskCount: number;
  itemCount: number;
}

const priorityConfig = {
  low: {
    label: "Low",
    className:
      "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  medium: {
    label: "Medium",
    className:
      "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  high: {
    label: "High",
    className:
      "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  critical: {
    label: "Critical",
    className:
      "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

interface AutopilotWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTasksCreated: () => void;
}

export function AutopilotWizard({
  open,
  onOpenChange,
  onTasksCreated,
}: AutopilotWizardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"select" | "generating" | "review" | "applying">("select");
  const [homes, setHomes] = useState<HomeOption[]>([]);
  const [selectedHomeId, setSelectedHomeId] = useState<string>("");
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  const fetchHomes = useCallback(async () => {
    const res = await fetch("/api/homes");
    const data = await res.json();
    if (data.success) {
      setHomes(data.data);
      if (data.data.length === 1) {
        setSelectedHomeId(data.data[0].id);
      }
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchHomes();
      setStep("select");
      setPlanResult(null);
      setTasks([]);
      setExpandedTask(null);
    }
  }, [open, fetchHomes]);

  async function handleGenerate() {
    if (!selectedHomeId) return;

    setStep("generating");

    try {
      const res = await fetch(
        `/api/homes/${selectedHomeId}/generate-maintenance-plan`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!data.success) {
        toast({
          title: "Generation failed",
          description: data.error || "Could not generate plan. Please try again.",
          variant: "destructive",
        });
        setStep("select");
        return;
      }

      setPlanResult(data.data);
      setTasks(
        data.data.plan.tasks.map((t: Omit<PlanTask, "approved">) => ({
          ...t,
          approved: true,
        }))
      );
      setStep("review");
    } catch {
      toast({
        title: "Connection error",
        description: "Could not reach the server.",
        variant: "destructive",
      });
      setStep("select");
    }
  }

  async function handleApply() {
    if (!selectedHomeId) return;

    const approvedTasks = tasks.filter((t) => t.approved);
    if (approvedTasks.length === 0) {
      toast({
        title: "No tasks selected",
        description: "Select at least one task to apply.",
        variant: "destructive",
      });
      return;
    }

    setStep("applying");

    try {
      const res = await fetch(
        `/api/homes/${selectedHomeId}/apply-maintenance-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tasks: approvedTasks.map((t) => ({
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
      const data = await res.json();

      if (data.success) {
        toast({
          title: "Plan applied",
          description: `${data.data.count} maintenance tasks created.`,
        });
        onOpenChange(false);
        onTasksCreated();
      } else {
        toast({
          title: "Failed to apply",
          description: data.error || "Could not create tasks.",
          variant: "destructive",
        });
        setStep("review");
      }
    } catch {
      toast({
        title: "Connection error",
        description: "Could not reach the server.",
        variant: "destructive",
      });
      setStep("review");
    }
  }

  function toggleTask(index: number) {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, approved: !t.approved } : t))
    );
  }

  function toggleAll(approved: boolean) {
    setTasks((prev) => prev.map((t) => ({ ...t, approved })));
  }

  const selectedHome = homes.find((h) => h.id === selectedHomeId);
  const approvedCount = tasks.filter((t) => t.approved).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-500" />
            AI Maintenance Autopilot
          </DialogTitle>
          <DialogDescription>
            {step === "select" &&
              "Generate a personalized maintenance plan based on your home and items."}
            {step === "generating" &&
              "Analyzing your home profile and inventory..."}
            {step === "review" &&
              "Review and customize your maintenance plan before applying."}
            {step === "applying" && "Creating your maintenance tasks..."}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Select Home */}
        {step === "select" && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Select Home
              </label>
              <select
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                value={selectedHomeId}
                onChange={(e) => setSelectedHomeId(e.target.value)}
              >
                <option value="">Choose a home...</option>
                {homes.map((home) => (
                  <option key={home.id} value={home.id}>
                    {home.name} ({home._count.items} items)
                  </option>
                ))}
              </select>
            </div>

            {selectedHome && (
              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4">
                <p className="text-sm">
                  <span className="font-medium">{selectedHome.name}</span> has{" "}
                  <span className="font-medium">
                    {selectedHome._count.items} items
                  </span>{" "}
                  in its inventory. The AI will analyze each item and your home
                  profile to generate a customized maintenance schedule.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleGenerate}
                disabled={!selectedHomeId}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate My Plan
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Generating */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-teal-500" />
            <p className="text-sm font-medium">
              Analyzing your home and{" "}
              {selectedHome?._count.items ?? 0} items...
            </p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              This may take 15-30 seconds
            </p>
          </div>
        )}

        {/* Step 3: Review Plan */}
        {step === "review" && planResult && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-[hsl(var(--border))] p-3 text-center">
                <p className="text-2xl font-bold text-teal-600">
                  {tasks.length}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Tasks
                </p>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-3 text-center">
                <p className="text-2xl font-bold text-teal-600">
                  {planResult.plan.estimatedAnnualCost}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Est. Annual
                </p>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-3 text-center">
                <p className="text-2xl font-bold text-teal-600">
                  {approvedCount}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Selected
                </p>
              </div>
            </div>

            {/* Seasonal Notes */}
            {planResult.plan.seasonalNotes.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Leaf className="h-4 w-4 text-green-600" />
                    Seasonal Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {planResult.plan.seasonalNotes.map((note, i) => (
                      <li
                        key={i}
                        className="text-xs text-[hsl(var(--muted-foreground))]"
                      >
                        {note}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Bulk actions */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {approvedCount} of {tasks.length} tasks selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAll(true)}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAll(false)}
                >
                  Deselect All
                </Button>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              {tasks.map((task, index) => {
                const config = priorityConfig[task.priority];
                const isExpanded = expandedTask === index;

                return (
                  <div
                    key={index}
                    className={`rounded-lg border transition-colors ${
                      task.approved
                        ? "border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                        : "border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3 p-3">
                      <button
                        onClick={() => toggleTask(index)}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          task.approved
                            ? "border-teal-500 bg-teal-500 text-white"
                            : "border-[hsl(var(--border))]"
                        }`}
                      >
                        {task.approved && <Check className="h-3 w-3" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{task.title}</p>
                          <Badge className={config.className}>
                            {config.label}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {task.frequency}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {task.estimatedCost}
                          </span>
                          <span>
                            Next: {new Date(task.nextDueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedTask(isExpanded ? null : index)
                        }
                        className="mt-0.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-[hsl(var(--border))] px-3 py-3 pl-11">
                        <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                          {task.description}
                        </p>
                        {task.reasoning && (
                          <p className="mt-2 text-xs italic text-[hsl(var(--muted-foreground))]">
                            Why: {task.reasoning}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Existing tasks warning */}
            {planResult.existingTaskCount > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-800 dark:text-amber-400">
                  This home already has {planResult.existingTaskCount} maintenance
                  tasks. The new tasks will be added alongside existing ones.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={approvedCount === 0}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Apply {approvedCount} Tasks
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Applying */}
        {step === "applying" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-teal-500" />
            <p className="text-sm font-medium">
              Creating {approvedCount} maintenance tasks...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
