import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { manualId, itemId } = body;

    if (!manualId || !itemId) {
      return NextResponse.json(
        { success: false, error: "manualId and itemId are required" },
        { status: 400 }
      );
    }

    // Verify user owns the item
    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        home: { users: { some: { userId: user.id } } },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    // Check if link already exists
    const existing = await prisma.itemManual.findUnique({
      where: {
        itemId_manualId: { itemId, manualId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Manual is already linked to this item" },
        { status: 409 }
      );
    }

    const link = await prisma.itemManual.create({
      data: { itemId, manualId },
      include: {
        manual: { select: { id: true, title: true } },
        item: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: link }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to link manual" },
      { status: 500 }
    );
  }
}
