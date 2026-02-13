import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface CPSCRecall {
  RecallNumber: string;
  RecallDate: string;
  Description: string;
  Title: string;
  URL: string;
  Hazards?: { Name: string }[];
  Remedies?: { Name: string }[];
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

async function processRecallsForItem(
  itemId: string,
  recalls: CPSCRecall[],
  userIds: string[]
): Promise<number> {
  let created = 0;

  for (const recall of recalls) {
    const title = recall.Title || `Recall #${recall.RecallNumber}`;

    // Skip duplicates by checking title + itemId
    const existing = await prisma.itemRecall.findFirst({
      where: { itemId, title },
    });

    if (existing) continue;

    const severity = classifySeverity(recall);

    await prisma.itemRecall.create({
      data: {
        itemId,
        title,
        description: recall.Description || null,
        severity,
        recallDate: recall.RecallDate ? new Date(recall.RecallDate) : null,
        sourceUrl: recall.URL || null,
      },
    });

    // Create notification for each user associated with the item's home
    for (const userId of userIds) {
      await prisma.notification.create({
        data: {
          userId,
          type: "product_recall",
          title: "Product Recall Alert",
          body: `${title}`,
          link: `/items/${itemId}`,
        },
      });
    }

    created++;
  }

  return created;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { itemId, homeId } = body as { itemId?: string; homeId?: string };

    if (!itemId && !homeId) {
      return NextResponse.json(
        { success: false, error: "Either itemId or homeId is required" },
        { status: 400 }
      );
    }

    let items;

    if (itemId) {
      // Check single item
      const item = await prisma.item.findFirst({
        where: {
          id: itemId,
          home: { users: { some: { userId: user.id } } },
        },
        include: {
          home: { include: { users: { select: { userId: true } } } },
        },
      });

      if (!item) {
        return NextResponse.json(
          { success: false, error: "Item not found" },
          { status: 404 }
        );
      }

      items = [item];
    } else {
      // Check all items in a home
      const home = await prisma.home.findFirst({
        where: {
          id: homeId,
          users: { some: { userId: user.id } },
        },
      });

      if (!home) {
        return NextResponse.json(
          { success: false, error: "Home not found" },
          { status: 404 }
        );
      }

      items = await prisma.item.findMany({
        where: {
          homeId: homeId!,
          brand: { not: null },
        },
        include: {
          home: { include: { users: { select: { userId: true } } } },
        },
      });
    }

    let totalRecallsFound = 0;
    let totalRecallsCreated = 0;

    for (const item of items) {
      if (!item.brand) continue;

      const recalls = await checkCPSCForItem(item.brand, item.model);
      totalRecallsFound += recalls.length;

      const userIds = item.home.users.map((u) => u.userId);
      const created = await processRecallsForItem(item.id, recalls, userIds);
      totalRecallsCreated += created;
    }

    return NextResponse.json({
      success: true,
      data: {
        itemsChecked: items.length,
        recallsFound: totalRecallsFound,
        newRecallsCreated: totalRecallsCreated,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Recall check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check recalls" },
      { status: 500 }
    );
  }
}
