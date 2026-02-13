import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Context {
  params: Promise<{ homeId: string }>;
}

interface ApprovedTask {
  title: string;
  description: string;
  frequency: string;
  nextDueDate: string;
  priority: string;
  linkedItemId: string | null;
}

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { homeId } = await ctx.params;

    const home = await prisma.home.findFirst({
      where: {
        id: homeId,
        users: { some: { userId: user.id } },
      },
      include: {
        items: { select: { id: true } },
      },
    });

    if (!home) {
      return NextResponse.json(
        { success: false, error: "Home not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { tasks } = body as { tasks: ApprovedTask[] };

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { success: false, error: "No tasks provided" },
        { status: 400 }
      );
    }

    const homeItemIds = new Set(home.items.map((i) => i.id));

    // If a task has no linkedItemId or the linkedItemId isn't in this home,
    // we need a fallback item. Use the first item in the home.
    const fallbackItemId = home.items[0]?.id;

    if (!fallbackItemId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This home has no items. Add at least one item before creating maintenance tasks.",
        },
        { status: 400 }
      );
    }

    const created = await prisma.maintenanceTask.createMany({
      data: tasks.map((task) => ({
        itemId:
          task.linkedItemId && homeItemIds.has(task.linkedItemId)
            ? task.linkedItemId
            : fallbackItemId,
        title: task.title,
        description: task.description,
        frequency: task.frequency,
        nextDueDate: task.nextDueDate ? new Date(task.nextDueDate) : null,
        priority: task.priority || "medium",
        status: "pending",
      })),
    });

    return NextResponse.json(
      { success: true, data: { count: created.count } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Apply maintenance plan error:", error);
    const message =
      error instanceof Error && error.message === "Unauthorized"
        ? "Unauthorized"
        : "Failed to apply maintenance plan";
    const status =
      error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
