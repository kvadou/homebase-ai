import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Context {
  params: Promise<{ homeId: string }>;
}

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { homeId } = await ctx.params;

    // Verify home ownership
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

    // Check that a passport exists
    const existing = await prisma.homePassport.findUnique({
      where: { homeId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Generate a passport first before sharing" },
        { status: 400 }
      );
    }

    // Generate a share token
    const shareToken = crypto.randomUUID();
    const shareExpiresAt = new Date();
    shareExpiresAt.setDate(shareExpiresAt.getDate() + 30);

    const passport = await prisma.homePassport.update({
      where: { homeId },
      data: {
        shareToken,
        shareExpiresAt,
        isPublic: true,
      },
    });

    // Build the share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
    const shareUrl = `${baseUrl}/passport/${shareToken}`;

    return NextResponse.json({
      success: true,
      data: {
        shareToken: passport.shareToken,
        shareUrl,
        shareExpiresAt: passport.shareExpiresAt,
        isPublic: passport.isPublic,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to generate share link" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { homeId } = await ctx.params;

    // Verify home ownership
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

    await prisma.homePassport.update({
      where: { homeId },
      data: {
        shareToken: null,
        shareExpiresAt: null,
        isPublic: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: { revoked: true },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to revoke share" },
      { status: 500 }
    );
  }
}
