import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Context {
  params: Promise<{ homeId: string }>;
}

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { homeId } = await ctx.params;

    // Verify access
    const home = await prisma.home.findFirst({
      where: { id: homeId, users: { some: { userId: user.id } } },
    });
    if (!home) {
      return NextResponse.json(
        { success: false, error: "Home not found" },
        { status: 404 }
      );
    }

    let seeded = 0;

    // 1. Seed from maintenance logs
    const maintenanceLogs = await prisma.maintenanceLog.findMany({
      where: { task: { item: { homeId } } },
      include: {
        task: {
          include: {
            item: { select: { name: true, category: true } },
          },
        },
      },
    });

    for (const log of maintenanceLogs) {
      // Check if an event already exists for this log
      const existing = await prisma.homeEvent.findFirst({
        where: {
          homeId,
          type: "maintenance",
          metadata: { path: ["sourceLogId"], equals: log.id },
        },
      });

      if (!existing) {
        await prisma.homeEvent.create({
          data: {
            homeId,
            type: "maintenance",
            title: log.task.title,
            description: log.notes
              ? `${log.task.item.name}: ${log.notes}`
              : `Maintenance on ${log.task.item.name}`,
            date: log.performedAt,
            cost: log.cost,
            metadata: {
              sourceLogId: log.id,
              itemName: log.task.item.name,
              itemCategory: log.task.item.category,
              performedBy: log.performedBy,
            },
          },
        });
        seeded++;
      }
    }

    // 2. Seed from item purchase dates
    const items = await prisma.item.findMany({
      where: { homeId, purchaseDate: { not: null } },
      include: { room: { select: { name: true } } },
    });

    for (const item of items) {
      if (!item.purchaseDate) continue;

      const existing = await prisma.homeEvent.findFirst({
        where: {
          homeId,
          type: "purchase",
          metadata: { path: ["sourceItemId"], equals: item.id },
        },
      });

      if (!existing) {
        await prisma.homeEvent.create({
          data: {
            homeId,
            type: "purchase",
            title: `Purchased ${item.name}`,
            description: [
              item.brand,
              item.model,
              item.room?.name ? `in ${item.room.name}` : null,
            ]
              .filter(Boolean)
              .join(" - ") || null,
            date: item.purchaseDate,
            cost: item.purchasePrice,
            metadata: {
              sourceItemId: item.id,
              category: item.category,
              brand: item.brand,
              room: item.room?.name,
            },
          },
        });
        seeded++;
      }
    }

    return NextResponse.json({
      success: true,
      data: { seeded },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Timeline seed API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed timeline" },
      { status: 500 }
    );
  }
}
