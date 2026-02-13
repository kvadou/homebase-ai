import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createRealtorSchema = z.object({
  company: z.string().max(200).optional(),
  licenseNumber: z.string().max(100).optional(),
  territory: z.string().max(200).optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();

    const account = await prisma.realtorAccount.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      data: account,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const parsed = createRealtorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    // Check if account already exists
    const existing = await prisma.realtorAccount.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Realtor account already exists" },
        { status: 409 }
      );
    }

    const account = await prisma.realtorAccount.create({
      data: {
        userId: user.id,
        company: parsed.data.company,
        licenseNumber: parsed.data.licenseNumber,
        territory: parsed.data.territory,
      },
    });

    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create realtor account" },
      { status: 500 }
    );
  }
}
