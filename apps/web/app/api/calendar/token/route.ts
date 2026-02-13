import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

function buildFeedUrl(req: NextRequest, token: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return `${appUrl}/api/calendar/feed?token=${token}`;
  }
  const host = req.headers.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}/api/calendar/feed?token=${token}`;
}

export async function GET() {
  try {
    const user = await requireAuth();

    if (!user.calendarToken) {
      return NextResponse.json({ success: true, data: { token: null, feedUrl: null } });
    }

    return NextResponse.json({
      success: true,
      data: {
        token: user.calendarToken,
        feedUrl: null, // Client constructs URL from token
      },
    });
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
    const token = randomUUID();

    await prisma.user.update({
      where: { id: user.id },
      data: { calendarToken: token },
    });

    const feedUrl = buildFeedUrl(req, token);

    return NextResponse.json({
      success: true,
      data: { token, feedUrl },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to generate calendar token" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await requireAuth();

    await prisma.user.update({
      where: { id: user.id },
      data: { calendarToken: null },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to revoke calendar token" },
      { status: 500 }
    );
  }
}
