import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Context {
  params: Promise<{ homeId: string }>;
}

export async function GET(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { homeId } = await ctx.params;

    // Verify ownership
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

    const safetyItems = await prisma.safetyInfo.findMany({
      where: { homeId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: safetyItems });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { homeId } = await ctx.params;

    // Verify ownership
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

    const body = await req.json();
    const { title, description, location, type, photoUrl } = body;

    if (!title || !type) {
      return NextResponse.json(
        { success: false, error: "Title and type are required" },
        { status: 400 }
      );
    }

    const safetyItem = await prisma.safetyInfo.create({
      data: {
        homeId,
        title,
        description: description || null,
        location: location || null,
        type,
        photoUrl: photoUrl || null,
      },
    });

    return NextResponse.json({ success: true, data: safetyItem }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create safety item" },
      { status: 500 }
    );
  }
}
