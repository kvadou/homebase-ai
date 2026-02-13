"use client";

import * as React from "react";
import {
  MapPin,
  Phone,
  Globe,
  Star,
  Bookmark,
  Loader2,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DiscoveredProviderData {
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  yelpRating: number | null;
  yelpReviewCount: number | null;
  googlePlaceId: string | null;
  yelpId: string | null;
  distance: number | null;
  photoUrls: string[];
  priceLevel: string | null;
  hoursJson: unknown | null;
  source: "google" | "yelp" | "both";
}

interface DiscoveredProviderCardProps {
  provider: DiscoveredProviderData;
  specialty: string;
  onSaved?: () => void;
}

export function DiscoveredProviderCard({
  provider,
  specialty,
  onSaved,
}: DiscoveredProviderCardProps) {
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/providers/discover/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: provider.name,
          specialty,
          address: provider.address,
          phone: provider.phone,
          website: provider.website,
          googlePlaceId: provider.googlePlaceId,
          yelpId: provider.yelpId,
          googleRating: provider.googleRating,
          googleReviewCount: provider.googleReviewCount,
          yelpRating: provider.yelpRating,
          photoUrls: provider.photoUrls,
          priceLevel: provider.priceLevel,
          hoursJson: provider.hoursJson,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        onSaved?.();
      } else {
        setError(data.error ?? "Failed to save");
      }
    } catch {
      setError("Failed to save provider");
    } finally {
      setSaving(false);
    }
  };

  const distanceMiles =
    provider.distance != null
      ? (provider.distance / 1609.34).toFixed(1)
      : null;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-[hsl(var(--foreground))]">
              {provider.name}
            </h3>
            {provider.address && (
              <div className="mt-1 flex items-start gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-2">{provider.address}</span>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {provider.source === "both" && (
              <Badge variant="success" className="text-[10px]">
                Both
              </Badge>
            )}
            {distanceMiles && (
              <Badge variant="secondary">{distanceMiles} mi</Badge>
            )}
          </div>
        </div>

        {/* Ratings - displayed separately per Yelp TOS */}
        <div className="mt-3 flex flex-wrap gap-3">
          {provider.googleRating != null && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{provider.googleRating.toFixed(1)}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                Google
                {provider.googleReviewCount
                  ? ` (${provider.googleReviewCount})`
                  : ""}
              </span>
            </div>
          )}
          {provider.yelpRating != null && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-red-500 text-red-500" />
              <span className="font-medium">{provider.yelpRating.toFixed(1)}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                Yelp
                {provider.yelpReviewCount
                  ? ` (${provider.yelpReviewCount})`
                  : ""}
              </span>
            </div>
          )}
        </div>

        {/* Contact info */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[hsl(var(--muted-foreground))]">
          {provider.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{provider.phone}</span>
            </div>
          )}
          {provider.website && (
            <a
              href={provider.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-teal-600 hover:underline dark:text-teal-400"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="h-3 w-3" />
              <span>Website</span>
            </a>
          )}
        </div>

        {/* Price level */}
        {provider.priceLevel && (
          <div className="mt-2">
            <Badge variant="outline" className="text-[10px]">
              {provider.priceLevel}
            </Badge>
          </div>
        )}

        {/* Save button */}
        <div className="mt-3 border-t border-[hsl(var(--border))] pt-3">
          {saved ? (
            <Button size="sm" variant="outline" disabled className="w-full gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Saved to Providers
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
              Save to My Providers
            </Button>
          )}
          {error && (
            <p className="mt-1 text-xs text-red-500">{error}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
