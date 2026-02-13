import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const homeId = searchParams.get("homeId");

    // Verify home ownership if homeId specified
    if (homeId) {
      const homeUser = await prisma.homeUser.findUnique({
        where: {
          userId_homeId: { userId: user.id, homeId },
        },
      });
      if (!homeUser) {
        return NextResponse.json(
          { success: false, error: "Home not found" },
          { status: 404 }
        );
      }
    }

    const homeFilter = homeId
      ? { homeId }
      : { home: { users: { some: { userId: user.id } } } };

    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    // Fetch all data in parallel
    const [items, maintenanceTasks, maintenanceLogs, serviceRequests] =
      await Promise.all([
        prisma.item.findMany({
          where: homeFilter,
          select: {
            id: true,
            category: true,
            purchasePrice: true,
            warrantyExpiry: true,
            condition: true,
            manuals: { select: { id: true } },
            documents: { select: { id: true } },
          },
        }),
        prisma.maintenanceTask.findMany({
          where: {
            item: homeFilter,
          },
          select: {
            id: true,
            status: true,
            nextDueDate: true,
            createdAt: true,
          },
        }),
        prisma.maintenanceLog.findMany({
          where: {
            task: { item: homeFilter },
            performedAt: { gte: twelveMonthsAgo },
          },
          select: {
            id: true,
            cost: true,
            performedAt: true,
          },
        }),
        prisma.serviceRequest.findMany({
          where: homeId
            ? { homeId }
            : { home: { users: { some: { userId: user.id } } } },
          select: {
            id: true,
            cost: true,
            completedAt: true,
            createdAt: true,
          },
        }),
      ]);

    // --- Home Health Score ---
    // 1. Maintenance compliance (40%): completed / total tasks
    const totalTasks = maintenanceTasks.length;
    const completedTasks = maintenanceTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const maintenanceCompliance =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    // 2. Warranty coverage (20%): items with active warranty / items with any warranty
    const itemsWithWarranty = items.filter((i) => i.warrantyExpiry !== null);
    const itemsWithActiveWarranty = itemsWithWarranty.filter(
      (i) => i.warrantyExpiry && new Date(i.warrantyExpiry) > now
    );
    const warrantyFreshness =
      itemsWithWarranty.length > 0
        ? Math.round(
            (itemsWithActiveWarranty.length / itemsWithWarranty.length) * 100
          )
        : 100;

    // 3. Item condition (20%): weighted average of condition scores
    const conditionMap: Record<string, number> = {
      excellent: 100,
      good: 80,
      fair: 50,
      poor: 20,
      broken: 0,
    };
    const conditionScores = items.map(
      (i) => conditionMap[i.condition ?? "good"] ?? 80
    );
    const avgCondition =
      conditionScores.length > 0
        ? Math.round(
            conditionScores.reduce((a, b) => a + b, 0) /
              conditionScores.length
          )
        : 100;

    // 4. Documentation completeness (20%): items with at least one manual or document / total items
    const documentedItems = items.filter(
      (i) => i.manuals.length > 0 || i.documents.length > 0
    );
    const documentationCompleteness =
      items.length > 0
        ? Math.round((documentedItems.length / items.length) * 100)
        : 100;

    const homeHealthScore = Math.round(
      maintenanceCompliance * 0.4 +
        warrantyFreshness * 0.2 +
        avgCondition * 0.2 +
        documentationCompleteness * 0.2
    );

    // --- Total item value ---
    const totalItemValue = items.reduce(
      (sum, i) => sum + (i.purchasePrice ?? 0),
      0
    );

    // --- Monthly spending (12 months) ---
    const monthlySpending: { month: string; amount: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (11 - i));
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      const maintenanceCost = maintenanceLogs
        .filter((l) => {
          const pd = new Date(l.performedAt);
          return pd.getFullYear() === year && pd.getMonth() === month;
        })
        .reduce((sum, l) => sum + (l.cost ?? 0), 0);

      const serviceCost = serviceRequests
        .filter((r) => {
          if (!r.completedAt) return false;
          const cd = new Date(r.completedAt);
          return cd.getFullYear() === year && cd.getMonth() === month;
        })
        .reduce((sum, r) => sum + (r.cost ?? 0), 0);

      monthlySpending.push({
        month: label,
        amount: Math.round((maintenanceCost + serviceCost) * 100) / 100,
      });
    }

    // --- Category breakdown ---
    const categoryMap = new Map<
      string,
      { count: number; totalValue: number }
    >();
    for (const item of items) {
      const cat = item.category || "Uncategorized";
      const existing = categoryMap.get(cat) ?? { count: 0, totalValue: 0 };
      existing.count += 1;
      existing.totalValue += item.purchasePrice ?? 0;
      categoryMap.set(cat, existing);
    }
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        count: data.count,
        totalValue: Math.round(data.totalValue * 100) / 100,
      }))
      .sort((a, b) => b.count - a.count);

    // --- Maintenance trends (12 months) ---
    const maintenanceTrends: {
      month: string;
      completed: number;
      overdue: number;
    }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (11 - i));
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      const completedInMonth = maintenanceLogs.filter((l) => {
        const pd = new Date(l.performedAt);
        return pd.getFullYear() === year && pd.getMonth() === month;
      }).length;

      const overdueInMonth = maintenanceTasks.filter((t) => {
        if (!t.nextDueDate || t.status === "completed") return false;
        const dd = new Date(t.nextDueDate);
        // Task was overdue during this month: due date is in or before this month
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
        return dd <= endOfMonth && dd.getFullYear() === year && dd.getMonth() === month;
      }).length;

      maintenanceTrends.push({
        month: label,
        completed: completedInMonth,
        overdue: overdueInMonth,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        homeHealthScore,
        maintenanceCompliance,
        totalItemValue: Math.round(totalItemValue * 100) / 100,
        warrantyFreshness,
        monthlySpending,
        categoryBreakdown,
        maintenanceTrends,
        _summary: {
          totalItems: items.length,
          totalTasks,
          completedTasks,
          itemsWithActiveWarranty: itemsWithActiveWarranty.length,
          itemsWithWarranty: itemsWithWarranty.length,
          documentedItems: documentedItems.length,
          avgCondition,
          documentationCompleteness,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}
