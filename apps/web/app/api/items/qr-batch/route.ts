import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import QRCode from "qrcode";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { itemIds } = body as { itemIds: string[] };

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "itemIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (itemIds.length > 100) {
      return NextResponse.json(
        { success: false, error: "Maximum 100 items per batch" },
        { status: 400 }
      );
    }

    const items = await prisma.item.findMany({
      where: {
        id: { in: itemIds },
        home: { users: { some: { userId: user.id } } },
      },
      select: { id: true, name: true },
    });

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No accessible items found" },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://homebase-ai-omega.vercel.app";
    const zip = new JSZip();

    for (const item of items) {
      const itemUrl = `${baseUrl}/items/${item.id}`;
      const pngBuffer = await QRCode.toBuffer(itemUrl, {
        type: "png",
        width: 512,
        margin: 2,
        color: { dark: "#0A2E4D", light: "#FFFFFF" },
      });
      const safeName = item.name.replace(/[^a-zA-Z0-9_-]/g, "_");
      zip.file(`${safeName}-qr.png`, pngBuffer);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=qr-labels.zip",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to generate QR codes" },
      { status: 500 }
    );
  }
}
