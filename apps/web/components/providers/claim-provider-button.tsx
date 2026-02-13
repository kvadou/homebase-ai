"use client";

import * as React from "react";
import { Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";

interface ClaimProviderButtonProps {
  providerId: string;
  isClaimable: boolean;
  claimedByUserId: string | null;
  onClaimed?: () => void;
}

export function ClaimProviderButton({
  providerId,
  isClaimable,
  claimedByUserId,
  onClaimed,
}: ClaimProviderButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  // Hide if already claimed
  if (!isClaimable || claimedByUserId) {
    return null;
  }

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(`/api/providers/${providerId}/claim`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "Profile Claimed",
          description: "You have successfully claimed this provider profile.",
          variant: "success",
        });
        onClaimed?.();
      } else {
        toast({
          title: "Claim Failed",
          description: data.error ?? "Could not claim this profile.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleClaim}
      disabled={loading}
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Crown className="h-4 w-4" />
      )}
      Claim Profile
    </Button>
  );
}
