"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  MessageSquare,
  LifeBuoy,
  Shield,
  ShieldOff,
  Loader2,
} from "lucide-react";

interface UserDetail {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  subscription: {
    plan: string;
    status: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  homes: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    role: string;
    itemCount: number;
    roomCount: number;
  }[];
  recentActivity: {
    chatSessions: {
      id: string;
      title: string | null;
      updatedAt: string;
    }[];
    supportTickets: {
      id: string;
      subject: string;
      status: string;
      createdAt: string;
    }[];
  };
}

interface UserDetailDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdminToggled: () => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case "active":
      return "success" as const;
    case "canceled":
      return "destructive" as const;
    case "past_due":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

export function UserDetailDialog({
  userId,
  open,
  onOpenChange,
  onAdminToggled,
}: UserDetailDialogProps) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [confirmAdmin, setConfirmAdmin] = useState(false);

  const fetchUser = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const json = await res.json();
      if (json.success) {
        setUser(json.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId && open) {
      fetchUser(userId);
      setConfirmAdmin(false);
    }
    if (!open) {
      setUser(null);
      setConfirmAdmin(false);
    }
  }, [userId, open, fetchUser]);

  async function handleToggleAdmin() {
    if (!user) return;

    if (!confirmAdmin) {
      setConfirmAdmin(true);
      return;
    }

    setToggling(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: !user.isAdmin }),
      });
      const json = await res.json();
      if (json.success) {
        setUser((prev) => prev ? { ...prev, isAdmin: !prev.isAdmin } : null);
        onAdminToggled();
      }
    } finally {
      setToggling(false);
      setConfirmAdmin(false);
    }
  }

  const displayName =
    user?.firstName || user?.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : user?.email || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View and manage user account information.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-xl font-semibold">
                  {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{displayName}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {user.email}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {user.isAdmin && <Badge variant="warning">Admin</Badge>}
                  <Badge variant="secondary">
                    Joined {formatDate(user.createdAt)}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Subscription */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Subscription
              </h4>
              {user.subscription ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))]">Plan:</span>{" "}
                    <span className="font-medium capitalize">{user.subscription.plan}</span>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))]">Status:</span>{" "}
                    <Badge variant={statusBadgeVariant(user.subscription.status)}>
                      {user.subscription.status}
                    </Badge>
                  </div>
                  {user.subscription.currentPeriodEnd && (
                    <div className="col-span-2">
                      <span className="text-[hsl(var(--muted-foreground))]">
                        Current period ends:
                      </span>{" "}
                      <span className="font-medium">
                        {formatDate(user.subscription.currentPeriodEnd)}
                      </span>
                      {user.subscription.cancelAtPeriodEnd && (
                        <Badge variant="warning" className="ml-2">
                          Canceling
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Free plan (no subscription)
                </p>
              )}
            </div>

            <Separator />

            {/* Homes */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Homes ({user.homes.length})
              </h4>
              {user.homes.length > 0 ? (
                <div className="space-y-2">
                  {user.homes.map((home) => (
                    <div
                      key={home.id}
                      className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-3"
                    >
                      <Home className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{home.name}</p>
                        {(home.city || home.state) && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {[home.city, home.state].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                        <span>{home.roomCount} rooms</span>
                        <span>{home.itemCount} items</span>
                        <Badge variant="outline" className="text-[10px]">
                          {home.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  No homes yet
                </p>
              )}
            </div>

            <Separator />

            {/* Recent Activity */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Recent Activity
              </h4>
              <div className="space-y-2">
                {user.recentActivity.chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-teal-500" />
                    <span className="flex-1 truncate">
                      {session.title || "Chat session"}
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {formatDate(session.updatedAt)}
                    </span>
                  </div>
                ))}
                {user.recentActivity.supportTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <LifeBuoy className="h-3.5 w-3.5 text-orange-500" />
                    <span className="flex-1 truncate">{ticket.subject}</span>
                    <Badge
                      variant={
                        ticket.status === "open"
                          ? "warning"
                          : ticket.status === "resolved"
                          ? "success"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                ))}
                {user.recentActivity.chatSessions.length === 0 &&
                  user.recentActivity.supportTickets.length === 0 && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      No recent activity
                    </p>
                  )}
              </div>
            </div>

            <Separator />

            {/* Admin Actions */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Admin Actions
              </h4>
              <div className="flex items-center gap-3">
                {confirmAdmin ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      {user.isAdmin
                        ? "Remove admin access?"
                        : "Grant admin access?"}
                    </span>
                    <Button
                      variant={user.isAdmin ? "destructive" : "default"}
                      size="sm"
                      onClick={handleToggleAdmin}
                      disabled={toggling}
                    >
                      {toggling && (
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      )}
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmAdmin(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant={user.isAdmin ? "outline" : "default"}
                    size="sm"
                    onClick={handleToggleAdmin}
                  >
                    {user.isAdmin ? (
                      <>
                        <ShieldOff className="mr-1 h-4 w-4" />
                        Remove Admin
                      </>
                    ) : (
                      <>
                        <Shield className="mr-1 h-4 w-4" />
                        Make Admin
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">
            User not found
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
