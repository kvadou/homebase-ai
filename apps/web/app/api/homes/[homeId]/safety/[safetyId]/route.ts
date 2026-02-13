import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Context {
  params: Promise<{ homeId: string; safetyId: string }>;
}

export async function PUT(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { homeId, safetyId } = await ctx.params;

    // Verify ownership
    const existing = await prisma.safetyInfo.findFirst({
      where: {
        id: safetyId,
        homeId,
        home: { users: { some: { userId: user.id } } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Safety item not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, description, location, type, photoUrl } = body;

    const updated = await prisma.safetyInfo.update({
      where: { id: safetyId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(type !== undefined && { type }),
        ...(photoUrl !== undefined && { photoUrl }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update safety item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { homeId, safetyId } = await ctx.params;

    // Verify ownership
    const existing = await prisma.safetyInfo.findFirst({
      where: {
        id: safetyId,
        homeId,
        home: { users: { some: { userId: user.id } } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Safety item not found" },
        { status: 404 }
      );
    }

    await prisma.safetyInfo.delete({ where: { id: safetyId } });

    return NextResponse.json({ success: true, data: { id: safetyId } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete safety item" },
      { status: 500 }
    );
  }
}
