// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any;

// Tool definitions for Claude tool_use - these describe what queries are available
export interface HomeQueryToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export function getHomeQueryTools(): HomeQueryToolDefinition[] {
  return [
    {
      name: "search_items",
      description:
        "Search for items in the home by name, category, brand, model, or room. Returns matching items with details.",
      input_schema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search term to match against item name, brand, or model",
          },
          category: {
            type: "string",
            description: "Filter by category (e.g. appliance, furniture, electronics)",
          },
          room: {
            type: "string",
            description: "Filter by room name",
          },
          brand: {
            type: "string",
            description: "Filter by brand name",
          },
        },
      },
    },
    {
      name: "get_maintenance_history",
      description:
        "Get maintenance logs with optional filters. Shows completed maintenance tasks, costs, dates, and who performed the work.",
      input_schema: {
        type: "object",
        properties: {
          startDate: {
            type: "string",
            description: "Start date filter (ISO format, e.g. 2024-01-01)",
          },
          endDate: {
            type: "string",
            description: "End date filter (ISO format)",
          },
          itemName: {
            type: "string",
            description: "Filter by item name (partial match)",
          },
          minCost: {
            type: "number",
            description: "Minimum cost filter",
          },
          maxCost: {
            type: "number",
            description: "Maximum cost filter",
          },
        },
      },
    },
    {
      name: "get_warranty_status",
      description:
        "Get warranty information for items. Can filter to show only items with warranties expiring soon.",
      input_schema: {
        type: "object",
        properties: {
          expiringWithinDays: {
            type: "number",
            description:
              "Show warranties expiring within this many days from now",
          },
          expired: {
            type: "boolean",
            description: "If true, show only expired warranties",
          },
          active: {
            type: "boolean",
            description: "If true, show only active (non-expired) warranties",
          },
        },
      },
    },
    {
      name: "get_spending_summary",
      description:
        "Get a summary of spending on items and maintenance. Can group by category or time period.",
      input_schema: {
        type: "object",
        properties: {
          startDate: {
            type: "string",
            description: "Start date for spending period (ISO format)",
          },
          endDate: {
            type: "string",
            description: "End date for spending period (ISO format)",
          },
          groupBy: {
            type: "string",
            enum: ["category", "room", "month"],
            description: "How to group the spending data",
          },
          includeItems: {
            type: "boolean",
            description: "Include item purchase costs in addition to maintenance",
          },
        },
      },
    },
    {
      name: "get_room_items",
      description: "List all items in a specific room.",
      input_schema: {
        type: "object",
        properties: {
          roomName: {
            type: "string",
            description: "Name of the room to list items for",
          },
        },
        required: ["roomName"],
      },
    },
    {
      name: "get_provider_history",
      description:
        "Get service request history, optionally filtered by provider name or status.",
      input_schema: {
        type: "object",
        properties: {
          providerName: {
            type: "string",
            description: "Filter by provider name (partial match)",
          },
          status: {
            type: "string",
            enum: ["pending", "scheduled", "in_progress", "completed", "cancelled"],
            description: "Filter by request status",
          },
        },
      },
    },
    {
      name: "count_items",
      description:
        "Count items by various filters. Useful for questions like 'how many appliances do I have?'",
      input_schema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Filter by category",
          },
          room: {
            type: "string",
            description: "Filter by room name",
          },
          hasWarranty: {
            type: "boolean",
            description: "Filter to items that have warranty info",
          },
          hasManual: {
            type: "boolean",
            description: "Filter to items that have manuals attached",
          },
        },
      },
    },
  ];
}

// Execute a home query tool by name
export async function executeHomeQueryTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  db: DB,
  userId: string,
  homeId: string
): Promise<unknown> {
  // Verify user has access to this home
  const homeAccess = await db.homeUser.findFirst({
    where: { userId, homeId },
  });
  if (!homeAccess) {
    return { error: "You don't have access to this home." };
  }

  switch (toolName) {
    case "search_items":
      return searchItems(db, homeId, toolInput);
    case "get_maintenance_history":
      return getMaintenanceHistory(db, homeId, toolInput);
    case "get_warranty_status":
      return getWarrantyStatus(db, homeId, toolInput);
    case "get_spending_summary":
      return getSpendingSummary(db, homeId, toolInput);
    case "get_room_items":
      return getRoomItems(db, homeId, toolInput);
    case "get_provider_history":
      return getProviderHistory(db, homeId, toolInput);
    case "count_items":
      return countItems(db, homeId, toolInput);
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

async function searchItems(
  db: DB,
  homeId: string,
  input: Record<string, unknown>
) {
  const where: Record<string, unknown> = { homeId };

  if (input.query) {
    where.OR = [
      { name: { contains: input.query as string, mode: "insensitive" } },
      { brand: { contains: input.query as string, mode: "insensitive" } },
      { model: { contains: input.query as string, mode: "insensitive" } },
    ];
  }
  if (input.category) {
    where.category = { contains: input.category as string, mode: "insensitive" };
  }
  if (input.brand) {
    where.brand = { contains: input.brand as string, mode: "insensitive" };
  }
  if (input.room) {
    where.room = {
      name: { contains: input.room as string, mode: "insensitive" },
    };
  }

  const items = await db.item.findMany({
    where,
    include: {
      room: { select: { name: true } },
      manuals: { select: { id: true } },
    },
    orderBy: { name: "asc" },
    take: 50,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return items.map((item: any) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    brand: item.brand,
    model: item.model,
    serialNumber: item.serialNumber,
    room: item.room?.name ?? "Unassigned",
    purchaseDate: item.purchaseDate,
    purchasePrice: item.purchasePrice,
    warrantyExpiry: item.warrantyExpiry,
    condition: item.condition,
    hasManual: item.manuals.length > 0,
  }));
}

async function getMaintenanceHistory(
  db: DB,
  homeId: string,
  input: Record<string, unknown>
) {
  const where: Record<string, unknown> = {
    task: {
      item: { homeId },
    },
  };

  if (input.startDate || input.endDate) {
    const dateFilter: Record<string, Date> = {};
    if (input.startDate) dateFilter.gte = new Date(input.startDate as string);
    if (input.endDate) dateFilter.lte = new Date(input.endDate as string);
    where.performedAt = dateFilter;
  }

  if (input.minCost || input.maxCost) {
    const costFilter: Record<string, number> = {};
    if (input.minCost) costFilter.gte = input.minCost as number;
    if (input.maxCost) costFilter.lte = input.maxCost as number;
    where.cost = costFilter;
  }

  const logs = await db.maintenanceLog.findMany({
    where,
    include: {
      task: {
        include: {
          item: { select: { name: true, category: true, room: { select: { name: true } } } },
        },
      },
    },
    orderBy: { performedAt: "desc" },
    take: 100,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let results = logs.map((log: any) => ({
    id: log.id as string,
    taskTitle: log.task.title as string,
    itemName: log.task.item.name as string,
    itemCategory: log.task.item.category as string,
    room: (log.task.item.room?.name ?? "Unassigned") as string,
    notes: log.notes as string | null,
    cost: log.cost as number | null,
    performedAt: log.performedAt as Date,
    performedBy: log.performedBy as string | null,
  }));

  if (input.itemName) {
    const search = (input.itemName as string).toLowerCase();
    results = results.filter((r: { itemName: string }) =>
      r.itemName.toLowerCase().includes(search)
    );
  }

  const totalCost = results.reduce((sum: number, r: { cost: number | null }) => sum + (r.cost ?? 0), 0);

  return {
    logs: results,
    totalCost,
    count: results.length,
  };
}

async function getWarrantyStatus(
  db: DB,
  homeId: string,
  input: Record<string, unknown>
) {
  const now = new Date();
  const where: Record<string, unknown> = {
    homeId,
    warrantyExpiry: { not: null },
  };

  if (input.expiringWithinDays) {
    const futureDate = new Date();
    futureDate.setDate(
      futureDate.getDate() + (input.expiringWithinDays as number)
    );
    where.warrantyExpiry = { gte: now, lte: futureDate };
  } else if (input.expired) {
    where.warrantyExpiry = { lt: now };
  } else if (input.active) {
    where.warrantyExpiry = { gte: now };
  }

  const items = await db.item.findMany({
    where,
    include: {
      room: { select: { name: true } },
    },
    orderBy: { warrantyExpiry: "asc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return items.map((item: any) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    brand: item.brand,
    room: item.room?.name ?? "Unassigned",
    warrantyExpiry: item.warrantyExpiry,
    warrantyProvider: item.warrantyProvider,
    warrantyType: item.warrantyType,
    warrantyNotes: item.warrantyNotes,
    isExpired: item.warrantyExpiry ? item.warrantyExpiry < now : null,
    daysRemaining: item.warrantyExpiry
      ? Math.ceil(
          (item.warrantyExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null,
  }));
}

async function getSpendingSummary(
  db: DB,
  homeId: string,
  input: Record<string, unknown>
) {
  const startDate = input.startDate
    ? new Date(input.startDate as string)
    : undefined;
  const endDate = input.endDate
    ? new Date(input.endDate as string)
    : undefined;

  // Maintenance costs
  const logWhere: Record<string, unknown> = {
    task: { item: { homeId } },
    cost: { not: null },
  };
  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;
    logWhere.performedAt = dateFilter;
  }

  const maintenanceLogs = await db.maintenanceLog.findMany({
    where: logWhere,
    include: {
      task: {
        include: {
          item: {
            select: { name: true, category: true, room: { select: { name: true } } },
          },
        },
      },
    },
  });

  // Item purchase costs
  let itemPurchases: Array<{
    name: string;
    category: string;
    room: string;
    cost: number;
    date: Date;
  }> = [];

  if (input.includeItems !== false) {
    const itemWhere: Record<string, unknown> = {
      homeId,
      purchasePrice: { not: null },
    };
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.gte = startDate;
      if (endDate) dateFilter.lte = endDate;
      itemWhere.purchaseDate = dateFilter;
    }

    const items = await db.item.findMany({
      where: itemWhere,
      include: { room: { select: { name: true } } },
    });

    itemPurchases = items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((i: any) => i.purchasePrice != null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((i: any) => ({
        name: i.name as string,
        category: i.category as string,
        room: (i.room?.name ?? "Unassigned") as string,
        cost: i.purchasePrice as number,
        date: (i.purchaseDate ?? i.createdAt) as Date,
      }));
  }

  const totalMaintenance = maintenanceLogs.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, l: any) => sum + (l.cost ?? 0),
    0
  );
  const totalPurchases = itemPurchases.reduce((sum, i) => sum + i.cost, 0);

  const result: Record<string, unknown> = {
    totalMaintenance,
    totalPurchases,
    grandTotal: totalMaintenance + totalPurchases,
    maintenanceCount: maintenanceLogs.length,
    purchaseCount: itemPurchases.length,
  };

  if (input.groupBy === "category") {
    const byCat: Record<string, { maintenance: number; purchases: number }> = {};
    for (const log of maintenanceLogs) {
      const cat = log.task.item.category;
      if (!byCat[cat]) byCat[cat] = { maintenance: 0, purchases: 0 };
      byCat[cat].maintenance += log.cost ?? 0;
    }
    for (const item of itemPurchases) {
      if (!byCat[item.category])
        byCat[item.category] = { maintenance: 0, purchases: 0 };
      byCat[item.category].purchases += item.cost;
    }
    result.byCategory = byCat;
  } else if (input.groupBy === "room") {
    const byRoom: Record<string, { maintenance: number; purchases: number }> = {};
    for (const log of maintenanceLogs) {
      const room = log.task.item.room?.name ?? "Unassigned";
      if (!byRoom[room]) byRoom[room] = { maintenance: 0, purchases: 0 };
      byRoom[room].maintenance += log.cost ?? 0;
    }
    for (const item of itemPurchases) {
      if (!byRoom[item.room])
        byRoom[item.room] = { maintenance: 0, purchases: 0 };
      byRoom[item.room].purchases += item.cost;
    }
    result.byRoom = byRoom;
  } else if (input.groupBy === "month") {
    const byMonth: Record<string, { maintenance: number; purchases: number }> = {};
    for (const log of maintenanceLogs) {
      const key = `${log.performedAt.getFullYear()}-${String(log.performedAt.getMonth() + 1).padStart(2, "0")}`;
      if (!byMonth[key]) byMonth[key] = { maintenance: 0, purchases: 0 };
      byMonth[key].maintenance += log.cost ?? 0;
    }
    for (const item of itemPurchases) {
      const key = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, "0")}`;
      if (!byMonth[key]) byMonth[key] = { maintenance: 0, purchases: 0 };
      byMonth[key].purchases += item.cost;
    }
    result.byMonth = byMonth;
  }

  return result;
}

async function getRoomItems(
  db: DB,
  homeId: string,
  input: Record<string, unknown>
) {
  const roomName = input.roomName as string;

  const room = await db.room.findFirst({
    where: {
      homeId,
      name: { contains: roomName, mode: "insensitive" },
    },
    include: {
      items: {
        include: {
          manuals: { select: { id: true } },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!room) {
    // List available rooms to help the user
    const rooms = await db.room.findMany({
      where: { homeId },
      select: { name: true },
    });
    return {
      error: `Room "${roomName}" not found.`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      availableRooms: rooms.map((r: any) => r.name),
    };
  }

  return {
    room: room.name,
    roomType: room.roomType,
    itemCount: room.items.length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: room.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      brand: item.brand,
      model: item.model,
      condition: item.condition,
      purchasePrice: item.purchasePrice,
      warrantyExpiry: item.warrantyExpiry,
      hasManual: item.manuals.length > 0,
    })),
  };
}

async function getProviderHistory(
  db: DB,
  homeId: string,
  input: Record<string, unknown>
) {
  const where: Record<string, unknown> = { homeId };

  if (input.status) {
    where.status = input.status;
  }
  if (input.providerName) {
    where.provider = {
      name: {
        contains: input.providerName as string,
        mode: "insensitive",
      },
    };
  }

  const requests = await db.serviceRequest.findMany({
    where,
    include: {
      provider: { select: { name: true, company: true, specialty: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalCost = requests.reduce((sum: number, r: any) => sum + (r.cost ?? 0), 0);

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requests: requests.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      priority: r.priority,
      provider: r.provider
        ? { name: r.provider.name, company: r.provider.company, specialty: r.provider.specialty }
        : null,
      scheduledAt: r.scheduledAt,
      completedAt: r.completedAt,
      cost: r.cost,
    })),
    totalCost,
    count: requests.length,
  };
}

async function countItems(
  db: DB,
  homeId: string,
  input: Record<string, unknown>
) {
  const where: Record<string, unknown> = { homeId };

  if (input.category) {
    where.category = { contains: input.category as string, mode: "insensitive" };
  }
  if (input.room) {
    where.room = {
      name: { contains: input.room as string, mode: "insensitive" },
    };
  }
  if (input.hasWarranty === true) {
    where.warrantyExpiry = { not: null };
  } else if (input.hasWarranty === false) {
    where.warrantyExpiry = null;
  }
  if (input.hasManual === true) {
    where.manuals = { some: {} };
  } else if (input.hasManual === false) {
    where.manuals = { none: {} };
  }

  const count = await db.item.count({ where });

  // Also get breakdown by category for context
  const items = await db.item.findMany({
    where,
    select: { category: true },
  });

  const byCategory: Record<string, number> = {};
  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
  }

  return { count, byCategory };
}
