/**
 * Yelp Fusion API integration for provider discovery
 */

import type { DiscoveredProvider } from "./provider-discovery";

// Map specialties to Yelp categories
const SPECIALTY_TO_YELP_CATEGORY: Record<string, string> = {
  plumber: "plumbing",
  electrician: "electricians",
  hvac: "hvac",
  roofing: "roofing",
  landscaping: "landscaping",
  cleaning: "homecleaning",
  "pest control": "pest_control",
  "appliance repair": "appliances_repair",
  locksmith: "locksmiths",
  painter: "painters",
  "general contractor": "contractors",
};

export async function searchYelp(
  lat: number,
  lng: number,
  specialty: string,
  radius: number
): Promise<DiscoveredProvider[]> {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    return [];
  }

  const normalizedSpecialty = specialty.toLowerCase();
  const category =
    SPECIALTY_TO_YELP_CATEGORY[normalizedSpecialty] ?? normalizedSpecialty;

  // Yelp max radius is 40000 meters
  const yelpRadius = Math.min(radius, 40000);

  try {
    const url = new URL("https://api.yelp.com/v3/businesses/search");
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lng.toString());
    url.searchParams.set("categories", category);
    url.searchParams.set("radius", yelpRadius.toString());
    url.searchParams.set("limit", "20");
    url.searchParams.set("sort_by", "rating");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      console.error("Yelp API error:", res.status);
      return [];
    }

    const data = await res.json();
    return mapYelpResults(data.businesses || []);
  } catch (error) {
    console.error("Yelp search failed:", error);
    return [];
  }
}

function mapYelpResults(
  businesses: Array<Record<string, unknown>>
): DiscoveredProvider[] {
  return businesses.map((biz) => {
    const location = biz.location as
      | { display_address?: string[] }
      | undefined;
    const address = location?.display_address?.join(", ") ?? null;

    return {
      name: (biz.name as string) ?? "Unknown",
      address,
      phone: (biz.display_phone as string) ?? null,
      website: (biz.url as string) ?? null,
      googleRating: null,
      googleReviewCount: null,
      yelpRating: (biz.rating as number) ?? null,
      yelpReviewCount: (biz.review_count as number) ?? null,
      googlePlaceId: null,
      yelpId: (biz.id as string) ?? null,
      distance: (biz.distance as number) ?? null,
      photoUrls: biz.image_url ? [biz.image_url as string] : [],
      priceLevel: (biz.price as string) ?? null,
      hoursJson: null,
      source: "yelp" as const,
    };
  });
}
