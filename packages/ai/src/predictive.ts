import { getClaudeClient, DEFAULT_MODEL } from "./claude";

export interface MaintenancePrediction {
  title: string;
  description: string;
  urgency: "low" | "medium" | "high";
  estimatedDueDate: string;
  estimatedCost: string;
  reasoning: string;
  frequency: string;
}

export interface PredictiveResult {
  predictions: MaintenancePrediction[];
  overallHealth: string;
  tips: string[];
}

interface ItemData {
  name: string;
  brand: string | null;
  model: string | null;
  category: string;
  condition: string | null;
  purchaseDate: Date | null;
  warrantyExpiry: Date | null;
}

interface MaintenanceLogEntry {
  title: string;
  description: string | null;
  frequency: string | null;
  status: string;
  nextDueDate: Date | null;
  logs: Array<{
    notes: string | null;
    cost: number | null;
    performedAt: Date;
  }>;
}

export async function predictMaintenanceNeeds(
  item: ItemData,
  maintenanceLogs: MaintenanceLogEntry[],
  manualChunks?: string[]
): Promise<PredictiveResult> {
  const claude = getClaudeClient();

  const today = new Date().toISOString().split("T")[0];

  const itemDescription = [
    `Name: ${item.name}`,
    item.brand ? `Brand: ${item.brand}` : null,
    item.model ? `Model: ${item.model}` : null,
    `Category: ${item.category}`,
    item.condition ? `Condition: ${item.condition}` : null,
    item.purchaseDate
      ? `Purchase Date: ${item.purchaseDate.toISOString().split("T")[0]}`
      : null,
    item.warrantyExpiry
      ? `Warranty Expires: ${item.warrantyExpiry.toISOString().split("T")[0]}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const maintenanceHistory =
    maintenanceLogs.length > 0
      ? maintenanceLogs
          .map((task) => {
            const logEntries = task.logs
              .map(
                (log) =>
                  `  - ${log.performedAt.toISOString().split("T")[0]}: ${log.notes ?? "No notes"}${log.cost ? ` (Cost: $${log.cost})` : ""}`
              )
              .join("\n");
            return `Task: ${task.title} (Status: ${task.status}, Frequency: ${task.frequency ?? "none"})${task.nextDueDate ? `\n  Next Due: ${task.nextDueDate.toISOString().split("T")[0]}` : ""}${logEntries ? `\n  Logs:\n${logEntries}` : ""}`;
          })
          .join("\n\n")
      : "No maintenance history recorded.";

  const manualContext =
    manualChunks && manualChunks.length > 0
      ? `\n\nRelevant manual excerpts:\n${manualChunks.join("\n---\n")}`
      : "";

  const systemPrompt = `You are a home maintenance expert. Analyze the provided item data, maintenance history, and any manual excerpts to predict upcoming maintenance needs.

Today's date is ${today}.

You MUST respond with valid JSON matching this exact schema (no markdown, no code fences, just raw JSON):

{
  "predictions": [
    {
      "title": "Short maintenance task title",
      "description": "Detailed description of what needs to be done",
      "urgency": "low" | "medium" | "high",
      "estimatedDueDate": "YYYY-MM-DD",
      "estimatedCost": "$XX-$XX",
      "reasoning": "Why this maintenance is needed based on the data",
      "frequency": "e.g. every 6 months, annually, every 3 months"
    }
  ],
  "overallHealth": "Brief summary of the item's overall maintenance health",
  "tips": ["Practical maintenance tip 1", "Tip 2", ...]
}

Guidelines:
- Provide 2-6 realistic maintenance predictions based on the item type, age, condition, and history
- Set urgency based on how soon the task is needed and its impact on the item's longevity
- Use realistic cost estimates based on typical market prices
- Base due dates on industry-standard maintenance intervals for the item category
- Consider the item's age and condition when making predictions
- If manual excerpts are provided, use manufacturer-recommended maintenance schedules
- Provide 2-4 practical tips specific to the item type
- If the item has no maintenance history, recommend starting with essential maintenance tasks`;

  const userMessage = `Item Details:
${itemDescription}

Maintenance History:
${maintenanceHistory}${manualContext}

Please analyze this item and predict its upcoming maintenance needs.`;

  const response = await claude.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const rawText = textBlock?.text ?? "{}";

  const jsonText = rawText
    .replace(/```json?\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return {
      predictions: [],
      overallHealth: "Unable to analyze item maintenance at this time.",
      tips: [],
    };
  }

  const validUrgencies = ["low", "medium", "high"] as const;
  type Urgency = (typeof validUrgencies)[number];

  const predictions: MaintenancePrediction[] = (
    Array.isArray(parsed.predictions) ? parsed.predictions : []
  ).map(
    (p: {
      title?: string;
      description?: string;
      urgency?: string;
      estimatedDueDate?: string;
      estimatedCost?: string;
      reasoning?: string;
      frequency?: string;
    }) => ({
      title: p.title ?? "Maintenance Task",
      description: p.description ?? "",
      urgency: validUrgencies.includes(p.urgency as Urgency)
        ? (p.urgency as Urgency)
        : "medium",
      estimatedDueDate: p.estimatedDueDate ?? "",
      estimatedCost: p.estimatedCost ?? "Unknown",
      reasoning: p.reasoning ?? "",
      frequency: p.frequency ?? "",
    })
  );

  return {
    predictions,
    overallHealth:
      typeof parsed.overallHealth === "string"
        ? parsed.overallHealth
        : "Unable to determine overall health.",
    tips: Array.isArray(parsed.tips)
      ? parsed.tips.filter((t: unknown) => typeof t === "string")
      : [],
  };
}
