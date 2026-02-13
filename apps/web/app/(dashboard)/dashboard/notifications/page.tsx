"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Shield,
  Wrench,
  AlertTriangle,
  Info,
  Loader2,
  CheckCheck,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  warranty_expiry: Shield,
  maintenance_due: Wrench,
  maintenance_overdue: AlertTriangle,
  recall_alert: AlertTriangle,
  system: Info,
};

const typeLabels: Record<string, string> = {
  warranty_expiry: "Warranty",
  maintenance_due: "Maintenance",
  maintenance_overdue: "Overdue",
  recall_alert: "Recall",
  system: "System",
};

const typeColors: Record<string, string> = {
  warranty_expiry: "text-amber-500",
  maintenance_due: "text-blue-500",
  maintenance_overdue: "text-red-500",
  recall_alert: "text-red-600",
  system: "text-[hsl(var(--muted-foreground))]",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);

        // Mark all unread as read
        const unreadIds = data.data
          .filter((n: Notification) => !n.read)
          .map((n: Notification) => n.id);
        if (unreadIds.length > 0) {
          await fetch("/api/notifications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notificationIds: unreadIds }),
          });
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const types = [...new Set(notifications.map((n) => n.type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
            <Bell className="h-5 w-5 text-teal-500" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
              Notifications
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        {types.map((type) => (
          <Button
            key={type}
            variant={filter === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(type)}
          >
            {typeLabels[type] || type}
          </Button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <CheckCheck className="h-12 w-12 text-teal-500" />
            <h3 className="mt-4 font-heading text-lg font-semibold">
              All caught up!
            </h3>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              No notifications to show.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            const colorClass = typeColors[n.type] || "";

            const inner = (
              <Card
                className={`transition-colors hover:bg-[hsl(var(--muted))]/30 ${
                  !n.read ? "border-teal-500/30 bg-teal-500/5" : ""
                }`}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${colorClass}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {n.title}
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        {typeLabels[n.type] || n.type}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                      {n.body}
                    </p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );

            return n.link ? (
              <Link key={n.id} href={n.link}>
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
