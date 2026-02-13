"use client";

import * as React from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Crown,
  Globe,
  Mail,
  MapPin,
  MessageSquarePlus,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RatingStars } from "./rating-stars";
import { ReviewList } from "./review-list";
import { CreateReviewDialog } from "./create-review-dialog";
import { ClaimProviderButton } from "./claim-provider-button";
import { ConnectStripeButton } from "./connect-stripe-button";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  authorName: string | null;
  createdAt: string;
}

interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Provider {
  id: string;
  name: string;
  company: string | null;
  specialty: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  rating: number | null;
  reviewCount: number;
  isVerified: boolean;
  featured?: boolean;
  isClaimable?: boolean;
  claimedByUserId?: string | null;
  stripeConnectId?: string | null;
  reviews: Review[];
  availability: Availability[];
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ProviderDetailProps {
  provider: Provider;
  onBack: () => void;
  onRefresh: () => void;
  currentUserId?: string | null;
}

export function ProviderDetail({ provider, onBack, onRefresh, currentUserId }: ProviderDetailProps) {
  const [reviewDialogOpen, setReviewDialogOpen] = React.useState(false);

  const isClaimedByCurrentUser =
    currentUserId != null && provider.claimedByUserId === currentUserId;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to directory
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {provider.name}
          </h2>
          {provider.isVerified && (
            <CheckCircle className="h-5 w-5 text-teal-500" />
          )}
          {provider.featured && (
            <Badge className="gap-1 border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              <Crown className="h-3 w-3" />
              Featured
            </Badge>
          )}
        </div>
        {provider.company && (
          <div className="mt-1 flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]">
            <Building2 className="h-4 w-4" />
            <span>{provider.company}</span>
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <RatingStars rating={provider.rating ?? 0} size="md" />
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {provider.rating?.toFixed(1) ?? "0.0"} ({provider.reviewCount}{" "}
            {provider.reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>

        {/* Marketplace Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <ClaimProviderButton
            providerId={provider.id}
            isClaimable={provider.isClaimable ?? false}
            claimedByUserId={provider.claimedByUserId ?? null}
            onClaimed={onRefresh}
          />
          <ConnectStripeButton
            providerId={provider.id}
            claimedByCurrentUser={isClaimedByCurrentUser}
            hasStripeConnect={!!provider.stripeConnectId}
          />
          {isClaimedByCurrentUser && provider.stripeConnectId && (
            <Badge variant="success" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Stripe Connected
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Contact Info */}
      <div className="grid gap-3 sm:grid-cols-2">
        {provider.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <a href={`tel:${provider.phone}`} className="hover:underline">
              {provider.phone}
            </a>
          </div>
        )}
        {provider.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <a href={`mailto:${provider.email}`} className="hover:underline">
              {provider.email}
            </a>
          </div>
        )}
        {provider.website && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <a
              href={provider.website}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:underline"
            >
              {provider.website}
            </a>
          </div>
        )}
        {provider.address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <span>{provider.address}</span>
          </div>
        )}
      </div>

      {/* Availability */}
      {provider.availability.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="mb-3 font-semibold text-[hsl(var(--foreground))]">Availability</h3>
            <div className="grid gap-1.5 text-sm">
              {provider.availability.map((a) => (
                <div key={a.id} className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">
                    {DAY_NAMES[a.dayOfWeek]}
                  </span>
                  <span>
                    {a.startTime} - {a.endTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Reviews */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-[hsl(var(--foreground))]">
            Reviews ({provider.reviewCount})
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setReviewDialogOpen(true)}
            className="gap-1.5"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Write Review
          </Button>
        </div>
        <ReviewList reviews={provider.reviews} />
      </div>

      <CreateReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        providerId={provider.id}
        providerName={provider.name}
        onCreated={onRefresh}
      />
    </div>
  );
}
