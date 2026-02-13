import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { geocodeAddress } from "@/lib/geocode";
import { discoverProviders } from "@/lib/provider-discovery";
import { getCached, setCached, getCacheKey } from "@/lib/provider-cache";

const DEFAULT_RADIUS_METERS = 16093; // 10 miles

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(req.url);
    const homeId = searchParams.get("homeId");
    const specialty = searchParams.get("specialty");
    const radiusParam = searchParams.get("radius");

    if (!homeId || !specialty) {
      return NextResponse.json(
        { success: false, error: "homeId and specialty are required" },
        { status: 400 }
      );
    }

    const radius = radiusParam
      ? parseInt(radiusParam, 10)
      : DEFAULT_RADIUS_METERS;

    // Verify home ownership
    const homeUser = await prisma.homeUser.findUnique({
      where: {
        userId_homeId: { userId: user.id, homeId },
      },
      include: { home: true },
    });

    if (!homeUser) {
      return NextResponse.json(
        { success: false, error: "Home not found" },
        { status: 404 }
      );
    }

    const home = homeUser.home;

    // Get or compute lat/lng
    let lat = home.latitude;
    let lng = home.longitude;

    if (lat == null || lng == null) {
      // Try to geocode
      if (home.address && home.city && home.state && home.zipCode) {
        const coords = await geocodeAddress(
          home.address,
          home.city,
          home.state,
          home.zipCode
        );

        if (coords) {
          lat = coords.lat;
          lng = coords.lng;

          // Update home with geocoded coords
          await prisma.home.update({
            where: { id: homeId },
            data: { latitude: lat, longitude: lng },
          });
        }
      }

      if (lat == null || lng == null) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Could not determine home location. Please ensure the home has a complete address.",
          },
          { status: 400 }
        );
      }
    }

    // Check cache
    const cacheKey = getCacheKey(homeId, specialty, radius);
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached, cached: true });
    }

    // Discover providers
    const providers = await discoverProviders(lat, lng, specialty, radius);

    // Cache results
    setCached(cacheKey, providers);

    return NextResponse.json({ success: true, data: providers, cached: false });
  } catch (error) {
    console.error("Provider discovery error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to discover providers" },
      { status: 500 }
    );
  }
}
