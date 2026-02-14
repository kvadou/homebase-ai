import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const campaignId = searchParams.get("campaignId");

    const where: Record<string, string> = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (campaignId) where.campaignId = campaignId;

    const content = await prisma.marketingContent.findMany({
      where,
      include: { campaign: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch content";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { type, title, content: contentText, platform, campaignId, status: contentStatus, aiGenerated } = body;

    if (!type || !title || !contentText) {
      return NextResponse.json(
        { success: false, error: "Type, title, and content are required" },
        { status: 400 }
      );
    }

    const contentItem = await prisma.marketingContent.create({
      data: {
        type,
        title,
        content: contentText,
        platform: platform || null,
        campaignId: campaignId || null,
        status: contentStatus || "draft",
        aiGenerated: aiGenerated ?? false,
      },
    });

    return NextResponse.json({ success: true, data: contentItem }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create content";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
