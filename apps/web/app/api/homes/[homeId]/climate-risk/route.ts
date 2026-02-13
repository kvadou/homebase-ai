import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { geocodeAddress } from "@/lib/geocode";
import { getClimateRiskProfile } from "@/lib/climate-risk";

interface Context {
  params: Promise<{ homeId: string }>;
}

export async function GET(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { homeId } = await ctx.params;

    // Verify ownership
    const home = await prisma.home.findFirst({
      where: {
        id: homeId,
        users: { some: { userId: user.id } },
      },
    });

    if (!home) {
      return NextResponse.json(
        { success: false, error: "Home not found" },
        { status: 404 }
      );
    }

    // Get or compute lat/lng
    let lat = home.latitude;
    let lng = home.longitude;

    if (lat == null || lng == null) {
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

    if (!home.state) {
      return NextResponse.json(
        {
          success: false,
          error: "Home state is required for climate risk assessment.",
        },
        { status: 400 }
      );
    }

    const profile = await getClimateRiskProfile(lat, lng, home.state);

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("Climate risk error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assess climate risk" },
      { status: 500 }
    );
  }
}
