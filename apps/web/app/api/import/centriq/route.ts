import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { csv, homeId } = body as {
      csv: string;
      homeId: string;
    };

    if (!csv || !homeId) {
      return NextResponse.json(
        { success: false, error: "csv and homeId are required" },
        { status: 400 }
      );
    }

    // Verify user has access to the home
    const home = await prisma.home.findFirst({
      where: { id: homeId, users: { some: { userId: user.id } } },
    });
    if (!home) {
      return NextResponse.json(
        { success: false, error: "Home not found" },
        { status: 404 }
      );
    }

    // Parse CSV
    const rows = parseCSV(csv);
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "No data rows found in CSV" },
        { status: 400 }
      );
    }

    // Map columns from Centriq format
    const items = rows.map((row) => mapCentriqRow(row, homeId));

    // Batch create
    const result = await prisma.item.createMany({
      data: items,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      data: { imported: result.count },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Centriq import error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import data" },
      { status: 500 }
    );
  }
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) =>
    h.trim().toLowerCase().replace(/\s+/g, "_")
  );

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j]?.trim() ?? "";
    }
    rows.push(row);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Column name variations that Centriq exports might use
const COLUMN_MAP: Record<string, string[]> = {
  name: ["item_name", "name", "product_name", "product", "item", "title"],
  brand: ["brand", "manufacturer", "make"],
  model: ["model", "model_name", "model_number"],
  serialNumber: ["serial", "serial_number", "serial_no", "sn"],
  category: ["category", "type", "product_type", "item_type"],
  room: ["room", "location", "room_name", "area"],
  purchaseDate: [
    "purchase_date",
    "purchased",
    "date_purchased",
    "buy_date",
    "date",
  ],
  purchasePrice: ["purchase_price", "price", "cost", "amount"],
  warrantyExpiry: [
    "warranty_expiry",
    "warranty_end",
    "warranty_expiration",
    "warranty_date",
    "warranty",
  ],
  notes: ["notes", "description", "comments", "memo"],
  modelNumber: ["model_number", "model_no", "model_#"],
};

function findColumn(
  row: Record<string, string>,
  candidates: string[]
): string {
  for (const candidate of candidates) {
    if (row[candidate] !== undefined && row[candidate] !== "") {
      return row[candidate];
    }
  }
  return "";
}

function mapCentriqRow(
  row: Record<string, string>,
  homeId: string
): {
  homeId: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  modelNumber: string | null;
  purchaseDate: Date | null;
  purchasePrice: number | null;
  warrantyExpiry: Date | null;
  notes: string | null;
} {
  const name = findColumn(row, COLUMN_MAP.name) || "Unnamed Item";
  const category = findColumn(row, COLUMN_MAP.category) || "Other";
  const brand = findColumn(row, COLUMN_MAP.brand) || null;
  const model = findColumn(row, COLUMN_MAP.model) || null;
  const serialNumber = findColumn(row, COLUMN_MAP.serialNumber) || null;
  const modelNumber = findColumn(row, COLUMN_MAP.modelNumber) || null;
  const notes = findColumn(row, COLUMN_MAP.notes) || null;

  const purchaseDateStr = findColumn(row, COLUMN_MAP.purchaseDate);
  let purchaseDate: Date | null = null;
  if (purchaseDateStr) {
    const parsed = new Date(purchaseDateStr);
    if (!isNaN(parsed.getTime())) purchaseDate = parsed;
  }

  const purchasePriceStr = findColumn(row, COLUMN_MAP.purchasePrice);
  let purchasePrice: number | null = null;
  if (purchasePriceStr) {
    const cleaned = purchasePriceStr.replace(/[$,]/g, "");
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) purchasePrice = parsed;
  }

  const warrantyExpiryStr = findColumn(row, COLUMN_MAP.warrantyExpiry);
  let warrantyExpiry: Date | null = null;
  if (warrantyExpiryStr) {
    const parsed = new Date(warrantyExpiryStr);
    if (!isNaN(parsed.getTime())) warrantyExpiry = parsed;
  }

  return {
    homeId,
    name,
    category,
    brand,
    model,
    serialNumber,
    modelNumber,
    purchaseDate,
    purchasePrice,
    warrantyExpiry,
    notes,
  };
}
