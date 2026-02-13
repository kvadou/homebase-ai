"use client";

import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface NotificationDropdownProps {
  onClose: () => void;
  onRead: () => void;
}

export function NotificationDropdown({ onClose, onRead }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data);

          // Mark unread ones as read
          const unreadIds = data.data
            .filter((n: Notification) => !n.read)
            .map((n: Notification) => n.id);
          if (unreadIds.length > 0) {
            await fetch("/api/notifications", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ notificationIds: unreadIds }),
            });
            onRead();
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [onRead]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-lg sm:w-96"
    >
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-3">
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
          Notifications
        </h3>
        <Link
          href="/dashboard/notifications"
          onClick={onClose}
          className="text-xs text-teal-500 hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--muted-foreground))]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCheck className="mb-2 h-6 w-6 text-teal-500" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              All caught up!
            </p>
          </div>
        ) : (
          notifications.slice(0, 10).map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            const content = (
              <div
                className={`flex gap-3 border-b border-[hsl(var(--border))] p-3 transition-colors hover:bg-[hsl(var(--muted))]/50 ${
                  !n.read ? "bg-teal-500/5" : ""
                }`}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
                    {n.body}
                  </p>
                  <p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.read && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                )}
              </div>
            );

            return n.link ? (
              <Link key={n.id} href={n.link} onClick={onClose}>
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })
        )}
      </div>
    </div>
  );
}
