"use client";

import * as React from "react";
import { Building2, CheckCircle, CreditCard, Crown, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "./rating-stars";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  provider: {
    id: string;
    name: string;
    company: string | null;
    specialty: string;
    phone: string | null;
    email: string | null;
    rating: number | null;
    reviewCount: number;
    isVerified: boolean;
    featured?: boolean;
    isClaimable?: boolean;
    claimedByUserId?: string | null;
    stripeConnectId?: string | null;
  };
  onClick: (id: string) => void;
  isSelected?: boolean;
  currentUserId?: string | null;
  onClaimed?: () => void;
}

export function ProviderCard({
  provider,
  onClick,
  isSelected,
  currentUserId,
  onClaimed,
}: ProviderCardProps) {
  const isFeatured = provider.featured ?? false;
  const isClaimedByCurrentUser =
    currentUserId != null && provider.claimedByUserId === currentUserId;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-teal-500",
        isFeatured && "ring-1 ring-amber-400/50"
      )}
      onClick={() => onClick(provider.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-[hsl(var(--foreground))]">
                {provider.name}
              </h3>
              {provider.isVerified && (
                <CheckCircle className="h-4 w-4 shrink-0 text-teal-500" />
              )}
            </div>
            {provider.company && (
              <div className="mt-0.5 flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                <Building2 className="h-3.5 w-3.5" />
                <span className="truncate">{provider.company}</span>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {isFeatured && (
              <Badge className="gap-1 border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                <Crown className="h-3 w-3" />
                Featured
              </Badge>
            )}
            <Badge variant="secondary">
              {provider.specialty}
            </Badge>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <RatingStars rating={provider.rating ?? 0} />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            ({provider.reviewCount} {provider.reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[hsl(var(--muted-foreground))]">
          {provider.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{provider.phone}</span>
            </div>
          )}
          {provider.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate">{provider.email}</span>
            </div>
          )}
        </div>

        {/* Marketplace actions */}
        {(provider.isClaimable || isClaimedByCurrentUser) && (
          <div
            className="mt-3 flex flex-wrap gap-2 border-t border-[hsl(var(--border))] pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            {provider.isClaimable && !provider.claimedByUserId && (
              <ClaimProviderButtonInline
                providerId={provider.id}
                onClaimed={onClaimed}
              />
            )}
            {isClaimedByCurrentUser && !provider.stripeConnectId && (
              <ConnectStripeButtonInline providerId={provider.id} />
            )}
            {isClaimedByCurrentUser && provider.stripeConnectId && (
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Stripe Connected
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Inline versions to avoid circular imports and keep the card self-contained

function ClaimProviderButtonInline({
  providerId,
  onClaimed,
}: {
  providerId: string;
  onClaimed?: () => void;
}) {
  const [loading, setLoading] = React.useState(false);

  const handleClaim = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/providers/${providerId}/claim`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        onClaimed?.();
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClaim}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--accent))] disabled:opacity-50"
    >
      {loading ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Crown className="h-3 w-3" />
      )}
      Claim
    </button>
  );
}

function ConnectStripeButtonInline({ providerId }: { providerId: string }) {
  const [loading, setLoading] = React.useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/providers/${providerId}/connect`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--accent))] disabled:opacity-50"
    >
      {loading ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <CreditCard className="h-3 w-3" />
      )}
      Connect Stripe
    </button>
  );
}
