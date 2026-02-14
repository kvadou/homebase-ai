import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Context {
  params: Promise<{ ticketId: string }>;
}

export async function GET(req: NextRequest, ctx: Context) {
  try {
    await requireAdmin();
    const { ticketId } = await ctx.params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, imageUrl: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PUT(req: NextRequest, ctx: Context) {
  try {
    await requireAdmin();
    const { ticketId } = await ctx.params;
    const body = await req.json();

    const existing = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.priority) updateData.priority = body.priority;
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;
    if (body.status === "resolved") updateData.resolvedAt = new Date();

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, imageUrl: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
