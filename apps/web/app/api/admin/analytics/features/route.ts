import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const [
      itemsScanned,
      chatSessions,
      maintenanceTasks,
      manualsUploaded,
      serviceRequests,
      insuranceClaims,
      homePassports,
      safetyEntries,
      timelineEvents,
    ] = await Promise.all([
      prisma.item.count({ where: { photoUrl: { not: null } } }),
      prisma.chatSession.count(),
      prisma.maintenanceTask.count(),
      prisma.manual.count(),
      prisma.serviceRequest.count(),
      prisma.insuranceClaim.count(),
      prisma.homePassport.count(),
      prisma.safetyInfo.count(),
      prisma.homeEvent.count(),
    ]);

    const total =
      itemsScanned +
      chatSessions +
      maintenanceTasks +
      manualsUploaded +
      serviceRequests +
      insuranceClaims +
      homePassports +
      safetyEntries +
      timelineEvents;

    const features = [
      { name: "Items Scanned", count: itemsScanned },
      { name: "Chat Sessions", count: chatSessions },
      { name: "Maintenance Tasks", count: maintenanceTasks },
      { name: "Manuals Uploaded", count: manualsUploaded },
      { name: "Service Requests", count: serviceRequests },
      { name: "Insurance Claims", count: insuranceClaims },
      { name: "Home Passports", count: homePassports },
      { name: "Safety Entries", count: safetyEntries },
      { name: "Timeline Events", count: timelineEvents },
    ];

    return NextResponse.json({
      success: true,
      data: { features, total },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}
