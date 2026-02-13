import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const body = await req.json();
    const {
      name,
      specialty,
      address,
      phone,
      website,
      googlePlaceId,
      yelpId,
      googleRating,
      googleReviewCount,
      yelpRating,
      photoUrls,
      priceLevel,
      hoursJson,
    } = body;

    if (!name || !specialty) {
      return NextResponse.json(
        { success: false, error: "name and specialty are required" },
        { status: 400 }
      );
    }

    // Check if provider already exists by googlePlaceId or yelpId
    if (googlePlaceId) {
      const existing = await prisma.providerProfile.findUnique({
        where: { googlePlaceId },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Provider already saved" },
          { status: 409 }
        );
      }
    }

    if (yelpId) {
      const existing = await prisma.providerProfile.findUnique({
        where: { yelpId },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Provider already saved" },
          { status: 409 }
        );
      }
    }

    const provider = await prisma.providerProfile.create({
      data: {
        name,
        specialty,
        address: address ?? null,
        phone: phone ?? null,
        website: website ?? null,
        googlePlaceId: googlePlaceId ?? null,
        yelpId: yelpId ?? null,
        rating: googleRating ?? yelpRating ?? null,
        reviewCount: googleReviewCount ?? 0,
        source: "discovered",
        photoUrls: photoUrls ?? [],
        priceLevel: priceLevel ?? null,
        hoursJson: hoursJson ?? null,
      },
    });

    return NextResponse.json(
      { success: true, data: provider },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save provider error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save provider" },
      { status: 500 }
    );
  }
}
