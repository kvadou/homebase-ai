"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  Edit3,
  Eye,
  MoreHorizontal,
  Trash2,
  LogOut,
  Clock,
  Users,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toaster";
import { InviteMemberDialog } from "@/components/homes/invite-member-dialog";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface HomeMembersProps {
  homeId: string;
  currentUserId: string;
}

const roleConfig: Record<
  string,
  { label: string; icon: React.ElementType; variant: "default" | "secondary" | "outline" }
> = {
  owner: { label: "Owner", icon: Crown, variant: "default" },
  editor: { label: "Editor", icon: Edit3, variant: "secondary" },
  viewer: { label: "Viewer", icon: Eye, variant: "outline" },
};

function getInitials(
  firstName: string | null,
  lastName: string | null,
  email: string
): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName[0]!.toUpperCase();
  }
  return email[0]!.toUpperCase();
}

function getDisplayName(
  firstName: string | null,
  lastName: string | null,
  email: string
): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  return email;
}

export function HomeMembers({ homeId, currentUserId }: HomeMembersProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [members, setMembers] = React.useState<Member[]>([]);
  const [pendingInvitations, setPendingInvitations] = React.useState<
    PendingInvitation[]
  >([]);
  const [currentUserRole, setCurrentUserRole] = React.useState<string | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // Confirm remove dialog
  const [removeTarget, setRemoveTarget] = React.useState<Member | null>(null);

  const isOwner = currentUserRole === "owner";

  const fetchMembers = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/homes/${homeId}/members`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.data.members);
        setPendingInvitations(data.data.pendingInvitations);
        setCurrentUserRole(data.data.currentUserRole);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [homeId, toast]);

  React.useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function handleRoleChange(userId: string, newRole: string) {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/homes/${homeId}/members/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Failed to change role",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Role updated",
        description: `Member role changed to ${newRole}.`,
        variant: "success",
      });

      fetchMembers();
    } catch {
      toast({
        title: "Error",
        description: "Failed to change role",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemoveMember() {
    if (!removeTarget) return;

    const userId = removeTarget.user.id;
    const isSelf = userId === currentUserId;

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/homes/${homeId}/members/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: isSelf ? "Cannot leave" : "Cannot remove member",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: isSelf ? "Left home" : "Member removed",
        description: isSelf
          ? "You have left this home."
          : `${getDisplayName(removeTarget.user.firstName, removeTarget.user.lastName, removeTarget.user.email)} has been removed.`,
        variant: "success",
      });

      if (isSelf) {
        router.push("/dashboard");
        router.refresh();
      } else {
        fetchMembers();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setRemoveTarget(null);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-teal-500" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-3"
              >
                <div className="h-10 w-10 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-[hsl(var(--muted))]" />
                  <div className="h-3 w-48 animate-pulse rounded bg-[hsl(var(--muted))]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-teal-500" />
            Members ({members.length})
          </CardTitle>
          {isOwner && (
            <InviteMemberDialog homeId={homeId} onInvited={fetchMembers} />
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Active members */}
          {members.map((member) => {
            const isSelf = member.user.id === currentUserId;
            const config = roleConfig[member.role] || roleConfig.viewer!;
            const RoleIcon = config.icon;
            const displayName = getDisplayName(
              member.user.firstName,
              member.user.lastName,
              member.user.email
            );
            const initials = getInitials(
              member.user.firstName,
              member.user.lastName,
              member.user.email
            );

            return (
              <div
                key={member.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-3 transition-colors",
                  actionLoading === member.user.id && "opacity-50"
                )}
              >
                {/* Avatar */}
                {member.user.imageUrl ? (
                  <img
                    src={member.user.imageUrl}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-sm font-medium text-teal-600">
                    {initials}
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {displayName}
                    </p>
                    {isSelf && (
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        (you)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                    {member.user.email}
                  </p>
                </div>

                {/* Role badge */}
                <Badge variant={config.variant} className="gap-1 shrink-0">
                  <RoleIcon className="h-3 w-3" />
                  {config.label}
                </Badge>

                {/* Actions (owner only, or self-remove) */}
                {(isOwner || isSelf) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        disabled={actionLoading === member.user.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isOwner && !isSelf && (
                        <>
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          {member.role !== "owner" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleChange(member.user.id, "owner")
                              }
                            >
                              <Crown className="h-4 w-4" />
                              Make Owner
                            </DropdownMenuItem>
                          )}
                          {member.role !== "editor" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleChange(member.user.id, "editor")
                              }
                            >
                              <Edit3 className="h-4 w-4" />
                              Make Editor
                            </DropdownMenuItem>
                          )}
                          {member.role !== "viewer" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleChange(member.user.id, "viewer")
                              }
                            >
                              <Eye className="h-4 w-4" />
                              Make Viewer
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {isOwner && !isSelf && (
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setRemoveTarget(member)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      )}
                      {isSelf && (
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setRemoveTarget(member)}
                        >
                          <LogOut className="h-4 w-4" />
                          Leave Home
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}

          {/* Pending invitations */}
          {pendingInvitations.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-2">
                <Shield className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  Pending Invitations
                </p>
              </div>
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 rounded-lg border border-dashed border-[hsl(var(--border))] p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
                    <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{inv.email}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Invited as {inv.role} — expires{" "}
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="warning" className="shrink-0">
                    Pending
                  </Badge>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirm Remove Dialog */}
      <Dialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {removeTarget?.user.id === currentUserId
                ? "Leave Home"
                : "Remove Member"}
            </DialogTitle>
            <DialogDescription>
              {removeTarget?.user.id === currentUserId
                ? "Are you sure you want to leave this home? You will lose access to all items and data."
                : `Are you sure you want to remove ${getDisplayName(removeTarget?.user.firstName ?? null, removeTarget?.user.lastName ?? null, removeTarget?.user.email ?? "")} from this home?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={actionLoading !== null}
            >
              {actionLoading
                ? "Processing..."
                : removeTarget?.user.id === currentUserId
                  ? "Leave Home"
                  : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
