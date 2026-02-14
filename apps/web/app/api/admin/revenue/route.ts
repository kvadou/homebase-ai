import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  starter: 9,
  pro: 29,
  business: 99,
};

export async function GET() {
  try {
    await requireAdmin();

    const subscriptions = await prisma.subscription.findMany({
      where: { status: "active" },
      select: { plan: true },
    });

    const planBreakdown: Record<string, { count: number; revenue: number }> = {
      free: { count: 0, revenue: 0 },
      starter: { count: 0, revenue: 0 },
      pro: { count: 0, revenue: 0 },
      business: { count: 0, revenue: 0 },
    };

    for (const sub of subscriptions) {
      const plan = sub.plan in PLAN_PRICES ? sub.plan : "free";
      planBreakdown[plan].count += 1;
      planBreakdown[plan].revenue += PLAN_PRICES[plan];
    }

    const mrr = Object.values(planBreakdown).reduce((sum, p) => sum + p.revenue, 0);
    const arr = mrr * 12;
    const paidCustomers = subscriptions.filter((s) => s.plan !== "free").length;
    const arpu = paidCustomers > 0 ? mrr / paidCustomers : 0;

    return NextResponse.json({
      success: true,
      data: {
        mrr,
        arr,
        paidCustomers,
        arpu: Math.round(arpu * 100) / 100,
        totalSubscribers: subscriptions.length,
        planBreakdown,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
