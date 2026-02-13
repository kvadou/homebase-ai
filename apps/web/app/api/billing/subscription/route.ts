import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getUserSubscription } from "@/lib/stripe";
import { getRemainingLimits } from "@/lib/plan-limits";

export async function GET() {
  try {
    const user = await requireAuth();
    const subscription = await getUserSubscription(user.id);
    const usage = await getRemainingLimits(user.id);

    return NextResponse.json({
      success: true,
      data: {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        usage,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
