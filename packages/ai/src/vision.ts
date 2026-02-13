import { getClaudeClient, VISION_MODEL } from "./claude";

export interface ReceiptData {
  storeName: string | null;
  purchaseDate: string | null;
  items: Array<{ name: string; price: number | null; quantity: number | null }>;
  total: number | null;
  warrantyInfo: string | null;
  paymentMethod: string | null;
}

export interface ScannedItem {
  name: string;
  brand: string | null;
  model: string | null;
  category: string;
  description: string;
  condition: string;
  estimatedAge: string | null;
}

const SCAN_SYSTEM_PROMPT = `You are a home inventory assistant that identifies household items from photos.
Analyze the image and extract as much detail as possible about the item.

The image may show:
- The full item itself (e.g., a refrigerator, washer, HVAC unit)
- A label, sticker, or nameplate on the item (with brand, model number, serial number, specs)
- A barcode or QR code area on the item
- Any combination of the above

If the image shows a label or nameplate, use the information on it to identify the item. Look for:
- Brand/manufacturer name
- Model number
- Serial number
- Product type or description
- Specifications (voltage, capacity, dimensions, etc.)

Even if you can only see a label or partial view, make your best determination of what the item is based on all available clues (brand name, model format, specifications, label style, etc.).

Respond with a JSON object (no markdown fences, no explanation, just raw JSON) containing:
- name: The item's full name (e.g., "KitchenAid French Door Refrigerator" or "GE Profile Dishwasher")
- brand: The manufacturer/brand if visible or determinable (null if truly unknown)
- model: The model name/number if visible (null if unknown)
- category: One of: appliance, hvac, plumbing, electrical, furniture, electronics, outdoor, safety, structural, flooring, window, lighting, other
- description: A brief description including any notable specs or features visible
- condition: One of: excellent, good, fair, poor, needs_repair, non_functional (estimate from what you can see)
- estimatedAge: Rough estimate if determinable from model info or appearance (e.g., "2-3 years"), null if unknown`;

/**
 * Extract JSON from a response that might be wrapped in markdown code fences
 */
function extractJSON(text: string): string {
  // Try to extract from ```json ... ``` or ``` ... ``` blocks
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  // Try to find a JSON object directly
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  return text;
}

export async function analyzeItemImage(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/jpeg"
): Promise<ScannedItem> {
  const claude = getClaudeClient();

  const response = await claude.messages.create({
    model: VISION_MODEL,
    max_tokens: 1024,
    system: SCAN_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: "Identify this household item from the image. If this shows a label or nameplate, use that information to determine the item. Return raw JSON only.",
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const rawText = textBlock?.text ?? "{}";

  try {
    const jsonText = extractJSON(rawText);
    const parsed = JSON.parse(jsonText) as ScannedItem;

    // Validate that we got meaningful data
    if (!parsed.name || parsed.name === "Unknown" || parsed.name === "Unknown Item") {
      // If Claude returned unknown but we have brand/model, construct a name
      if (parsed.brand) {
        parsed.name = parsed.brand + (parsed.model ? ` ${parsed.model}` : " Item");
      }
    }

    return parsed;
  } catch (error) {
    console.error("Failed to parse scan response:", rawText, error);
    return {
      name: "Unknown Item",
      brand: null,
      model: null,
      category: "other",
      description: "Could not identify the item from the image. Try taking a clearer photo showing the full item or its label.",
      condition: "good",
      estimatedAge: null,
    };
  }
}

const RECEIPT_SYSTEM_PROMPT = `You are a receipt analysis assistant for a home inventory management system.
Analyze the receipt image and extract all relevant purchase information.

Look for:
- Store/retailer name
- Purchase date
- Individual items with their names, prices, and quantities
- Total amount
- Payment method (cash, credit card type, debit, etc.)
- Any warranty information, return policy, or guarantee details mentioned on the receipt

Respond with a JSON object (no markdown fences, no explanation, just raw JSON) containing:
- storeName: The store or retailer name (null if not visible)
- purchaseDate: The date in YYYY-MM-DD format (null if not visible)
- items: An array of objects, each with:
  - name: The item name/description as shown on the receipt
  - price: The price as a number (null if not visible)
  - quantity: The quantity purchased as a number (null if not visible, default to 1 if price is shown but quantity is not)
- total: The total amount as a number (null if not visible)
- warrantyInfo: Any warranty, return policy, or guarantee text found on the receipt (null if none)
- paymentMethod: The payment method used (null if not visible)

Important:
- Prices should be numbers without currency symbols (e.g., 29.99 not "$29.99")
- If an item has a quantity multiplier (e.g., "2 @ $5.99"), set quantity to 2 and price to 5.99
- Include tax lines and discounts as separate items if present
- Be thorough — capture every line item on the receipt`;

export async function analyzeReceipt(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/jpeg"
): Promise<ReceiptData> {
  const claude = getClaudeClient();

  const response = await claude.messages.create({
    model: VISION_MODEL,
    max_tokens: 2048,
    system: RECEIPT_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: "Extract all purchase information from this receipt image. Return raw JSON only.",
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const rawText = textBlock?.text ?? "{}";

  try {
    const jsonText = extractJSON(rawText);
    const parsed = JSON.parse(jsonText) as ReceiptData;

    // Ensure items array exists
    if (!Array.isArray(parsed.items)) {
      parsed.items = [];
    }

    return parsed;
  } catch (error) {
    console.error("Failed to parse receipt response:", rawText, error);
    return {
      storeName: null,
      purchaseDate: null,
      items: [],
      total: null,
      warrantyInfo: null,
      paymentMethod: null,
    };
  }
}
