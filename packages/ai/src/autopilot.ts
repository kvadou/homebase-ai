import { getClaudeClient, DEFAULT_MODEL } from "./claude";

interface HomeProfile {
  name: string;
  yearBuilt: number | null;
  zipCode: string | null;
  homeType: string | null;
  squareFeet: number | null;
}

interface ItemProfile {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  purchaseDate: string | null;
  condition: string | null;
}

export interface MaintenancePlanTask {
  title: string;
  description: string;
  frequency: string;
  nextDueDate: string;
  priority: "low" | "medium" | "high" | "critical";
  reasoning: string;
  estimatedCost: string;
  linkedItemId: string | null;
}

export interface MaintenancePlanResult {
  tasks: MaintenancePlanTask[];
  seasonalNotes: string[];
  estimatedAnnualCost: string;
}

export async function generateMaintenancePlan(
  home: HomeProfile,
  items: ItemProfile[]
): Promise<MaintenancePlanResult> {
  const claude = getClaudeClient();

  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().getMonth() + 1;

  const homeDescription = [
    `Home: ${home.name}`,
    home.homeType ? `Type: ${home.homeType}` : null,
    home.yearBuilt ? `Year Built: ${home.yearBuilt}` : null,
    home.zipCode ? `ZIP Code: ${home.zipCode} (use this to infer climate zone)` : null,
    home.squareFeet ? `Square Feet: ${home.squareFeet}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const itemDescriptions = items
    .map((item, i) => {
      const details = [
        `${i + 1}. ${item.name} (ID: ${item.id})`,
        `   Category: ${item.category}`,
        item.brand ? `   Brand: ${item.brand}` : null,
        item.model ? `   Model: ${item.model}` : null,
        item.purchaseDate ? `   Purchase Date: ${item.purchaseDate}` : null,
        item.condition ? `   Condition: ${item.condition}` : null,
      ];
      return details.filter(Boolean).join("\n");
    })
    .join("\n\n");

  const systemPrompt = `You are a home maintenance expert. Given a home profile and its inventory items, generate a comprehensive preventive maintenance plan.

You MUST respond with valid JSON matching this exact schema (no markdown, no code fences, just raw JSON):

{
  "tasks": [
    {
      "title": "Short task title",
      "description": "Detailed description of what to do and why",
      "frequency": "monthly|quarterly|semi-annually|annually|as-needed",
      "nextDueDate": "YYYY-MM-DD",
      "priority": "low|medium|high|critical",
      "reasoning": "Why this task is important for this specific home/item",
      "estimatedCost": "$XX-$XX or DIY/Free",
      "linkedItemId": "item ID from the list or null for general home tasks"
    }
  ],
  "seasonalNotes": [
    "Season-specific advice for this home's climate zone"
  ],
  "estimatedAnnualCost": "$X,XXX-$X,XXX"
}

Guidelines:
- Today's date is ${today} (month ${currentMonth}). Schedule nextDueDate values starting from today.
- Generate 8-15 tasks covering major home systems and appliances.
- For each item in the inventory, consider its category, age, and condition to recommend appropriate maintenance.
- Include general home tasks (gutters, HVAC filters, water heater flush, etc.) even if those items aren't in the inventory.
- Use the ZIP code to infer climate zone and adjust seasonal recommendations (e.g., winterizing pipes in cold climates, hurricane prep in coastal areas).
- Consider the home's age (yearBuilt) for age-specific maintenance (e.g., older homes may need more frequent electrical/plumbing checks).
- Set priority based on safety impact and cost of neglect.
- Provide realistic cost estimates for the home's region.
- Include 3-5 seasonal notes relevant to the home's climate zone.
- For general home tasks not linked to a specific item, set linkedItemId to null.`;

  const userMessage = `Please generate a maintenance plan for this home.

${homeDescription}

Items in this home:
${items.length > 0 ? itemDescriptions : "No items inventoried yet. Generate general home maintenance tasks."}`;

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
  const parsed = JSON.parse(jsonText);

  const validPriorities = ["low", "medium", "high", "critical"];

  return {
    tasks: (parsed.tasks ?? []).map(
      (t: Record<string, unknown>) => ({
        title: (t.title as string) ?? "Maintenance Task",
        description: (t.description as string) ?? "",
        frequency: (t.frequency as string) ?? "annually",
        nextDueDate: (t.nextDueDate as string) ?? today,
        priority: validPriorities.includes(t.priority as string)
          ? (t.priority as MaintenancePlanTask["priority"])
          : "medium",
        reasoning: (t.reasoning as string) ?? "",
        estimatedCost: (t.estimatedCost as string) ?? "Unknown",
        linkedItemId: (t.linkedItemId as string) ?? null,
      })
    ),
    seasonalNotes: parsed.seasonalNotes ?? [],
    estimatedAnnualCost: parsed.estimatedAnnualCost ?? "Unknown",
  };
}
