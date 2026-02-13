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
  const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Find items with warranties expiring in 30, 7, or 1 day(s)
  const items = await prisma.item.findMany({
    where: {
      warrantyExpiry: {
        gte: now,
        lte: in30Days,
      },
    },
    include: {
      home: {
        include: {
          users: { select: { userId: true } },
        },
      },
    },
  });

  let created = 0;

  for (const item of items) {
    const daysUntilExpiry = Math.ceil(
      (item.warrantyExpiry!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    let urgency: string;
    if (daysUntilExpiry <= 1) {
      urgency = "tomorrow";
    } else if (daysUntilExpiry <= 7) {
      urgency = `in ${daysUntilExpiry} days`;
    } else {
      urgency = `in ${daysUntilExpiry} days`;
    }

    // Create notification for each home user
    for (const homeUser of item.home.users) {
      // Check if we already sent this notification today
      const existing = await prisma.notification.findFirst({
        where: {
          userId: homeUser.userId,
          type: "warranty_expiry",
          link: `/items/${item.id}`,
          createdAt: { gte: new Date(now.toDateString()) },
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId: homeUser.userId,
            type: "warranty_expiry",
            title: "Warranty Expiring",
            body: `${item.name} warranty expires ${urgency}.`,
            link: `/items/${item.id}`,
          },
        });

        // Also send push notification
        await sendPushNotification(homeUser.userId, {
          title: "Warranty Expiring",
          body: `${item.name} warranty expires ${urgency}.`,
          link: `/items/${item.id}`,
        });

        created++;
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: { itemsChecked: items.length, notificationsCreated: created },
  });
}
