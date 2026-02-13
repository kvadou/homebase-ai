import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/invitations
 * List pending invitations for the current user (matched by email).
 */
export async function GET() {
  try {
    const user = await requireAuth();

    const invitations = await prisma.homeInvitation.findMany({
      where: {
        email: user.email,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      include: {
        home: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: invitations });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}
