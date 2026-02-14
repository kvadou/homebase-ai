import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        homes: {
          include: {
            home: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                state: true,
                _count: {
                  select: { items: true, rooms: true },
                },
              },
            },
          },
        },
        chatSessions: {
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            updatedAt: true,
          },
        },
        supportTickets: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            subject: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const data = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      subscription: user.subscription
        ? {
            plan: user.subscription.plan,
            status: user.subscription.status,
            currentPeriodStart: user.subscription.currentPeriodStart,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
          }
        : null,
      homes: user.homes.map((hu) => ({
        id: hu.home.id,
        name: hu.home.name,
        address: hu.home.address,
        city: hu.home.city,
        state: hu.home.state,
        role: hu.role,
        itemCount: hu.home._count.items,
        roomCount: hu.home._count.rooms,
      })),
      recentActivity: {
        chatSessions: user.chatSessions,
        supportTickets: user.supportTickets,
      },
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch user";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { userId } = await params;

    const body = await req.json();

    // Prevent admin from removing their own admin status
    if (body.isAdmin === false && admin.id === userId) {
      return NextResponse.json(
        { success: false, error: "Cannot remove your own admin status" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (typeof body.isAdmin === "boolean") {
      updateData.isAdmin = body.isAdmin;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
