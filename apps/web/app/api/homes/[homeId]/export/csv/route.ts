import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Context {
  params: Promise<{ homeId: string }>;
}

function escapeCSV(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function GET(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { homeId } = await ctx.params;

    const home = await prisma.home.findFirst({
      where: {
        id: homeId,
        users: { some: { userId: user.id } },
      },
      select: { id: true, name: true },
    });

    if (!home) {
      return new Response(JSON.stringify({ success: false, error: "Home not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const items = await prisma.item.findMany({
      where: { homeId },
      include: {
        room: { select: { name: true } },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const headers = [
      "Name",
      "Category",
      "Room",
      "Brand",
      "Model",
      "Serial Number",
      "Purchase Date",
      "Purchase Price",
      "Warranty Expiry",
      "Condition",
    ];

    const rows = items.map((item) =>
      [
        escapeCSV(item.name),
        escapeCSV(item.category),
        escapeCSV(item.room?.name),
        escapeCSV(item.brand),
        escapeCSV(item.model),
        escapeCSV(item.serialNumber),
        escapeCSV(formatDate(item.purchaseDate)),
        item.purchasePrice != null ? String(item.purchasePrice) : "",
        escapeCSV(formatDate(item.warrantyExpiry)),
        escapeCSV(item.condition),
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const filename = `${home.name.replace(/[^a-zA-Z0-9]/g, "_")}_Items.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
