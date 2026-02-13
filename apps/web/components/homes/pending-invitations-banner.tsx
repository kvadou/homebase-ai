"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Home, UserPlus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  home: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
  };
}

export function PendingInvitationsBanner() {
  const router = useRouter();
  const { toast } = useToast();
  const [invitations, setInvitations] = React.useState<Invitation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [respondingTo, setRespondingTo] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchInvitations() {
      try {
        const res = await fetch("/api/invitations");
        const data = await res.json();
        if (data.success) {
          setInvitations(data.data);
        }
      } catch {
        // Silently fail — banner just won't show
      } finally {
        setLoading(false);
      }
    }

    fetchInvitations();
  }, []);

  async function handleRespond(token: string, action: "accept" | "decline") {
    setRespondingTo(token);
    try {
      const res = await fetch(`/api/invitations/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to respond to invitation",
          variant: "destructive",
        });
        return;
      }

      if (action === "accept") {
        toast({
          title: "Invitation accepted",
          description: `You have joined "${data.data.homeName}".`,
          variant: "success",
        });
        router.refresh();
      } else {
        toast({
          title: "Invitation declined",
          description: `You have declined the invitation.`,
        });
      }

      // Remove from list
      setInvitations((prev) => prev.filter((inv) => inv.token !== token));
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setRespondingTo(null);
    }
  }

  if (loading || invitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => (
        <Card
          key={invitation.id}
          className="border-teal-200 bg-teal-50/50 dark:border-teal-900/50 dark:bg-teal-950/20"
        >
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500/10">
                <UserPlus className="h-5 w-5 text-teal-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  You&apos;ve been invited to join{" "}
                  <span className="font-semibold">
                    {invitation.home.name}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {invitation.home.city && (
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      <Home className="inline h-3 w-3 mr-0.5" />
                      {invitation.home.city}
                      {invitation.home.state
                        ? `, ${invitation.home.state}`
                        : ""}
                    </span>
                  )}
                  <Badge variant="secondary" className="text-[10px]">
                    as {invitation.role}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRespond(invitation.token, "decline")}
                disabled={respondingTo === invitation.token}
                className="gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => handleRespond(invitation.token, "accept")}
                disabled={respondingTo === invitation.token}
                className="gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                {respondingTo === invitation.token ? "Joining..." : "Accept"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
