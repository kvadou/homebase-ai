import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

/**
 * Map a Stripe price ID to a plan name.
 */
function getPlanFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_FAMILY_PRICE_ID) return "family";
  return "free";
}

/**
 * Extract current period dates from a Stripe subscription's first item.
 * In Stripe API 2026-01-28, current_period_start/end moved to subscription items.
 */
function getPeriodDates(subscription: Stripe.Subscription) {
  const firstItem = subscription.items.data[0];
  return {
    currentPeriodStart: firstItem
      ? new Date(firstItem.current_period_start * 1000)
      : null,
    currentPeriodEnd: firstItem
      ? new Date(firstItem.current_period_end * 1000)
      : null,
  };
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { success: false, error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { success: false, error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (!userId || !plan) {
          console.error("Missing metadata in checkout session:", session.id);
          break;
        }

        // Get the subscription details from Stripe
        const stripe = getStripe();
        const stripeSubscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const { currentPeriodStart, currentPeriodEnd } = getPeriodDates(stripeSubscription);

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: stripeSubscription.id,
            stripePriceId: stripeSubscription.items.data[0]?.price.id,
            plan,
            status: "active",
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: stripeSubscription.id,
            stripePriceId: stripeSubscription.items.data[0]?.price.id,
            plan,
            status: "active",
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          },
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const existingRecord = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!existingRecord) {
          console.error("No subscription record found for:", subscription.id);
          break;
        }

        const priceId = subscription.items.data[0]?.price.id ?? "";
        const plan = getPlanFromPriceId(priceId);
        const { currentPeriodStart, currentPeriodEnd } = getPeriodDates(subscription);

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            stripePriceId: priceId,
            plan,
            status: subscription.status === "active" ? "active" : subscription.status,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const existingRecord = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!existingRecord) {
          console.error("No subscription record found for:", subscription.id);
          break;
        }

        // Revert to free plan
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            stripeSubscriptionId: null,
            stripePriceId: null,
            plan: "free",
            status: "active",
            currentPeriodStart: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
          },
        });

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // In Stripe API 2026-01-28, subscription is under parent.subscription_details
        const subscriptionId =
          (invoice.parent?.subscription_details?.subscription as string) ?? null;

        if (!subscriptionId) break;

        const existingRecord = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (!existingRecord) {
          console.error("No subscription record found for:", subscriptionId);
          break;
        }

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: "past_due" },
        });

        break;
      }

      default:
        // Unhandled event type — log and continue
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ success: true, data: { received: true } });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
