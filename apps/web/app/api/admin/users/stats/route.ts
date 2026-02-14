import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, newUsersToday, newUsers7d, newUsers30d, planDistribution] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.subscription.groupBy({
          by: ["plan"],
          _count: { plan: true },
        }),
      ]);

    const planMap: Record<string, number> = { free: totalUsers };
    for (const p of planDistribution) {
      planMap[p.plan] = p._count.plan;
      if (p.plan !== "free") {
        planMap.free = (planMap.free || 0) - p._count.plan;
      }
    }
    if ((planMap.free || 0) < 0) planMap.free = 0;

    // Churn rate: users with canceled subscriptions in last 30 days / total paying users
    const canceledLast30d = await prisma.subscription.count({
      where: {
        status: "canceled",
        updatedAt: { gte: thirtyDaysAgo },
      },
    });
    const totalPaying = await prisma.subscription.count({
      where: { plan: { not: "free" } },
    });
    const churnRate = totalPaying > 0 ? (canceledLast30d / totalPaying) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        newUsersToday,
        newUsers7d,
        newUsers30d,
        planDistribution: planMap,
        churnRate: Math.round(churnRate * 10) / 10,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch stats";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
