import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const giftPassportSchema = z.object({
  buyerEmail: z.string().email("Valid email required"),
  buyerName: z.string().min(1, "Buyer name is required").max(200),
  homeAddress: z.string().min(1, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  zipCode: z.string().min(1, "ZIP code is required").max(20),
  personalMessage: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const parsed = giftPassportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    // Verify user has a realtor account
    const realtorAccount = await prisma.realtorAccount.findUnique({
      where: { userId: user.id },
    });

    if (!realtorAccount) {
      return NextResponse.json(
        { success: false, error: "Realtor account required" },
        { status: 403 }
      );
    }

    // Create a home for the buyer and an invitation
    const home = await prisma.home.create({
      data: {
        name: `${parsed.data.buyerName}'s Home`,
        address: parsed.data.homeAddress,
        city: parsed.data.city,
        state: parsed.data.state,
        zipCode: parsed.data.zipCode,
      },
    });

    // Create an invitation for the buyer
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day expiry for gifted passports

    const invitation = await prisma.homeInvitation.create({
      data: {
        homeId: home.id,
        email: parsed.data.buyerEmail,
        role: "owner",
        invitedBy: user.id,
        token,
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          homeId: home.id,
          invitationId: invitation.id,
          buyerEmail: parsed.data.buyerEmail,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to gift passport" },
      { status: 500 }
    );
  }
}
