import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const configured = {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      google: !!process.env.GOOGLE_PLACES_API_KEY,
      yelp: !!process.env.YELP_API_KEY,
    };

    return NextResponse.json({ success: true, data: { configured } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check API keys";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
