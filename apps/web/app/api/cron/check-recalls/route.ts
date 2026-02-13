import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface CPSCRecall {
  RecallNumber: string;
  RecallDate: string;
  Description: string;
  Title: string;
  URL: string;
  Hazards?: { Name: string }[];
}

function classifySeverity(recall: CPSCRecall): string {
  const text = `${recall.Title} ${recall.Description} ${(recall.Hazards ?? []).map((h) => h.Name).join(" ")}`.toLowerCase();
  if (text.includes("death") || text.includes("fatal") || text.includes("fire") || text.includes("electrocution")) {
    return "critical";
  }
  if (text.includes("serious injury") || text.includes("burn") || text.includes("laceration") || text.includes("shock")) {
    return "high";
  }
  if (text.includes("injury") || text.includes("hazard")) {
    return "moderate";
  }
  return "low";
}

async function checkCPSCForItem(brand: string, model: string | null): Promise<CPSCRecall[]> {
  const searchTerms = model ? `${brand}+${model}` : brand;
  const url = `https://www.saferproducts.gov/RestWebServices/Recall?format=json&ProductName=${encodeURIComponent(searchTerms)}`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`CPSC API returned status ${response.status}`);
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data as CPSCRecall[];
  } catch (error) {
    console.error("CPSC API error:", error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Find all items with brand info
  const items = await prisma.item.findMany({
    where: {
      brand: { not: null },
    },
    include: {
      home: {
        include: {
          users: { select: { userId: true } },
        },
      },
    },
  });

  let itemsChecked = 0;
  let recallsCreated = 0;
  let notificationsCreated = 0;

  for (const item of items) {
    if (!item.brand) continue;

    itemsChecked++;
    const recalls = await checkCPSCForItem(item.brand, item.model);

    for (const recall of recalls) {
      const title = recall.Title || `Recall #${recall.RecallNumber}`;

      // Skip duplicates by checking title + itemId
      const existing = await prisma.itemRecall.findFirst({
        where: { itemId: item.id, title },
      });

      if (existing) continue;

      const severity = classifySeverity(recall);

      await prisma.itemRecall.create({
        data: {
          itemId: item.id,
          title,
          description: recall.Description || null,
          severity,
          recallDate: recall.RecallDate ? new Date(recall.RecallDate) : null,
          sourceUrl: recall.URL || null,
        },
      });

      recallsCreated++;

      // Create notification for each home user
      for (const homeUser of item.home.users) {
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: homeUser.userId,
            type: "product_recall",
            link: `/items/${item.id}`,
            createdAt: { gte: new Date(new Date().toDateString()) },
          },
        });

        if (!existingNotification) {
          await prisma.notification.create({
            data: {
              userId: homeUser.userId,
              type: "product_recall",
              title: "Product Recall Alert",
              body: `${item.name}: ${title}`,
              link: `/items/${item.id}`,
            },
          });
          notificationsCreated++;
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: { itemsChecked, recallsCreated, notificationsCreated },
  });
}
