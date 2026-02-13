/**
 * Provider discovery: merges Google Places + Yelp results
 */

import { searchGooglePlaces } from "./google-places";
import { searchYelp } from "./yelp";

export interface DiscoveredProvider {
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

export async function discoverProviders(
  lat: number,
  lng: number,
  specialty: string,
  radius: number
): Promise<DiscoveredProvider[]> {
  // Fetch from both sources in parallel
  const [googleResults, yelpResults] = await Promise.all([
    searchGooglePlaces(lat, lng, specialty, radius),
    searchYelp(lat, lng, specialty, radius),
  ]);

  // Merge and deduplicate
  return mergeResults(googleResults, yelpResults);
}

function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function isSimilar(a: string, b: string): boolean {
  const normA = normalizeForComparison(a);
  const normB = normalizeForComparison(b);

  if (normA === normB) return true;
  if (normA.includes(normB) || normB.includes(normA)) return true;

  // Simple similarity check: if 80% of shorter string is found in longer
  const shorter = normA.length <= normB.length ? normA : normB;
  const longer = normA.length > normB.length ? normA : normB;

  if (shorter.length < 3) return false;

  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }

  return matches / shorter.length > 0.8;
}

function mergeResults(
  googleResults: DiscoveredProvider[],
  yelpResults: DiscoveredProvider[]
): DiscoveredProvider[] {
  const merged: DiscoveredProvider[] = [...googleResults];
  const matchedYelpIds = new Set<number>();

  // Try to match Yelp results with Google results
  for (let gi = 0; gi < merged.length; gi++) {
    const gProvider = merged[gi];
    for (let yi = 0; yi < yelpResults.length; yi++) {
      if (matchedYelpIds.has(yi)) continue;

      const yProvider = yelpResults[yi];

      // Match by name similarity
      if (isSimilar(gProvider.name, yProvider.name)) {
        // Merge Yelp data into Google result
        merged[gi] = {
          ...gProvider,
          yelpRating: yProvider.yelpRating,
          yelpReviewCount: yProvider.yelpReviewCount,
          yelpId: yProvider.yelpId,
          distance: yProvider.distance ?? gProvider.distance,
          source: "both",
        };
        matchedYelpIds.add(yi);
        break;
      }
    }
  }

  // Add unmatched Yelp results
  for (let yi = 0; yi < yelpResults.length; yi++) {
    if (!matchedYelpIds.has(yi)) {
      merged.push(yelpResults[yi]);
    }
  }

  // Sort by combined rating (prefer providers with ratings from both sources)
  merged.sort((a, b) => {
    const scoreA = computeScore(a);
    const scoreB = computeScore(b);
    return scoreB - scoreA;
  });

  return merged;
}

function computeScore(provider: DiscoveredProvider): number {
  let score = 0;
  let ratingCount = 0;

  if (provider.googleRating != null) {
    score += provider.googleRating;
    ratingCount++;
  }
  if (provider.yelpRating != null) {
    score += provider.yelpRating;
    ratingCount++;
  }

  if (ratingCount === 0) return 0;

  // Average rating + bonus for having both sources
  const avgRating = score / ratingCount;
  const sourceBonus = provider.source === "both" ? 0.5 : 0;

  return avgRating + sourceBonus;
}
