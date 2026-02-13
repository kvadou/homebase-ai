import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateInsuranceReport } from "@/lib/pdf-generator";

interface Context {
  params: Promise<{ homeId: string }>;
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
    });

    if (!home) {
      return new Response(JSON.stringify({ success: false, error: "Home not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { searchParams } = new URL(req.url);
    const includeWarranties = searchParams.get("includeWarranties") === "true";
    const includePrices = searchParams.get("includePrices") === "true";

    const items = await prisma.item.findMany({
      where: { homeId },
      include: {
        room: { select: { name: true } },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const pdfBytes = generateInsuranceReport(home, items, {
      includeWarranties,
      includePrices,
    });

    const filename = `${home.name.replace(/[^a-zA-Z0-9]/g, "_")}_Insurance_Report.pdf`;

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
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
