import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserHomeRole, requireOwner } from "@/lib/permissions";

interface Context {
  params: Promise<{ homeId: string; userId: string }>;
}

/**
 * PUT /api/homes/[homeId]/members/[userId]
 * Change a member's role. Only owners can change roles.
 */
export async function PUT(req: NextRequest, ctx: Context) {
  try {
    const currentUser = await requireAuth();
    const { homeId, userId } = await ctx.params;

    // Only owners can change roles
    try {
      await requireOwner(currentUser.id, homeId);
    } catch {
      return NextResponse.json(
        { success: false, error: "Only home owners can change roles" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { role } = body;

    if (!role || !["owner", "editor", "viewer"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role. Must be owner, editor, or viewer." },
        { status: 400 }
      );
    }

    // Check that the target user is a member
    const targetMember = await prisma.homeUser.findUnique({
      where: { userId_homeId: { userId, homeId } },
    });

    if (!targetMember) {
      return NextResponse.json(
        { success: false, error: "User is not a member of this home" },
        { status: 404 }
      );
    }

    // If changing own role away from owner, check if there's at least one other owner
    if (userId === currentUser.id && targetMember.role === "owner" && role !== "owner") {
      const ownerCount = await prisma.homeUser.count({
        where: { homeId, role: "owner" },
      });

      if (ownerCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot change role — you are the last owner of this home",
          },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.homeUser.update({
      where: { userId_homeId: { userId, homeId } },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update member role" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/homes/[homeId]/members/[userId]
 * Remove a member from a home.
 * - Owners can remove others
 * - Members can remove themselves
 */
export async function DELETE(_req: NextRequest, ctx: Context) {
  try {
    const currentUser = await requireAuth();
    const { homeId, userId } = await ctx.params;

    const currentUserRole = await getUserHomeRole(currentUser.id, homeId);
    if (!currentUserRole) {
      return NextResponse.json(
        { success: false, error: "Not a member of this home" },
        { status: 403 }
      );
    }

    // Non-owners can only remove themselves
    if (currentUser.id !== userId && currentUserRole !== "owner") {
      return NextResponse.json(
        { success: false, error: "Only owners can remove other members" },
        { status: 403 }
      );
    }

    // Check target membership exists
    const targetMember = await prisma.homeUser.findUnique({
      where: { userId_homeId: { userId, homeId } },
    });

    if (!targetMember) {
      return NextResponse.json(
        { success: false, error: "User is not a member of this home" },
        { status: 404 }
      );
    }

    // If removing self and is the last owner, block
    if (userId === currentUser.id && targetMember.role === "owner") {
      const ownerCount = await prisma.homeUser.count({
        where: { homeId, role: "owner" },
      });

      if (ownerCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Cannot leave — you are the last owner. Transfer ownership first.",
          },
          { status: 400 }
        );
      }
    }

    await prisma.homeUser.delete({
      where: { userId_homeId: { userId, homeId } },
    });

    return NextResponse.json({
      success: true,
      data: { userId, homeId },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
