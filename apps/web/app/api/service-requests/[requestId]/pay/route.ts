import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

interface Context {
  params: Promise<{ requestId: string }>;
}

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { requestId } = await ctx.params;
    const body = await req.json();
    const { amount } = body as { amount: number };

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid amount is required" },
        { status: 400 }
      );
    }

    // Verify service request ownership through home association
    const userHomes = await prisma.homeUser.findMany({
      where: { userId: user.id },
      select: { homeId: true },
    });
    const homeIds = userHomes.map((h) => h.homeId);

    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: {
        id: requestId,
        homeId: { in: homeIds },
      },
      include: {
        provider: true,
      },
    });

    if (!serviceRequest) {
      return NextResponse.json(
        { success: false, error: "Service request not found" },
        { status: 404 }
      );
    }

    if (!serviceRequest.provider) {
      return NextResponse.json(
        { success: false, error: "No provider assigned to this service request" },
        { status: 400 }
      );
    }

    if (!serviceRequest.provider.stripeConnectId) {
      return NextResponse.json(
        { success: false, error: "Provider has not completed Stripe Connect setup" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const amountInCents = Math.round(amount * 100);
    const commissionRate = serviceRequest.provider.commissionRate ?? 0.10;
    const applicationFee = Math.round(amountInCents * commissionRate);
    const commissionAmount = amount * commissionRate;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: serviceRequest.provider.stripeConnectId,
      },
      metadata: {
        serviceRequestId: requestId,
        providerId: serviceRequest.provider.id,
        userId: user.id,
      },
    });

    // Update the service request with payment info
    await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        paymentStatus: "pending",
        stripePaymentId: paymentIntent.id,
        commissionRate,
        commissionAmount,
        cost: amount,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create payment";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
