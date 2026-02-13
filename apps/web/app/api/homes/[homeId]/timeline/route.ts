import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Context {
  params: Promise<{ homeId: string }>;
}

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  date: Date;
  cost: number | null;
  metadata: Record<string, unknown> | null;
}

export async function GET(req: NextRequest, ctx: Context) {
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

    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const events: TimelineEvent[] = [];

    // 1. Maintenance logs (completed tasks)
    const logDateFilter: Record<string, Date> = {};
    if (startDate) logDateFilter.gte = new Date(startDate);
    if (endDate) logDateFilter.lte = new Date(endDate);

    const maintenanceLogs = await prisma.maintenanceLog.findMany({
      where: {
        task: { item: { homeId } },
        ...(startDate || endDate ? { performedAt: logDateFilter } : {}),
      },
      include: {
        task: {
          include: {
            item: { select: { name: true, category: true } },
          },
        },
      },
      orderBy: { performedAt: "desc" },
    });

    for (const log of maintenanceLogs) {
      events.push({
        id: `log-${log.id}`,
        type: "maintenance",
        title: log.task.title,
        description: log.notes
          ? `${log.task.item.name}: ${log.notes}`
          : `Maintenance on ${log.task.item.name}`,
        date: log.performedAt,
        cost: log.cost,
        metadata: {
          taskId: log.taskId,
          itemName: log.task.item.name,
          itemCategory: log.task.item.category,
          performedBy: log.performedBy,
        },
      });
    }

    // 2. Item purchases
    const itemDateFilter: Record<string, Date> = {};
    if (startDate) itemDateFilter.gte = new Date(startDate);
    if (endDate) itemDateFilter.lte = new Date(endDate);

    const items = await prisma.item.findMany({
      where: {
        homeId,
        purchaseDate: { not: null, ...(startDate || endDate ? itemDateFilter : {}) },
      },
      include: { room: { select: { name: true } } },
    });

    for (const item of items) {
      if (item.purchaseDate) {
        events.push({
          id: `item-${item.id}`,
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
            itemId: item.id,
            category: item.category,
            brand: item.brand,
            room: item.room?.name,
          },
        });
      }
    }

    // 3. Custom HomeEvent entries
    const eventDateFilter: Record<string, Date> = {};
    if (startDate) eventDateFilter.gte = new Date(startDate);
    if (endDate) eventDateFilter.lte = new Date(endDate);

    const homeEvents = await prisma.homeEvent.findMany({
      where: {
        homeId,
        ...(startDate || endDate ? { date: eventDateFilter } : {}),
      },
    });

    for (const evt of homeEvents) {
      events.push({
        id: `event-${evt.id}`,
        type: evt.type,
        title: evt.title,
        description: evt.description,
        date: evt.date,
        cost: evt.cost,
        metadata: evt.metadata as Record<string, unknown> | null,
      });
    }

    // Sort all events chronologically (newest first)
    events.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Compute cost totals
    const totalCost = events.reduce((sum, e) => sum + (e.cost ?? 0), 0);
    const costByType: Record<string, number> = {};
    for (const e of events) {
      costByType[e.type] = (costByType[e.type] ?? 0) + (e.cost ?? 0);
    }

    return NextResponse.json({
      success: true,
      data: {
        events,
        totalCost,
        costByType,
        count: events.length,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Timeline API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
