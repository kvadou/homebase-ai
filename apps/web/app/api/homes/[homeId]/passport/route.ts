import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Context {
  params: Promise<{ homeId: string }>;
}

export async function GET(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { homeId } = await ctx.params;

    // Verify home ownership
    const home = await prisma.home.findFirst({
      where: {
        id: homeId,
        users: { some: { userId: user.id } },
      },
      include: {
        rooms: {
          orderBy: { name: "asc" },
        },
        items: {
          include: {
            room: { select: { id: true, name: true } },
            maintenanceTasks: {
              include: {
                logs: {
                  orderBy: { performedAt: "desc" },
                  take: 3,
                },
              },
              orderBy: { nextDueDate: "asc" },
            },
          },
          orderBy: { name: "asc" },
        },
        serviceRequests: {
          include: {
            provider: {
              select: { name: true, company: true, specialty: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!home) {
      return NextResponse.json(
        { success: false, error: "Home not found" },
        { status: 404 }
      );
    }

    // Build the passport data object
    const passportData = {
      generatedAt: new Date().toISOString(),
      property: {
        name: home.name,
        address: home.address,
        city: home.city,
        state: home.state,
        zipCode: home.zipCode,
        country: home.country,
        homeType: home.homeType,
        yearBuilt: home.yearBuilt,
        squareFeet: home.squareFeet,
        description: home.description,
      },
      rooms: home.rooms.map((room) => ({
        id: room.id,
        name: room.name,
        roomType: room.roomType,
        floor: room.floor,
        description: room.description,
      })),
      items: home.items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        brand: item.brand,
        model: item.model,
        serialNumber: item.serialNumber,
        modelNumber: item.modelNumber,
        purchaseDate: item.purchaseDate,
        purchasePrice: item.purchasePrice,
        condition: item.condition,
        description: item.description,
        notes: item.notes,
        room: item.room
          ? { id: item.room.id, name: item.room.name }
          : null,
        warranty: {
          expiry: item.warrantyExpiry,
          provider: item.warrantyProvider,
          type: item.warrantyType,
          notes: item.warrantyNotes,
        },
        maintenance: item.maintenanceTasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          frequency: task.frequency,
          nextDueDate: task.nextDueDate,
          priority: task.priority,
          status: task.status,
          recentLogs: task.logs.map((log) => ({
            notes: log.notes,
            cost: log.cost,
            performedAt: log.performedAt,
            performedBy: log.performedBy,
          })),
        })),
      })),
      serviceRequests: home.serviceRequests.map((sr) => ({
        id: sr.id,
        title: sr.title,
        description: sr.description,
        status: sr.status,
        priority: sr.priority,
        scheduledAt: sr.scheduledAt,
        completedAt: sr.completedAt,
        cost: sr.cost,
        provider: sr.provider
          ? {
              name: sr.provider.name,
              company: sr.provider.company,
              specialty: sr.provider.specialty,
            }
          : null,
      })),
      summary: {
        totalRooms: home.rooms.length,
        totalItems: home.items.length,
        itemsWithWarranty: home.items.filter((i) => i.warrantyExpiry).length,
        activeWarranties: home.items.filter(
          (i) => i.warrantyExpiry && new Date(i.warrantyExpiry) > new Date()
        ).length,
        pendingMaintenance: home.items.reduce(
          (count, item) =>
            count +
            item.maintenanceTasks.filter((t) => t.status !== "completed").length,
          0
        ),
        activeServiceRequests: home.serviceRequests.filter(
          (sr) => sr.status !== "completed" && sr.status !== "cancelled"
        ).length,
      },
    };

    // Upsert the HomePassport record
    const passport = await prisma.homePassport.upsert({
      where: { homeId },
      create: {
        homeId,
        data: passportData,
        generatedAt: new Date(),
      },
      update: {
        data: passportData,
        generatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: passport.id,
        homeId: passport.homeId,
        data: passport.data,
        generatedAt: passport.generatedAt,
        shareToken: passport.shareToken,
        shareExpiresAt: passport.shareExpiresAt,
        isPublic: passport.isPublic,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to generate passport" },
      { status: 500 }
    );
  }
}
