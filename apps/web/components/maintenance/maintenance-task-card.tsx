"use client";

import { formatDistanceToNow, format, isPast } from "date-fns";
import {
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  SkipForward,
  MoreVertical,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface MaintenanceTaskData {
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
  _count?: { logs: number };
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "bg-red-100 text-red-800 border-red-200" },
  high: { label: "High", className: "bg-orange-100 text-orange-800 border-orange-200" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  low: { label: "Low", className: "bg-green-100 text-green-800 border-green-200" },
};

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  overdue: {
    label: "Overdue",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="h-3 w-3" />,
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Wrench className="h-3 w-3" />,
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  skipped: {
    label: "Skipped",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: <SkipForward className="h-3 w-3" />,
  },
};

interface MaintenanceTaskCardProps {
  task: MaintenanceTaskData;
  onClick: (task: MaintenanceTaskData) => void;
  onMarkComplete: (task: MaintenanceTaskData) => void;
  onDelete: (task: MaintenanceTaskData) => void;
}

export function MaintenanceTaskCard({
  task,
  onClick,
  onMarkComplete,
  onDelete,
}: MaintenanceTaskCardProps) {
  const priority = priorityConfig[task.priority ?? "medium"] ?? priorityConfig.medium;
  const isOverdue =
    task.status !== "completed" &&
    task.status !== "skipped" &&
    task.nextDueDate &&
    isPast(new Date(task.nextDueDate));
  const displayStatus = isOverdue ? "overdue" : task.status;
  const status = statusConfig[displayStatus] ?? statusConfig.pending;

  return (
    <Card
      className={cn(
        "group relative cursor-pointer p-4 transition-all hover:shadow-md",
        isOverdue && "border-red-300"
      )}
      onClick={() => onClick(task)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">
              {task.title}
            </h3>
            <Badge className={cn("text-[10px]", priority.className)}>
              {priority.label}
            </Badge>
            <Badge className={cn("gap-1 text-[10px]", status.className)}>
              {status.icon}
              {status.label}
            </Badge>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {task.item.name}
            {task.item.room && <span> &middot; {task.item.room.name}</span>}
            <span> &middot; {task.item.home.name}</span>
          </p>
          {task.nextDueDate && (
            <div className="mt-2 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
              <Calendar className="h-3 w-3" />
              <span>
                {isOverdue
                  ? `Overdue by ${formatDistanceToNow(new Date(task.nextDueDate))}`
                  : `Due ${format(new Date(task.nextDueDate), "MMM d, yyyy")}`}
              </span>
            </div>
          )}
          {task.frequency && (
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              Repeats: {task.frequency}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {task.status !== "completed" && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkComplete(task);
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Complete
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task);
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
