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

    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "active",
        plan: { not: "free" },
        createdAt: { lte: now },
      },
      select: {
        plan: true,
        createdAt: true,
      },
    });

    const months: { month: string; mrr: number; subscribers: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(twelveMonthsAgo.getFullYear(), twelveMonthsAgo.getMonth() + i, 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
      const monthLabel = monthDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      const activeSubs = subscriptions.filter((s) => s.createdAt <= monthEnd);

      let mrr = 0;
      for (const sub of activeSubs) {
        mrr += PLAN_PRICES[sub.plan] ?? 0;
      }

      months.push({
        month: monthLabel,
        mrr,
        subscribers: activeSubs.length,
      });
    }

    return NextResponse.json({
      success: true,
      data: months,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
