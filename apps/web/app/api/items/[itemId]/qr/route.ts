import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import QRCode from "qrcode";

interface Context {
  params: Promise<{ itemId: string }>;
}

export async function GET(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { itemId } = await ctx.params;

    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        home: { users: { some: { userId: user.id } } },
      },
    });

    if (!item) {
      return new Response(JSON.stringify({ success: false, error: "Item not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://homebase-ai-omega.vercel.app";
    const itemUrl = `${baseUrl}/items/${itemId}`;

    const format = req.nextUrl.searchParams.get("format") || "png";

    if (format === "svg") {
      const svg = await QRCode.toString(itemUrl, {
        type: "svg",
        width: 256,
        margin: 2,
        color: { dark: "#0A2E4D", light: "#FFFFFF" },
      });
      return new Response(svg, {
        headers: { "Content-Type": "image/svg+xml" },
      });
    }

    const pngBuffer = await QRCode.toBuffer(itemUrl, {
      type: "png",
      width: 512,
      margin: 2,
      color: { dark: "#0A2E4D", light: "#FFFFFF" },
    });

    return new Response(new Uint8Array(pngBuffer), {
      headers: { "Content-Type": "image/png" },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
