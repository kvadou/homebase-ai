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
    <div className="space-y-8">
      {/* Continue Onboarding (shown if user skipped) */}
      <ContinueSetupCard />

      {/* Pending Invitations */}
      <PendingInvitationsBanner />

      {/* Recall Alert Banner */}
      <RecallDashboardBanner recallCount={recallCount} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">
            Welcome back{user.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="mt-1 text-[hsl(var(--muted-foreground))]">
            Here&apos;s an overview of your homes and activity.
          </p>
        </div>
        <Button asChild>
          <Link href="/home/new">
            <Plus className="h-4 w-4" />
            Add Home
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Homes
            </CardTitle>
            <Home className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{homes.length}</div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {homes.reduce((s, h) => s + h._count.rooms, 0)} rooms total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Items
            </CardTitle>
            <Package className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Across all homes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Maintenance
            </CardTitle>
            <Wrench className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceTasks.length}</div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {overdueTasks.length > 0 ? (
                <span className="text-red-500 font-medium">
                  {overdueTasks.length} overdue
                </span>
              ) : (
                "All on track"
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Service Requests
            </CardTitle>
            <Users className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceRequests.length}</div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Active requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Autopilot CTA */}
      {homesNeedingPlan.length > 0 && (
        <Link href="/dashboard/maintenance">
          <Card className="group cursor-pointer border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 transition-all hover:shadow-md dark:border-teal-900/50 dark:from-teal-950/20 dark:to-cyan-950/20">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/20">
                <Sparkles className="h-6 w-6 text-teal-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-teal-900 dark:text-teal-200">
                  Set up your maintenance plan
                </p>
                <p className="mt-0.5 text-xs text-teal-700 dark:text-teal-400">
                  {homesNeedingPlan.length === 1
                    ? `${homesNeedingPlan[0].name} has ${homesNeedingPlan[0]._count.items} items but no maintenance schedule.`
                    : `${homesNeedingPlan.length} homes have items but no maintenance schedule.`}{" "}
                  Use AI Autopilot to generate one in seconds.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-teal-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/scan">
          <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-teal-500/30">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 transition-colors group-hover:bg-teal-500/20">
                <ScanLine className="h-5 w-5 text-teal-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Scan Item</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  AI-powered identification
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 transition-opacity group-hover:opacity-100" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/chat">
          <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-teal-500/30">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 transition-colors group-hover:bg-teal-500/20">
                <MessageSquare className="h-5 w-5 text-teal-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Chat with AI</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Ask about your home
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 transition-opacity group-hover:opacity-100" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/maintenance">
          <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-teal-500/30">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 transition-colors group-hover:bg-teal-500/20">
                <Wrench className="h-5 w-5 text-teal-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Maintenance</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Track & schedule tasks
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 transition-opacity group-hover:opacity-100" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/providers">
          <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-teal-500/30">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 transition-colors group-hover:bg-teal-500/20">
                <Users className="h-5 w-5 text-teal-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Providers</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Find service pros
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 transition-opacity group-hover:opacity-100" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Two-column layout for maintenance + chat */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Maintenance Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Maintenance
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/dashboard/maintenance">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {maintenanceTasks.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle2 className="mb-2 h-8 w-8 text-teal-500" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  No pending maintenance tasks.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Recent Chats
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
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
              <div className="space-y-3">
                {chatSessions.map((session) => (
                  <Link
                    key={session.id}
                    href="/dashboard/chat"
                    className="flex items-start gap-3 rounded-lg border border-[hsl(var(--border))] p-3 transition-colors hover:bg-[hsl(var(--muted))]/50"
                  >
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
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
      <div>
        <h2 className="font-heading text-xl font-semibold">Your Homes</h2>
        {homes.length === 0 ? (
          <Card className="mt-4">
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
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homes.map((home) => (
              <Link key={home.id} href={`/home/${home.id}`}>
                <Card className="transition-all duration-200 hover:shadow-md hover:border-[hsl(var(--ring))]/30 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
                        <Home className="h-6 w-6 text-teal-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading font-semibold truncate">
                          {home.name}
                        </h3>
                        {home.address && (
                          <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))] truncate">
                            {home.city}
                            {home.state ? `, ${home.state}` : ""}
                          </p>
                        )}
                        <div className="mt-3 flex gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                          <span>{home._count.rooms} rooms</span>
                          <span>{home._count.items} items</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
