"use client";

import * as React from "react";
import { Search, Loader2, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiscoveredProviderCard } from "./discovered-provider-card";
import { ApiAttribution } from "./api-attribution";

interface DiscoveredProvider {
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

interface Home {
  id: string;
  name: string;
}

const SPECIALTIES = [
  { value: "plumber", label: "Plumber" },
  { value: "electrician", label: "Electrician" },
  { value: "hvac", label: "HVAC" },
  { value: "roofing", label: "Roofing" },
  { value: "landscaping", label: "Landscaping" },
  { value: "cleaning", label: "Cleaning" },
  { value: "pest control", label: "Pest Control" },
  { value: "appliance repair", label: "Appliance Repair" },
  { value: "locksmith", label: "Locksmith" },
  { value: "painter", label: "Painter" },
  { value: "general contractor", label: "General Contractor" },
];

const RADIUS_OPTIONS = [
  { value: "8047", label: "5 miles" },
  { value: "16093", label: "10 miles" },
  { value: "24140", label: "15 miles" },
  { value: "32187", label: "20 miles" },
  { value: "40234", label: "25 miles" },
];

interface DiscoverProvidersProps {
  homes: Home[];
}

export function DiscoverProviders({ homes }: DiscoverProvidersProps) {
  const [selectedHomeId, setSelectedHomeId] = React.useState(
    homes[0]?.id ?? ""
  );
  const [specialty, setSpecialty] = React.useState("");
  const [radius, setRadius] = React.useState("16093");
  const [results, setResults] = React.useState<DiscoveredProvider[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSearch = async () => {
    if (!selectedHomeId || !specialty) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const params = new URLSearchParams({
        homeId: selectedHomeId,
        specialty,
        radius,
      });

      const res = await fetch(`/api/providers/discover?${params}`);
      const data = await res.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error ?? "Failed to discover providers");
        setResults([]);
      }
    } catch {
      setError("Failed to discover providers");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const hasGoogleResults = results.some(
    (r) => r.source === "google" || r.source === "both"
  );
  const hasYelpResults = results.some(
    (r) => r.source === "yelp" || r.source === "both"
  );

  if (homes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10">
          <MapPin className="h-8 w-8 text-teal-500" />
        </div>
        <h3 className="font-semibold text-[hsl(var(--foreground))]">
          No homes added
        </h3>
        <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
          Add a home with an address first to discover nearby service providers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Home
          </label>
          <Select value={selectedHomeId} onValueChange={setSelectedHomeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a home" />
            </SelectTrigger>
            <SelectContent>
              {homes.map((home) => (
                <SelectItem key={home.id} value={home.id}>
                  {home.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Specialty
          </label>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger>
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              {SPECIALTIES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full space-y-1.5 sm:w-40">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Radius
          </label>
          <Select value={radius} onValueChange={setRadius}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RADIUS_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSearch}
          disabled={!selectedHomeId || !specialty || loading}
          className="gap-1.5 shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      )}

      {/* Results */}
      {!loading && searched && results.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10">
            <Search className="h-8 w-8 text-teal-500" />
          </div>
          <h3 className="font-semibold text-[hsl(var(--foreground))]">
            No providers found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
            Try expanding your search radius or selecting a different specialty.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Found {results.length} provider{results.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((provider, idx) => (
              <DiscoveredProviderCard
                key={`${provider.googlePlaceId ?? provider.yelpId ?? idx}`}
                provider={provider}
                specialty={specialty}
              />
            ))}
          </div>
          <ApiAttribution
            hasGoogle={hasGoogleResults}
            hasYelp={hasYelpResults}
          />
        </>
      )}
    </div>
  );
}
