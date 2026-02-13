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

    const body = await req.json();
    const { type, title, description, date, cost } = body as {
      type: string;
      title: string;
      description?: string;
      date: string;
      cost?: number;
    };

    if (!type || !title || !date) {
      return NextResponse.json(
        { success: false, error: "type, title, and date are required" },
        { status: 400 }
      );
    }

    const validTypes = [
      "maintenance",
      "purchase",
      "improvement",
      "warranty",
      "custom",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const event = await prisma.homeEvent.create({
      data: {
        homeId,
        type,
        title,
        description: description || null,
        date: new Date(date),
        cost: cost ?? null,
      },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Events API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
