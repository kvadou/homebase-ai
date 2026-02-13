import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuth();

    const claims = await prisma.insuranceClaim.findMany({
      where: {
        home: { users: { some: { userId: user.id } } },
      },
      include: {
        home: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: claims });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { homeId, title, incidentDate, incidentType, description, itemIds, totalValue, aiNarrative } = body;

    if (!homeId || !title || !incidentDate || !incidentType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    const claim = await prisma.insuranceClaim.create({
      data: {
        homeId,
        title,
        incidentDate: new Date(incidentDate),
        incidentType,
        description: description || null,
        itemIds: itemIds || null,
        totalValue: totalValue ?? null,
        aiNarrative: aiNarrative || null,
        status: "draft",
      },
      include: {
        home: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: claim }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create claim" },
      { status: 500 }
    );
  }
}
