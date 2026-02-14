import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuth();

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.id },
      include: {
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.subject?.trim() || !body.description?.trim()) {
      return NextResponse.json(
        { success: false, error: "Subject and description are required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject: body.subject.trim(),
        description: body.description.trim(),
        priority: body.priority || "medium",
        category: body.category || null,
        homeId: body.homeId || null,
      },
    });

    // Create initial message from the description
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderType: "customer",
        senderName: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
        content: body.description.trim(),
      },
    });

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
