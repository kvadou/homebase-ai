"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Calendar, DollarSign, User, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaintenanceLog {
  id: string;
  notes?: string | null;
  cost?: number | null;
  performedAt: string;
  performedBy?: string | null;
}

interface TaskDetail {
  id: string;
  title: string;
  description?: string | null;
  frequency?: string | null;
  nextDueDate?: string | null;
  priority?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  item: {
    id: string;
    name: string;
    category: string;
    home: { id: string; name: string };
    room?: { id: string; name: string } | null;
  };
  logs: MaintenanceLog[];
}

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const statusColors: Record<string, string> = {
  overdue: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  skipped: "bg-gray-100 text-gray-600",
};

const statusLabels: Record<string, string> = {
  overdue: "Overdue",
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  skipped: "Skipped",
};

const priorityLabels: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

interface TaskDetailPanelProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailPanel({
  taskId,
  open,
  onOpenChange,
}: TaskDetailPanelProps) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && taskId) {
      setLoading(true);
      fetch(`/api/maintenance/${taskId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setTask(data.data);
        })
        .finally(() => setLoading(false));
    } else {
      setTask(null);
    }
  }, [open, taskId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
          </div>
        ) : task ? (
          <>
            <DialogHeader>
              <DialogTitle>{task.title}</DialogTitle>
              <DialogDescription>
                {task.item.name} &middot; {task.item.home.name}
                {task.item.room && ` &middot; ${task.item.room.name}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={cn(
                    priorityColors[task.priority ?? "medium"]
                  )}
                >
                  {priorityLabels[task.priority ?? "medium"] ?? "Medium"}
                </Badge>
                <Badge className={cn(statusColors[task.status])}>
                  {statusLabels[task.status] ?? task.status}
                </Badge>
                {task.frequency && (
                  <Badge variant="outline">{task.frequency}</Badge>
                )}
              </div>

              {task.description && (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {task.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                {task.nextDueDate && (
                  <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                    <Calendar className="h-4 w-4" />
                    <span>Due {format(new Date(task.nextDueDate), "MMM d, yyyy")}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <Calendar className="h-4 w-4" />
                  <span>Created {format(new Date(task.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 text-sm font-semibold text-[hsl(var(--foreground))]">
                  Completion History
                </h4>
                {task.logs.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    No completion logs yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {task.logs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-lg border border-[hsl(var(--border))] p-3"
                      >
                        <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                          <span>
                            {format(new Date(log.performedAt), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                          {log.cost != null && (
                            <span className="flex items-center gap-1 font-medium">
                              <DollarSign className="h-3 w-3" />
                              {log.cost.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {log.performedBy && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                            <User className="h-3 w-3" />
                            {log.performedBy}
                          </div>
                        )}
                        {log.notes && (
                          <div className="mt-2 flex items-start gap-1 text-sm text-[hsl(var(--foreground))]">
                            <FileText className="mt-0.5 h-3 w-3 shrink-0 text-[hsl(var(--muted-foreground))]" />
                            {log.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-sm text-[hsl(var(--muted-foreground))]">
            Task not found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
