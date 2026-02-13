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

    const issues = await prisma.homeIssue.findMany({
      where: { homeId },
      include: {
        room: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: issues });
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
    const { title, description, severity, aiDiagnosis, estimatedCost, photoUrl, roomId } =
      body as {
        title: string;
        description?: string;
        severity: string;
        aiDiagnosis?: string;
        estimatedCost?: string;
        photoUrl?: string;
        roomId?: string;
      };

    if (!title || !severity) {
      return NextResponse.json(
        { success: false, error: "Title and severity are required" },
        { status: 400 }
      );
    }

    const issue = await prisma.homeIssue.create({
      data: {
        homeId,
        roomId: roomId || null,
        title,
        description: description || null,
        severity,
        aiDiagnosis: aiDiagnosis || null,
        estimatedCost: estimatedCost || null,
        photoUrl: photoUrl || null,
      },
    });

    return NextResponse.json({ success: true, data: issue }, { status: 201 });
  } catch (error) {
    console.error("Create issue error:", error);
    const message =
      error instanceof Error && error.message === "Unauthorized"
        ? "Unauthorized"
        : "Failed to create issue";
    const status =
      error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
