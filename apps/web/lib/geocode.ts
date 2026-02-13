/**
 * Geocoding utility using Google Geocoding API
 */

interface GeocodeResult {
  lat: number;
  lng: number;
}

export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<GeocodeResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY not set, geocoding unavailable");
    return null;
  }

  const fullAddress = [address, city, state, zipCode]
    .filter(Boolean)
    .join(", ");

  if (!fullAddress.trim()) {
    return null;
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", fullAddress);
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error("Geocoding API error:", res.status);
      return null;
    }

    const data = await res.json();

    if (data.status !== "OK" || !data.results?.length) {
      return null;
    }

    const location = data.results[0].geometry?.location;
    if (!location?.lat || !location?.lng) {
      return null;
    }

    return { lat: location.lat, lng: location.lng };
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
}
