import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    await requireAdmin();
    const { campaignId } = await params;

    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
      include: { content: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: campaign });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch campaign";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    await requireAdmin();
    const { campaignId } = await params;
    const body = await req.json();

    const { name, channel, status: campaignStatus, description, budget, startDate, endDate } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (channel !== undefined) data.channel = channel;
    if (campaignStatus !== undefined) data.status = campaignStatus;
    if (description !== undefined) data.description = description || null;
    if (budget !== undefined) data.budget = budget ? parseFloat(budget) : null;
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;

    const campaign = await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data,
    });

    return NextResponse.json({ success: true, data: campaign });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update campaign";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    await requireAdmin();
    const { campaignId } = await params;

    await prisma.marketingCampaign.delete({
      where: { id: campaignId },
    });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete campaign";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
