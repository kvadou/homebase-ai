/**
 * Google Places API (New) integration for provider discovery
 */

import type { DiscoveredProvider } from "./provider-discovery";

// Map specialties to Google place types that support searchNearby
const SPECIALTY_TO_PLACE_TYPE: Record<string, string> = {
  plumber: "plumber",
  electrician: "electrician",
  roofing: "roofing_contractor",
  locksmith: "locksmith",
  painter: "painter",
  "general contractor": "general_contractor",
};

// Specialties that need text search (no direct place type)
const TEXT_SEARCH_SPECIALTIES = [
  "hvac",
  "landscaping",
  "cleaning",
  "pest control",
  "appliance repair",
];

export async function searchGooglePlaces(
  lat: number,
  lng: number,
  specialty: string,
  radius: number
): Promise<DiscoveredProvider[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return [];
  }

  const normalizedSpecialty = specialty.toLowerCase();
  const placeType = SPECIALTY_TO_PLACE_TYPE[normalizedSpecialty];

  if (placeType) {
    return searchNearby(lat, lng, placeType, radius, apiKey);
  }

  if (
    TEXT_SEARCH_SPECIALTIES.some((s) => normalizedSpecialty.includes(s))
  ) {
    return textSearch(lat, lng, specialty, radius, apiKey);
  }

  // Fallback to text search for unknown specialties
  return textSearch(lat, lng, specialty, radius, apiKey);
}

async function searchNearby(
  lat: number,
  lng: number,
  placeType: string,
  radius: number,
  apiKey: string
): Promise<DiscoveredProvider[]> {
  try {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.id,places.photos,places.priceLevel,places.currentOpeningHours",
        },
        body: JSON.stringify({
          includedTypes: [placeType],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius,
            },
          },
        }),
      }
    );

    if (!res.ok) {
      console.error("Google Places searchNearby error:", res.status);
      return [];
    }

    const data = await res.json();
    return mapGoogleResults(data.places || [], lat, lng);
  } catch (error) {
    console.error("Google Places searchNearby failed:", error);
    return [];
  }
}

async function textSearch(
  lat: number,
  lng: number,
  specialty: string,
  radius: number,
  apiKey: string
): Promise<DiscoveredProvider[]> {
  try {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.id,places.photos,places.priceLevel,places.currentOpeningHours",
        },
        body: JSON.stringify({
          textQuery: `${specialty} near me`,
          maxResultCount: 20,
          locationBias: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius,
            },
          },
        }),
      }
    );

    if (!res.ok) {
      console.error("Google Places textSearch error:", res.status);
      return [];
    }

    const data = await res.json();
    return mapGoogleResults(data.places || [], lat, lng);
  } catch (error) {
    console.error("Google Places textSearch failed:", error);
    return [];
  }
}

function mapGoogleResults(
  places: Array<Record<string, unknown>>,
  _lat: number,
  _lng: number
): DiscoveredProvider[] {
  return places.map((place) => {
    const displayName = place.displayName as
      | { text: string; languageCode: string }
      | undefined;
    const photos = place.photos as Array<{ name: string }> | undefined;

    return {
      name: displayName?.text ?? "Unknown",
      address: (place.formattedAddress as string) ?? null,
      phone: (place.nationalPhoneNumber as string) ?? null,
      website: (place.websiteUri as string) ?? null,
      googleRating: (place.rating as number) ?? null,
      googleReviewCount: (place.userRatingCount as number) ?? null,
      yelpRating: null,
      yelpReviewCount: null,
      googlePlaceId: (place.id as string) ?? null,
      yelpId: null,
      distance: null,
      photoUrls: photos?.slice(0, 3).map((p) => p.name) ?? [],
      priceLevel: (place.priceLevel as string) ?? null,
      hoursJson: place.currentOpeningHours ?? null,
      source: "google" as const,
    };
  });
}
