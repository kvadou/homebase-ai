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

Respond with a JSON object containing:
- name: The item's common name (e.g., "Samsung French Door Refrigerator")
- brand: The manufacturer/brand if visible (null if unknown)
- model: The model name/number if visible (null if unknown)
- category: One of: appliance, hvac, plumbing, electrical, furniture, electronics, outdoor, safety, structural, flooring, window, lighting, other
- description: A brief description of the item including notable features
- condition: One of: excellent, good, fair, poor, needs_repair, non_functional
- estimatedAge: Rough estimate if determinable (e.g., "2-3 years"), null if unknown

Respond ONLY with valid JSON, no markdown or explanation.`;

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
            text: "Identify this household item and provide details in JSON format.",
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const text = textBlock?.text ?? "{}";

  try {
    return JSON.parse(text) as ScannedItem;
  } catch {
    return {
      name: "Unknown Item",
      brand: null,
      model: null,
      category: "other",
      description: "Could not identify the item from the image.",
      condition: "good",
      estimatedAge: null,
    };
  }
}
