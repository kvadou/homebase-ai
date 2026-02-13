import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import JSZip from "jszip";

interface Context {
  params: Promise<{ homeId: string }>;
}

export async function GET(req: NextRequest, ctx: Context) {
  try {
    const user = await requireAuth();
    const { homeId } = await ctx.params;

    const home = await prisma.home.findFirst({
      where: {
        id: homeId,
        users: { some: { userId: user.id } },
      },
    });

    if (!home) {
      return NextResponse.json(
        { success: false, error: "Home not found" },
        { status: 404 }
      );
    }

    const rooms = await prisma.room.findMany({
      where: { homeId },
      orderBy: { name: "asc" },
    });

    const items = await prisma.item.findMany({
      where: { homeId },
      include: {
        room: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });

    const maintenanceTasks = await prisma.maintenanceTask.findMany({
      where: { item: { homeId } },
      include: {
        item: { select: { id: true, name: true } },
        logs: { orderBy: { performedAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    const manuals = await prisma.manual.findMany({
      where: {
        items: { some: { item: { homeId } } },
      },
      include: {
        items: {
          where: { item: { homeId } },
          include: { item: { select: { id: true, name: true } } },
        },
      },
    });

    const zip = new JSZip();

    zip.file(
      "home.json",
      JSON.stringify(
        {
          id: home.id,
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
          createdAt: home.createdAt,
          updatedAt: home.updatedAt,
        },
        null,
        2
      )
    );

    zip.file(
      "rooms.json",
      JSON.stringify(
        rooms.map((r) => ({
          id: r.id,
          name: r.name,
          roomType: r.roomType,
          floor: r.floor,
          description: r.description,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        null,
        2
      )
    );

    zip.file(
      "items.json",
      JSON.stringify(
        items.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          roomName: item.room?.name ?? null,
          brand: item.brand,
          model: item.model,
          serialNumber: item.serialNumber,
          modelNumber: item.modelNumber,
          purchaseDate: item.purchaseDate,
          purchasePrice: item.purchasePrice,
          warrantyExpiry: item.warrantyExpiry,
          warrantyProvider: item.warrantyProvider,
          warrantyType: item.warrantyType,
          warrantyNotes: item.warrantyNotes,
          condition: item.condition,
          description: item.description,
          notes: item.notes,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        null,
        2
      )
    );

    zip.file(
      "maintenance.json",
      JSON.stringify(
        maintenanceTasks.map((task) => ({
          id: task.id,
          itemName: task.item.name,
          title: task.title,
          description: task.description,
          frequency: task.frequency,
          nextDueDate: task.nextDueDate,
          priority: task.priority,
          status: task.status,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          logs: task.logs.map((log) => ({
            id: log.id,
            notes: log.notes,
            cost: log.cost,
            performedAt: log.performedAt,
            performedBy: log.performedBy,
          })),
        })),
        null,
        2
      )
    );

    zip.file(
      "manuals.json",
      JSON.stringify(
        manuals.map((manual) => ({
          id: manual.id,
          title: manual.title,
          brand: manual.brand,
          model: manual.model,
          fileUrl: manual.fileUrl,
          sourceUrl: manual.sourceUrl,
          fileType: manual.fileType,
          pageCount: manual.pageCount,
          createdAt: manual.createdAt,
          updatedAt: manual.updatedAt,
          linkedItems: manual.items.map((link) => ({
            itemId: link.item.id,
            itemName: link.item.name,
          })),
        })),
        null,
        2
      )
    );

    const zipData = await zip.generateAsync({ type: "arraybuffer" });
    const sanitizedName = home.name.replace(/[^a-zA-Z0-9-_ ]/g, "-");

    return new NextResponse(zipData, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${sanitizedName}-export.zip"`,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to export home data" },
      { status: 500 }
    );
  }
}
