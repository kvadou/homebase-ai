"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Search, UserPlus, UserMinus, RefreshCw } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export function AdminUsersSettings() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<AdminUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: AdminUser | null;
    action: "promote" | "demote";
  }>({ open: false, user: null, action: "promote" });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users?limit=100");
      const json = await res.json();
      if (json.success) {
        setAdmins(
          json.data.users.filter((u: AdminUser) => u.isAdmin)
        );
      }
    } catch {
      setError("Failed to fetch admin users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/users?search=${encodeURIComponent(searchEmail.trim())}&limit=10`
      );
      const json = await res.json();
      if (json.success) {
        setSearchResults(json.data.users);
      } else {
        setError(json.error || "Search failed");
      }
    } catch {
      setError("Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const handleToggleAdmin = async () => {
    if (!confirmDialog.user) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${confirmDialog.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAdmin: confirmDialog.action === "promote",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setConfirmDialog({ open: false, user: null, action: "promote" });
        setSearchResults([]);
        setSearchEmail("");
        await fetchAdmins();
      } else {
        setError(json.error || "Failed to update user");
      }
    } catch {
      setError("Failed to update user role");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-teal-500" />
            Current Administrators
          </CardTitle>
          <CardDescription>Users with admin access to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-[hsl(var(--muted))]"
                />
              ))}
            </div>
          ) : admins.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              No admin users found.
            </p>
          ) : (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {admin.imageUrl ? (
                      <img
                        src={admin.imageUrl}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-sm font-medium text-teal-500">
                        {(admin.firstName?.[0] || admin.email[0]).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {admin.firstName || admin.lastName
                          ? `${admin.firstName || ""} ${admin.lastName || ""}`.trim()
                          : admin.email}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {admin.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Admin</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() =>
                        setConfirmDialog({
                          open: true,
                          user: admin,
                          action: "demote",
                        })
                      }
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-teal-500" />
            Promote User to Admin
          </CardTitle>
          <CardDescription>Search for a user by email to grant admin access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={searching || !searchEmail.trim()}>
              {searching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                Search Results
              </p>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-sm font-medium">
                        {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {user.firstName || user.lastName
                          ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                          : user.email}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.isAdmin ? (
                      <Badge variant="success">Already Admin</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          setConfirmDialog({
                            open: true,
                            user,
                            action: "promote",
                          })
                        }
                      >
                        <UserPlus className="mr-1 h-4 w-4" />
                        Make Admin
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog({ open: false, user: null, action: "promote" });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "promote"
                ? "Promote to Admin"
                : "Remove Admin Access"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === "promote"
                ? `Are you sure you want to grant admin access to ${confirmDialog.user?.email}? They will have full access to the admin portal.`
                : `Are you sure you want to remove admin access from ${confirmDialog.user?.email}? They will lose access to the admin portal.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ open: false, user: null, action: "promote" })
              }
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.action === "demote" ? "destructive" : "default"}
              onClick={handleToggleAdmin}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
              ) : null}
              {confirmDialog.action === "promote" ? "Promote" : "Remove Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
