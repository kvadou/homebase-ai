import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { format, formatDistanceToNow, isPast } from "date-fns";
import {
  Plus,
  Home,
  Package,
  Wrench,
  ScanLine,
  MessageSquare,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RecallDashboardBanner } from "@/components/recalls/recall-dashboard-banner";
import { PendingInvitationsBanner } from "@/components/homes/pending-invitations-banner";
import { SeasonalDashboardCard } from "@/components/maintenance/seasonal-dashboard-card";
import { ContinueSetupCard } from "@/components/dashboard/continue-setup-card";

export default async function DashboardPage() {
  const user = await requireAuth();

  // Fetch all data in parallel
  const [homes, maintenanceTasks, chatSessions, serviceRequests, recallCount] =
    await Promise.all([
      prisma.home.findMany({
        where: { users: { some: { userId: user.id } } },
        include: {
          _count: { select: { rooms: true, items: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.maintenanceTask.findMany({
        where: {
          item: { home: { users: { some: { userId: user.id } } } },
          status: { not: "completed" },
        },
        include: {
          item: {
            select: {
              name: true,
              home: { select: { name: true } },
            },
          },
        },
        orderBy: { nextDueDate: "asc" },
        take: 5,
      }),
      prisma.chatSession.findMany({
        where: { userId: user.id },
        include: { _count: { select: { messages: true } } },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      prisma.serviceRequest.findMany({
        where: {
          home: { users: { some: { userId: user.id } } },
          status: { in: ["pending", "scheduled", "in_progress"] },
        },
        take: 5,
      }),
      prisma.itemRecall.count({
        where: {
          item: { home: { users: { some: { userId: user.id } } } },
        },
      }),
    ]);

  // Redirect new users (no homes) to onboarding unless they skipped
  if (homes.length === 0) {
    const cookieStore = await cookies();
    const skipped = cookieStore.get("onboarding_skipped");
    if (!skipped) {
      redirect("/onboarding");
    }
  }

  // Find homes with items but no maintenance tasks for CTA
  const homesNeedingPlan = [];
  for (const home of homes) {
    if (home._count.items > 0) {
      const taskCount = await prisma.maintenanceTask.count({
        where: { item: { homeId: home.id } },
      });
      if (taskCount === 0) {
        homesNeedingPlan.push(home);
      }
    }
  }

  const totalItems = homes.reduce((sum, h) => sum + h._count.items, 0);
  const overdueTasks = maintenanceTasks.filter(
    (t) => t.nextDueDate && isPast(new Date(t.nextDueDate))
  );
  const upcomingTasks = maintenanceTasks.filter(
    (t) => !t.nextDueDate || !isPast(new Date(t.nextDueDate))
  );

  return (
    <div className="space-y-6">
      {/* Continue Onboarding (shown if user skipped) */}
      <ContinueSetupCard />

      {/* Pending Invitations */}
      <PendingInvitationsBanner />

      {/* Recall Alert Banner */}
      <RecallDashboardBanner recallCount={recallCount} />

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back{user.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Here&apos;s an overview of your homes and activity.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="hidden sm:flex">
          <Link href="/home/new">
            <Plus className="h-4 w-4" />
            Add Home
          </Link>
        </Button>
      </div>

      {/* Stats Grid — tighter, more distinct */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0A2E4D]/5 dark:bg-[#0A2E4D]/20">
            <Home className="h-5 w-5 text-[#0A2E4D] dark:text-teal-400" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{homes.length}</p>
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
              {homes.length === 1 ? "Home" : "Homes"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#00B4A0]/8 dark:bg-[#00B4A0]/15">
            <Package className="h-5 w-5 text-[#00B4A0]" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{totalItems}</p>
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
              {totalItems === 1 ? "Item" : "Items"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/8 dark:bg-amber-500/15">
            <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{maintenanceTasks.length}</p>
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
              {overdueTasks.length > 0 ? (
                <span className="font-medium text-red-500">
                  {overdueTasks.length} overdue
                </span>
              ) : (
                "On track"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/8 dark:bg-violet-500/15">
            <Shield className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{serviceRequests.length}</p>
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
              Requests
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions — distinct icons, cleaner layout */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Link
            href="/dashboard/scan"
            className="group flex flex-col items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-center transition-all hover:border-[#00B4A0]/30 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00B4A0]/10 transition-colors group-hover:bg-[#00B4A0]/20">
              <ScanLine className="h-5 w-5 text-[#00B4A0]" />
            </div>
            <span className="text-xs font-medium">Scan Item</span>
          </Link>
          <Link
            href="/dashboard/chat"
            className="group flex flex-col items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-center transition-all hover:border-[#0A2E4D]/20 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A2E4D]/5 transition-colors group-hover:bg-[#0A2E4D]/10 dark:bg-[#0A2E4D]/20 dark:group-hover:bg-[#0A2E4D]/30">
              <MessageSquare className="h-5 w-5 text-[#0A2E4D] dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium">Chat with AI</span>
          </Link>
          <Link
            href="/dashboard/maintenance"
            className="group flex flex-col items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-center transition-all hover:border-amber-500/20 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
              <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-medium">Maintenance</span>
          </Link>
          <Link
            href="/dashboard/providers"
            className="group flex flex-col items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-center transition-all hover:border-violet-500/20 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 transition-colors group-hover:bg-violet-500/20">
              <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-xs font-medium">Providers</span>
          </Link>
        </div>
      </div>

      {/* Maintenance Autopilot CTA — redesigned as a subtle inline nudge */}
      {homesNeedingPlan.length > 0 && (
        <Link
          href="/dashboard/maintenance"
          className="group flex items-center gap-3 rounded-xl border border-dashed border-[#0A2E4D]/15 bg-[#0A2E4D]/[0.02] p-4 transition-all hover:border-[#0A2E4D]/25 hover:bg-[#0A2E4D]/[0.04] dark:border-teal-500/20 dark:bg-teal-500/[0.03] dark:hover:bg-teal-500/[0.06]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#00B4A0] to-[#009e8e] shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              Generate a maintenance plan
              <span className="ml-1.5 inline-flex items-center rounded-full bg-[#00B4A0]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#00B4A0]">
                AI
              </span>
            </p>
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
              {homesNeedingPlan.length === 1
                ? `${homesNeedingPlan[0].name} has items but no schedule yet.`
                : `${homesNeedingPlan.length} homes need maintenance plans.`}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {/* Two-column layout for maintenance + chat */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Maintenance Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">
              Maintenance
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="h-auto gap-1 px-2 py-1 text-xs text-[hsl(var(--muted-foreground))]">
              <Link href="/dashboard/maintenance">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {maintenanceTasks.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle2 className="mb-2 h-8 w-8 text-[#00B4A0]" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  No pending maintenance tasks.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Overdue tasks first */}
                {overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-900/50 dark:bg-red-950/30"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {task.item.name} &middot; {task.item.home.name}
                      </p>
                      {task.nextDueDate && (
                        <Badge variant="destructive" className="mt-1 text-[10px]">
                          Overdue {formatDistanceToNow(new Date(task.nextDueDate), { addSuffix: false })}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {/* Upcoming tasks */}
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-lg border border-[hsl(var(--border))] p-3"
                  >
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {task.item.name} &middot; {task.item.home.name}
                      </p>
                      {task.nextDueDate && (
                        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                          Due {format(new Date(task.nextDueDate), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Chat Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">
              Recent Chats
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="h-auto gap-1 px-2 py-1 text-xs text-[hsl(var(--muted-foreground))]">
              <Link href="/dashboard/chat">
                Open Chat <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {chatSessions.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <MessageSquare className="mb-2 h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  Start a chat to ask questions about your home.
                </p>
                <Button size="sm" className="mt-3 gap-1" asChild>
                  <Link href="/dashboard/chat">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Start Chat
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {chatSessions.map((session) => (
                  <Link
                    key={session.id}
                    href="/dashboard/chat"
                    className="flex items-start gap-3 rounded-lg border border-[hsl(var(--border))] p-3 transition-colors hover:bg-[hsl(var(--muted))]/50"
                  >
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#00B4A0]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {session.title || "New Chat"}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                        <span>{session._count.messages} messages</span>
                        <span>&middot;</span>
                        <span>
                          {formatDistanceToNow(new Date(session.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seasonal Maintenance */}
      {homes.length > 0 && homes[0].zipCode && (
        <SeasonalDashboardCard zipCode={homes[0].zipCode} />
      )}

      {/* Home cards */}
      {homes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Home className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
            <h3 className="mt-4 font-heading text-lg font-semibold">
              No homes yet
            </h3>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Add your first home to get started.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/home/new">
                <Plus className="h-4 w-4" />
                Add Your First Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Your Homes
            </h2>
            <Button variant="ghost" size="sm" asChild className="h-auto gap-1 px-2 py-1 text-xs text-[hsl(var(--muted-foreground))]">
              <Link href="/home/new">
                <Plus className="h-3 w-3" />
                Add Home
              </Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {homes.map((home) => (
              <Link key={home.id} href={`/home/${home.id}`}>
                <Card className="transition-all duration-200 hover:shadow-md hover:border-[hsl(var(--ring))]/30 cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2E4D]/5 dark:bg-[#0A2E4D]/20">
                        <Home className="h-5 w-5 text-[#0A2E4D] dark:text-teal-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-sm font-semibold truncate">
                          {home.name}
                        </h3>
                        {home.address && (
                          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))] truncate">
                            {home.city}
                            {home.state ? `, ${home.state}` : ""}
                          </p>
                        )}
                        <div className="mt-2.5 flex gap-3 text-[11px] text-[hsl(var(--muted-foreground))]">
                          <span>{home._count.rooms} rooms</span>
                          <span className="text-[hsl(var(--border))]">&middot;</span>
                          <span>{home._count.items} items</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
