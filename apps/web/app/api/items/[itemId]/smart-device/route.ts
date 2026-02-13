import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await requireAuth();
    const { itemId } = await params;

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

    const body = await req.json();
    const { smartDeviceId, smartDeviceType, smartDeviceMetadata } = body as {
      smartDeviceId?: string | null;
      smartDeviceType?: string | null;
      smartDeviceMetadata?: object | null;
    };

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        smartDeviceId: smartDeviceId ?? null,
        smartDeviceType: smartDeviceType ?? null,
        smartDeviceMetadata: smartDeviceMetadata ?? undefined,
      },
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update smart device" },
      { status: 500 }
    );
  }
}
