import Stripe from "stripe";
import { prisma } from "./db";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: "2026-01-28.clover",
    typescript: true,
  });

  return stripeInstance;
}

/**
 * Find or create a Stripe customer for a user, updating the Subscription record.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  // Check if user already has a Stripe customer ID
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (subscription?.stripeCustomerId) {
    return subscription.stripeCustomerId;
  }

  // Create Stripe customer
  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  // Upsert subscription record with the new customer ID
  await prisma.subscription.upsert({
    where: { userId },
    update: { stripeCustomerId: customer.id },
    create: {
      userId,
      stripeCustomerId: customer.id,
      plan: "free",
      status: "active",
    },
  });

  return customer.id;
}

/**
 * Get the user's subscription record, creating a free default if none exists.
 */
export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (subscription) return subscription;

  // Create default free subscription
  return prisma.subscription.create({
    data: {
      userId,
      plan: "free",
      status: "active",
    },
  });
}
