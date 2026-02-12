import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await requireAuth();
    const { sessionId } = await params;

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: user.id },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    await prisma.chatSession.delete({ where: { id: sessionId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
