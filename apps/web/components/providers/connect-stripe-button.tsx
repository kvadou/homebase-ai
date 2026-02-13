"use client";

import * as React from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";

interface ConnectStripeButtonProps {
  providerId: string;
  claimedByCurrentUser: boolean;
  hasStripeConnect: boolean;
}

export function ConnectStripeButton({
  providerId,
  claimedByCurrentUser,
  hasStripeConnect,
}: ConnectStripeButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  // Only show if claimed by current user and no Stripe Connect yet
  if (!claimedByCurrentUser || hasStripeConnect) {
    return null;
  }

  const handleConnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(`/api/providers/${providerId}/connect`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        toast({
          title: "Connection Failed",
          description: data.error ?? "Could not start Stripe Connect onboarding.",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleConnect}
      disabled={loading}
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      Connect Stripe
    </Button>
  );
}
