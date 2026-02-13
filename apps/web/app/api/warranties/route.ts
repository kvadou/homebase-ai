import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const homeId = req.nextUrl.searchParams.get("homeId");

    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const whereBase = {
      home: { users: { some: { userId: user.id } } },
      warrantyExpiry: { not: null },
      ...(homeId && { homeId }),
    };

    const items = await prisma.item.findMany({
      where: whereBase,
      include: {
        room: { select: { id: true, name: true } },
        home: { select: { id: true, name: true } },
      },
      orderBy: { warrantyExpiry: "asc" },
    });

    // Group by status
    const active = items.filter(
      (i) => i.warrantyExpiry && i.warrantyExpiry > in30Days
    );
    const expiring = items.filter(
      (i) =>
        i.warrantyExpiry &&
        i.warrantyExpiry > now &&
        i.warrantyExpiry <= in30Days
    );
    const expired = items.filter(
      (i) => i.warrantyExpiry && i.warrantyExpiry <= now
    );

    return NextResponse.json({
      success: true,
      data: {
        all: items,
        active,
        expiring,
        expired,
        stats: {
          total: items.length,
          active: active.length,
          expiring: expiring.length,
          expired: expired.length,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}
