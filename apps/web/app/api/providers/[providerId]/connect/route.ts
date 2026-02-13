import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

interface Context {
  params: Promise<{ providerId: string }>;
}

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { providerId } = await ctx.params;

    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: "Provider not found" },
        { status: 404 }
      );
    }

    if (provider.claimedByUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: "You must claim this provider profile first" },
        { status: 403 }
      );
    }

    const stripe = getStripe();

    // Create Stripe Connect account if not already created
    let accountId = provider.stripeConnectId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: provider.email ?? user.email,
        metadata: {
          providerId: provider.id,
          userId: user.id,
        },
      });
      accountId = account.id;

      await prisma.providerProfile.update({
        where: { id: providerId },
        data: { stripeConnectId: accountId },
      });
    }

    // Generate onboarding link
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard/providers?connect=refresh&providerId=${providerId}`,
      return_url: `${origin}/dashboard/providers?connect=success&providerId=${providerId}`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      success: true,
      data: { url: accountLink.url },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start Stripe Connect onboarding";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
