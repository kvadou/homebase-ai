import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const months: { month: string; start: Date; end: Date }[] = [];

    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = start.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      months.push({ month: label, start, end });
    }

    const data = await Promise.all(
      months.map(async ({ month, start, end }) => {
        const [signups, conversions] = await Promise.all([
          prisma.user.count({
            where: { createdAt: { gte: start, lt: end } },
          }),
          prisma.subscription.count({
            where: {
              plan: { not: "free" },
              createdAt: { gte: start, lt: end },
            },
          }),
        ]);

        return { month, signups, conversions };
      })
    );

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}
