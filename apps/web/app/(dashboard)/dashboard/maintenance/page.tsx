"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { isPast } from "date-fns";
import { Wrench, Plus, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MaintenanceTaskCard,
  type MaintenanceTaskData,
} from "@/components/maintenance/maintenance-task-card";
import { CreateTaskDialog } from "@/components/maintenance/create-task-dialog";
import { LogCompletionDialog } from "@/components/maintenance/log-completion-dialog";
import { TaskDetailPanel } from "@/components/maintenance/task-detail-panel";
import { MaintenanceFilters } from "@/components/maintenance/maintenance-filters";
import { AutopilotWizard } from "@/components/maintenance/autopilot-wizard";

interface HomeOption {
  id: string;
  name: string;
}

export default function MaintenancePage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<MaintenanceTaskData[]>([]);
  const [homes, setHomes] = useState<HomeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");

  // Filters
  const [selectedHome, setSelectedHome] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Dialogs
  const [autopilotOpen, setAutopilotOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [completeTask, setCompleteTask] = useState<MaintenanceTaskData | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [deleteTask, setDeleteTask] = useState<MaintenanceTaskData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedHome !== "all") params.set("homeId", selectedHome);
      if (selectedPriority !== "all") params.set("priority", selectedPriority);

      const res = await fetch(`/api/maintenance?${params.toString()}`);
      const data = await res.json();
      if (data.success) setTasks(data.data);
    } finally {
      setLoading(false);
    }
  }, [selectedHome, selectedPriority]);

  const fetchHomes = useCallback(async () => {
    const res = await fetch("/api/homes");
    const data = await res.json();
    if (data.success) setHomes(data.data);
  }, []);

  useEffect(() => {
    fetchHomes();
  }, [fetchHomes]);

  useEffect(() => {
    setLoading(true);
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    const now = new Date();
    return {
      upcoming: tasks.filter(
        (t) =>
          t.status !== "completed" &&
          t.status !== "skipped" &&
          (!t.nextDueDate || !isPast(new Date(t.nextDueDate)))
      ),
      overdue: tasks.filter(
        (t) =>
          t.status !== "completed" &&
          t.status !== "skipped" &&
          t.nextDueDate &&
          isPast(new Date(t.nextDueDate))
      ),
      completed: tasks.filter((t) => t.status === "completed"),
      all: tasks,
    };
  }, [tasks]);

  async function handleDelete() {
    if (!deleteTask) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/maintenance/${deleteTask.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Task deleted", description: "Maintenance task has been removed." });
        setDeleteTask(null);
        fetchTasks();
      }
    } finally {
      setDeleting(false);
    }
  }

  const currentTasks = filteredTasks[tab as keyof typeof filteredTasks] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
                Maintenance
              </h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Track and manage maintenance tasks for your home items.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAutopilotOpen(true)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Autopilot
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      <MaintenanceFilters
        homes={homes}
        selectedHome={selectedHome}
        onHomeChange={setSelectedHome}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming
            {filteredTasks.upcoming.length > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                {filteredTasks.upcoming.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            {filteredTasks.overdue.length > 0 && (
              <span className="ml-1.5 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                {filteredTasks.overdue.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {["upcoming", "overdue", "completed", "all"].map((tabKey) => (
          <TabsContent key={tabKey} value={tabKey}>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : currentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
                  <Wrench className="h-7 w-7 text-[hsl(var(--muted-foreground))]" />
                </div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {tabKey === "upcoming"
                    ? "No upcoming tasks"
                    : tabKey === "overdue"
                      ? "No overdue tasks"
                      : tabKey === "completed"
                        ? "No completed tasks"
                        : "No maintenance tasks yet"}
                </p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {tabKey === "all" || tabKey === "upcoming"
                    ? "Create a task to start tracking maintenance."
                    : "Tasks will appear here as their status changes."}
                </p>
                {(tabKey === "all" || tabKey === "upcoming") && (
                  <Button
                    className="mt-4 gap-2"
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {currentTasks.map((task) => (
                  <MaintenanceTaskCard
                    key={task.id}
                    task={task}
                    onClick={(t) => setDetailTaskId(t.id)}
                    onMarkComplete={(t) => setCompleteTask(t)}
                    onDelete={(t) => setDeleteTask(t)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={fetchTasks}
      />

      {/* Log Completion Dialog */}
      <LogCompletionDialog
        task={completeTask}
        open={!!completeTask}
        onOpenChange={(val) => {
          if (!val) setCompleteTask(null);
        }}
        onLogged={fetchTasks}
      />

      {/* Task Detail Panel */}
      <TaskDetailPanel
        taskId={detailTaskId}
        open={!!detailTaskId}
        onOpenChange={(val) => {
          if (!val) setDetailTaskId(null);
        }}
      />

      {/* Autopilot Wizard */}
      <AutopilotWizard
        open={autopilotOpen}
        onOpenChange={setAutopilotOpen}
        onTasksCreated={fetchTasks}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTask}
        onOpenChange={(val) => {
          if (!val) setDeleteTask(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTask?.title}&rdquo;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTask(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
