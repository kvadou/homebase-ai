import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Context {
  params: Promise<{ ticketId: string }>;
}

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const admin = await requireAdmin();
    const { ticketId } = await ctx.params;
    const body = await req.json();

    if (!body.content?.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content is required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
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
        senderType: "admin",
        senderName: [admin.firstName, admin.lastName].filter(Boolean).join(" ") || admin.email,
        content: body.content.trim(),
      },
    });

    // Auto-set ticket to in_progress if it was open
    if (ticket.status === "open") {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: "in_progress" },
      });
    }

    return NextResponse.json({ success: true, data: message });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
