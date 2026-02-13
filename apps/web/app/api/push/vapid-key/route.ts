import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      return NextResponse.json(
        { success: false, error: "VAPID key not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { vapidPublicKey },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}
