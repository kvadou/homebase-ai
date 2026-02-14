import { subDays } from "date-fns";
import {
  Users,
  UserPlus,
  DollarSign,
  LifeBuoy,
  Home,
  Package,
  Wrench,
  MessageSquare,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/stat-card";
import { MiniChart } from "@/components/admin/mini-chart";
import { RecentActivityFeed } from "@/components/admin/recent-activity-feed";

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  starter: 9,
  pro: 29,
  business: 99,
};

export default async function AdminDashboardPage() {
  await requireAdmin();

  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const thirtyDaysAgo = subDays(now, 30);

  // Run all queries in parallel
  const [
    totalUsers,
    newUsers7d,
    newUsers30d,
    openTickets,
    planDistribution,
    totalHomes,
    totalItems,
    totalMaintenanceTasks,
    totalChatSessions,
    recentSignups,
    recentTickets,
    recentResolutions,
    recentSubscriptions,
    // Daily signup data for the past 30 days (for sparkline)
    dailySignups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.supportTicket.count({ where: { status: { in: ["open", "in_progress"] } } }),
    prisma.subscription.groupBy({
      by: ["plan"],
      _count: { plan: true },
    }),
    prisma.home.count(),
    prisma.item.count(),
    prisma.maintenanceTask.count(),
    prisma.chatSession.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
    }),
    prisma.supportTicket.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, subject: true, createdAt: true, user: { select: { email: true } } },
    }),
    prisma.supportTicket.findMany({
      where: { status: "resolved" },
      orderBy: { resolvedAt: "desc" },
      take: 3,
      select: { id: true, subject: true, resolvedAt: true },
    }),
    prisma.subscription.findMany({
      where: { plan: { not: "free" }, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, plan: true, createdAt: true, user: { select: { email: true } } },
    }),
    // Get user creation counts per day for the last 14 days for sparkline
    Promise.all(
      Array.from({ length: 14 }, (_, i) => {
        const dayStart = subDays(now, 13 - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        return prisma.user.count({
          where: { createdAt: { gte: dayStart, lte: dayEnd } },
        });
      })
    ),
  ]);

  // Calculate MRR
  const mrr = planDistribution.reduce((total, group) => {
    const price = PLAN_PRICES[group.plan] ?? 0;
    return total + price * group._count.plan;
  }, 0);

  // Build plan distribution map with all plans
  const planCounts: Record<string, number> = { free: 0, starter: 0, pro: 0, business: 0 };
  for (const group of planDistribution) {
    planCounts[group.plan] = group._count.plan;
  }
  // Users without a subscription record are on free
  const subscribedUsers = Object.values(planCounts).reduce((a, b) => a + b, 0);
  planCounts.free += Math.max(0, totalUsers - subscribedUsers);

  const totalPlanUsers = Object.values(planCounts).reduce((a, b) => a + b, 0);

  // Build activity feed
  const activities = [
    ...recentSignups.map((u) => ({
      id: `signup-${u.id}`,
      type: "signup" as const,
      description: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
      timestamp: u.createdAt,
    })),
    ...recentTickets.map((t) => ({
      id: `ticket-${t.id}`,
      type: "ticket_opened" as const,
      description: `${t.user.email}: "${t.subject}"`,
      timestamp: t.createdAt,
    })),
    ...recentResolutions.map((t) => ({
      id: `resolved-${t.id}`,
      type: "ticket_resolved" as const,
      description: `Resolved: "${t.subject}"`,
      timestamp: t.resolvedAt ?? t.id ? new Date() : new Date(),
    })),
    ...recentSubscriptions.map((s) => ({
      id: `sub-${s.id}`,
      type: "subscription" as const,
      description: `${s.user.email} upgraded to ${s.plan}`,
      timestamp: s.createdAt,
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 8);

  const planColors: Record<string, string> = {
    free: "bg-gray-200 dark:bg-gray-700",
    starter: "bg-blue-400",
    pro: "bg-teal-500",
    business: "bg-orange-500",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
        <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/10">
          Admin
        </Badge>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={totalUsers.toLocaleString()}
          icon={Users}
          trend={{ value: newUsers7d, label: "past 7 days" }}
        />
        <StatCard
          label="New Users (30d)"
          value={newUsers30d.toLocaleString()}
          icon={UserPlus}
        />
        <StatCard
          label="MRR"
          value={`$${mrr.toLocaleString()}`}
          icon={DollarSign}
        />
        <StatCard
          label="Open Tickets"
          value={openTickets}
          icon={LifeBuoy}
        />
      </div>

      {/* User Growth Sparkline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">User Signups (14 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <MiniChart data={dailySignups} color="#00B4A0" height={60} />
          <div className="mt-2 flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
            <span>14 days ago</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>

      {/* Two-column: Plan Distribution + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Stacked bar */}
            <div className="mb-4 flex h-4 overflow-hidden rounded-full">
              {(["free", "starter", "pro", "business"] as const).map((plan) => {
                const count = planCounts[plan];
                const pct = totalPlanUsers > 0 ? (count / totalPlanUsers) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={plan}
                    className={`${planColors[plan]} transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${plan}: ${count} (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2">
              {(["free", "starter", "pro", "business"] as const).map((plan) => {
                const count = planCounts[plan];
                const pct = totalPlanUsers > 0 ? (count / totalPlanUsers) * 100 : 0;
                return (
                  <div key={plan} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${planColors[plan]}`} />
                      <span className="capitalize">{plan}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        ${PLAN_PRICES[plan]}/mo
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{count}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        ({pct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityFeed activities={activities} />
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Feature Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
                <Home className="h-5 w-5 text-teal-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalHomes.toLocaleString()}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Homes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalItems.toLocaleString()}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Items</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                <Wrench className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMaintenanceTasks.toLocaleString()}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Maintenance Tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                <MessageSquare className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalChatSessions.toLocaleString()}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Chat Sessions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
