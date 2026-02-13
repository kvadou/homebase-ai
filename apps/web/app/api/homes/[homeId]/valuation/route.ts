import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getHomeValuation } from "@/lib/valuation";

interface Context {
  params: Promise<{ homeId: string }>;
}

export async function GET(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { homeId } = await ctx.params;

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

    if (!home.address || !home.city || !home.state || !home.zipCode) {
      return NextResponse.json(
        { success: false, error: "Home address information is incomplete" },
        { status: 400 }
      );
    }

    const valuation = await getHomeValuation(
      home.address,
      home.city,
      home.state,
      home.zipCode,
      home.squareFeet
    );

    // Update home with valuation data
    if (valuation.estimatedValue) {
      await prisma.home.update({
        where: { id: homeId },
        data: {
          estimatedValue: valuation.estimatedValue,
          lastValuationDate: new Date(),
          lastValuationSource: valuation.source,
        },
      });
    }

    // Get total maintenance investment
    const maintenanceCosts = await prisma.maintenanceLog.aggregate({
      where: {
        task: {
          item: { homeId },
        },
      },
      _sum: { cost: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...valuation,
        totalMaintenanceInvestment: maintenanceCosts._sum.cost ?? 0,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to get valuation" },
      { status: 500 }
    );
  }
}
