import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Collect distinct userIds from activity signals in each time range
    const [dailyChatUsers, dailyItemUsers, dailyTaskUsers] = await Promise.all([
      prisma.chatSession.findMany({
        where: { createdAt: { gte: todayStart } },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.item.findMany({
        where: { createdAt: { gte: todayStart } },
        select: { home: { select: { users: { select: { userId: true } } } } },
      }),
      prisma.maintenanceTask.findMany({
        where: { createdAt: { gte: todayStart } },
        select: { item: { select: { home: { select: { users: { select: { userId: true } } } } } } },
      }),
    ]);

    const [weeklyChatUsers, weeklyItemUsers, weeklyTaskUsers] = await Promise.all([
      prisma.chatSession.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.item.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { home: { select: { users: { select: { userId: true } } } } },
      }),
      prisma.maintenanceTask.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { item: { select: { home: { select: { users: { select: { userId: true } } } } } } },
      }),
    ]);

    const [monthlyChatUsers, monthlyItemUsers, monthlyTaskUsers] = await Promise.all([
      prisma.chatSession.findMany({
        where: { createdAt: { gte: monthAgo } },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.item.findMany({
        where: { createdAt: { gte: monthAgo } },
        select: { home: { select: { users: { select: { userId: true } } } } },
      }),
      prisma.maintenanceTask.findMany({
        where: { createdAt: { gte: monthAgo } },
        select: { item: { select: { home: { select: { users: { select: { userId: true } } } } } } },
      }),
    ]);

    // Collect unique user IDs for each period
    function collectUserIds(
      chatUsers: { userId: string }[],
      itemUsers: { home: { users: { userId: string }[] } }[],
      taskUsers: { item: { home: { users: { userId: string }[] } } }[]
    ): number {
      const ids = new Set<string>();
      chatUsers.forEach((u) => ids.add(u.userId));
      itemUsers.forEach((i) => i.home.users.forEach((u) => ids.add(u.userId)));
      taskUsers.forEach((t) => t.item.home.users.forEach((u) => ids.add(u.userId)));
      return ids.size;
    }

    const dau = collectUserIds(dailyChatUsers, dailyItemUsers, dailyTaskUsers);
    const wau = collectUserIds(weeklyChatUsers, weeklyItemUsers, weeklyTaskUsers);
    const mau = collectUserIds(monthlyChatUsers, monthlyItemUsers, monthlyTaskUsers);

    const dauWauRatio = wau > 0 ? Math.round((dau / wau) * 100) : 0;
    const wauMauRatio = mau > 0 ? Math.round((wau / mau) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: { dau, wau, mau, dauWauRatio, wauMauRatio },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}
