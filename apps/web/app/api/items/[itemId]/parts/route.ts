import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface Context {
  params: Promise<{ itemId: string }>;
}

const createPartSchema = z.object({
  itemId: z.string().min(1),
  name: z.string().min(1, "Name is required").max(300),
  partNumber: z.string().max(200).optional(),
  manufacturer: z.string().max(200).optional(),
  price: z.number().min(0).optional(),
  sourceUrl: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  filterSize: z.string().max(100).optional(),
  quantity: z.number().int().min(0).optional(),
  lastReplacedDate: z.string().optional(),
  replacementInterval: z.string().max(100).optional(),
});

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
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    const parts = await prisma.part.findMany({
      where: { itemId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: parts });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { itemId } = await ctx.params;
    const body = await req.json();

    const parsed = createPartSchema.safeParse({ ...body, itemId });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        home: { users: { some: { userId: user.id } } },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    const { lastReplacedDate, ...rest } = parsed.data;

    const part = await prisma.part.create({
      data: {
        ...rest,
        ...(lastReplacedDate && {
          lastReplacedDate: new Date(lastReplacedDate),
        }),
      },
    });

    return NextResponse.json({ success: true, data: part }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create part" },
      { status: 500 }
    );
  }
}
