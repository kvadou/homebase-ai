"use client";

import * as React from "react";
import { format } from "date-fns";
import { Copy, Check, Link2, ShieldOff, ExternalLink, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";

interface SharePassportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homeId: string;
  shareToken: string | null;
  shareExpiresAt: string | null;
  isPublic: boolean;
  onShareCreated: (data: {
    shareToken: string;
    shareUrl: string;
    shareExpiresAt: string;
    isPublic: boolean;
  }) => void;
  onShareRevoked: () => void;
}

export function SharePassportDialog({
  open,
  onOpenChange,
  homeId,
  shareToken,
  shareExpiresAt,
  isPublic,
  onShareCreated,
  onShareRevoked,
}: SharePassportDialogProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isRevoking, setIsRevoking] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const shareUrl = shareToken
    ? `${window.location.origin}/passport/${shareToken}`
    : null;

  async function handleGenerateLink() {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/homes/${homeId}/passport/share`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        onShareCreated(json.data);
        toast({
          title: "Share link created",
          description: "Anyone with this link can view your home passport.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: json.error || "Failed to generate share link",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRevokeAccess() {
    setIsRevoking(true);
    try {
      const res = await fetch(`/api/homes/${homeId}/passport/share`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        onShareRevoked();
        toast({
          title: "Access revoked",
          description: "The share link has been deactivated.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: json.error || "Failed to revoke access",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to revoke access",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Share link copied to clipboard.",
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Home Passport</DialogTitle>
          <DialogDescription>
            {isPublic && shareToken
              ? "Your home passport is currently shared. Anyone with the link can view it."
              : "Create a shareable link to your home passport. The link expires after 30 days."}
          </DialogDescription>
        </DialogHeader>

        {isPublic && shareUrl ? (
          <div className="space-y-4">
            {/* Share link display */}
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-3 py-2">
                <p className="truncate text-sm font-mono">{shareUrl}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Expiration info */}
            {shareExpiresAt && (
              <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                <Link2 className="h-3.5 w-3.5" />
                <span>
                  Expires on{" "}
                  {format(new Date(shareExpiresAt), "MMMM d, yyyy")}
                </span>
              </div>
            )}

            {/* Open in new tab */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => window.open(shareUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Open Shared Page
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10">
              <Link2 className="h-6 w-6 text-teal-500" />
            </div>
            <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
              Generate a link to share your home passport with buyers, agents,
              inspectors, or anyone else.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {isPublic && shareToken ? (
            <Button
              variant="destructive"
              onClick={handleRevokeAccess}
              disabled={isRevoking}
              className="gap-2"
            >
              {isRevoking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldOff className="h-4 w-4" />
              )}
              Revoke Access
            </Button>
          ) : (
            <Button
              onClick={handleGenerateLink}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              Generate Share Link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
