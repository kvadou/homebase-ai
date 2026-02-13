import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Context {
  params: Promise<{ claimId: string }>;
}

export async function GET(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { claimId } = await ctx.params;

    const claim = await prisma.insuranceClaim.findFirst({
      where: {
        id: claimId,
        home: { users: { some: { userId: user.id } } },
      },
      include: {
        home: { select: { id: true, name: true } },
      },
    });

    if (!claim) {
      return NextResponse.json(
        { success: false, error: "Claim not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: claim });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PUT(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { claimId } = await ctx.params;

    const existing = await prisma.insuranceClaim.findFirst({
      where: {
        id: claimId,
        home: { users: { some: { userId: user.id } } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Claim not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, incidentDate, incidentType, description, status, itemIds, totalValue, aiNarrative } = body;

    const updated = await prisma.insuranceClaim.update({
      where: { id: claimId },
      data: {
        ...(title !== undefined && { title }),
        ...(incidentDate !== undefined && { incidentDate: new Date(incidentDate) }),
        ...(incidentType !== undefined && { incidentType }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(itemIds !== undefined && { itemIds }),
        ...(totalValue !== undefined && { totalValue }),
        ...(aiNarrative !== undefined && { aiNarrative }),
      },
      include: {
        home: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update claim" },
      { status: 500 }
    );
  }
}
