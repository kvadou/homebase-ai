import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushNotification } from "@/lib/push";

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Find overdue tasks
  const overdueTasks = await prisma.maintenanceTask.findMany({
    where: {
      status: { not: "completed" },
      nextDueDate: { lt: now },
    },
    include: {
      item: {
        include: {
          home: { include: { users: { select: { userId: true } } } },
        },
      },
    },
  });

  // Find upcoming tasks (due within 7 days)
  const upcomingTasks = await prisma.maintenanceTask.findMany({
    where: {
      status: { not: "completed" },
      nextDueDate: { gte: now, lte: in7Days },
    },
    include: {
      item: {
        include: {
          home: { include: { users: { select: { userId: true } } } },
        },
      },
    },
  });

  let created = 0;
  const todayStart = new Date(now.toDateString());

  // Notify about overdue tasks
  for (const task of overdueTasks) {
    for (const homeUser of task.item.home.users) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: homeUser.userId,
          type: "maintenance_overdue",
          link: `/dashboard/maintenance`,
          body: { contains: task.id },
          createdAt: { gte: todayStart },
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId: homeUser.userId,
            type: "maintenance_overdue",
            title: "Overdue Maintenance",
            body: `"${task.title}" for ${task.item.name} is overdue. ${task.id}`,
            link: "/dashboard/maintenance",
          },
        });

        // Also send push notification
        await sendPushNotification(homeUser.userId, {
          title: "Overdue Maintenance",
          body: `"${task.title}" for ${task.item.name} is overdue.`,
          link: "/dashboard/maintenance",
        });

        created++;
      }
    }
  }

  // Notify about upcoming tasks
  for (const task of upcomingTasks) {
    const daysUntil = Math.ceil(
      (task.nextDueDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (const homeUser of task.item.home.users) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: homeUser.userId,
          type: "maintenance_due",
          link: "/dashboard/maintenance",
          body: { contains: task.id },
          createdAt: { gte: todayStart },
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId: homeUser.userId,
            type: "maintenance_due",
            title: "Upcoming Maintenance",
            body: `"${task.title}" for ${task.item.name} is due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}.`,
            link: "/dashboard/maintenance",
          },
        });

        // Also send push notification
        await sendPushNotification(homeUser.userId, {
          title: "Upcoming Maintenance",
          body: `"${task.title}" for ${task.item.name} is due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}.`,
          link: "/dashboard/maintenance",
        });

        created++;
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      overdueChecked: overdueTasks.length,
      upcomingChecked: upcomingTasks.length,
      notificationsCreated: created,
    },
  });
}
