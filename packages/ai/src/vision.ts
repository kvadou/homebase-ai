import { getClaudeClient, VISION_MODEL } from "./claude";

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
