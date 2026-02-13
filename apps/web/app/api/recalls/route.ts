import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuth();

    const recalls = await prisma.itemRecall.findMany({
      where: {
        item: {
          home: { users: { some: { userId: user.id } } },
        },
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            brand: true,
            model: true,
            room: { select: { name: true } },
            home: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: recalls });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Fetch recalls error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recalls" },
      { status: 500 }
    );
  }
}
