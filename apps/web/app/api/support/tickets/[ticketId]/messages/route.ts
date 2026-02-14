import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Context {
  params: Promise<{ ticketId: string }>;
}

export async function GET(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { ticketId } = await ctx.params;

    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId, userId: user.id },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    const messages = await prisma.supportMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: messages });
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
    const { ticketId } = await ctx.params;
    const body = await req.json();

    if (!body.content?.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content is required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId, userId: user.id },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        senderType: "customer",
        senderName: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
        content: body.content.trim(),
      },
    });

    return NextResponse.json({ success: true, data: message });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
