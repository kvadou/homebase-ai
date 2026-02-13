import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Context {
  params: Promise<{ providerId: string }>;
}

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { providerId } = await ctx.params;

    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: "Provider not found" },
        { status: 404 }
      );
    }

    if (!provider.isClaimable) {
      return NextResponse.json(
        { success: false, error: "This provider profile is not available to claim" },
        { status: 400 }
      );
    }

    if (provider.claimedByUserId) {
      return NextResponse.json(
        { success: false, error: "This provider profile has already been claimed" },
        { status: 400 }
      );
    }

    const updated = await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        claimedByUserId: user.id,
        isClaimable: false,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to claim provider";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
