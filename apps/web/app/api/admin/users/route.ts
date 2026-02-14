import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan") || "";
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? "asc" as const : "desc" as const;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (plan) {
      where.subscription = { plan };
    }

    const sortField = ["createdAt", "email", "firstName"].includes(sort) ? sort : "createdAt";

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
          subscription: {
            select: {
              plan: true,
              status: true,
            },
          },
          _count: {
            select: {
              homes: true,
            },
          },
        },
        orderBy: { [sortField]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Get item counts for these users via their homes
    const userIds = users.map((u) => u.id);
    const itemCounts = await prisma.homeUser.findMany({
      where: { userId: { in: userIds } },
      select: {
        userId: true,
        home: {
          select: {
            _count: {
              select: { items: true },
            },
          },
        },
      },
    });

    const itemCountMap: Record<string, number> = {};
    for (const hu of itemCounts) {
      itemCountMap[hu.userId] = (itemCountMap[hu.userId] || 0) + hu.home._count.items;
    }

    const data = users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      imageUrl: u.imageUrl,
      isAdmin: u.isAdmin,
      plan: u.subscription?.plan || "free",
      subscriptionStatus: u.subscription?.status || "none",
      homeCount: u._count.homes,
      itemCount: itemCountMap[u.id] || 0,
      createdAt: u.createdAt,
      lastActive: u.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
