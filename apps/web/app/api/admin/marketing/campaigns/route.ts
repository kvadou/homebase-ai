import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const channel = searchParams.get("channel");

    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (channel) where.channel = channel;

    const campaigns = await prisma.marketingCampaign.findMany({
      where,
      include: { content: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch campaigns";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { name, channel, description, budget, startDate, endDate } = body;

    if (!name || !channel) {
      return NextResponse.json(
        { success: false, error: "Name and channel are required" },
        { status: 400 }
      );
    }

    const campaign = await prisma.marketingCampaign.create({
      data: {
        name,
        channel,
        status: "draft",
        description: description || null,
        budget: budget ? parseFloat(budget) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        metrics: {},
      },
    });

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create campaign";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
