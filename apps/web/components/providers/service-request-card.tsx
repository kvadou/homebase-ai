import { Calendar, DollarSign, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; className?: string }> = {
  pending: { variant: "warning" },
  scheduled: { variant: "default", className: "bg-blue-100 text-blue-800 border-transparent dark:bg-blue-900/30 dark:text-blue-400" },
  in_progress: { variant: "default", className: "bg-indigo-100 text-indigo-800 border-transparent dark:bg-indigo-900/30 dark:text-indigo-400" },
  completed: { variant: "success" },
  cancelled: { variant: "secondary" },
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "text-[hsl(var(--muted-foreground))]",
  medium: "text-amber-600",
  high: "text-orange-600",
  urgent: "text-red-600",
};

interface ServiceRequestCardProps {
  request: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string | null;
    scheduledAt: string | null;
    completedAt: string | null;
    cost: number | null;
    home?: { id: string; name: string } | null;
    provider?: { id: string; name: string; specialty: string } | null;
  };
}

export function ServiceRequestCard({ request }: ServiceRequestCardProps) {
  const statusStyle = STATUS_STYLES[request.status] ?? STATUS_STYLES.pending;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-[hsl(var(--foreground))]">
              {request.title}
            </h4>
            {request.description && (
              <p className="mt-1 line-clamp-2 text-sm text-[hsl(var(--muted-foreground))]">
                {request.description}
              </p>
            )}
          </div>
          <Badge
            variant={statusStyle.variant}
            className={statusStyle.className}
          >
            {STATUS_LABELS[request.status] ?? request.status}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[hsl(var(--muted-foreground))]">
          {request.home && (
            <div className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              <span>{request.home.name}</span>
            </div>
          )}
          {request.provider && (
            <span>
              {request.provider.name} ({request.provider.specialty})
            </span>
          )}
          {request.priority && (
            <span className={cn("font-medium capitalize", PRIORITY_STYLES[request.priority])}>
              {request.priority}
            </span>
          )}
          {request.scheduledAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(request.scheduledAt).toLocaleDateString()}</span>
            </div>
          )}
          {request.cost != null && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>${request.cost.toFixed(2)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
