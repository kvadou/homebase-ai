import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalHomes,
      totalItems,
      totalRooms,
      totalMaintenanceTasks,
      totalChatSessions,
      totalManuals,
      totalServiceRequests,
      totalInsuranceClaims,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.home.count(),
      prisma.item.count(),
      prisma.room.count(),
      prisma.maintenanceTask.count(),
      prisma.chatSession.count(),
      prisma.manual.count(),
      prisma.serviceRequest.count(),
      prisma.insuranceClaim.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalHomes,
        totalItems,
        totalRooms,
        totalMaintenanceTasks,
        totalChatSessions,
        totalManuals,
        totalServiceRequests,
        totalInsuranceClaims,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}
