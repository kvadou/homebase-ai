import { getClaudeClient, DEFAULT_MODEL } from "./claude";

export async function generateClaimNarrative(
  items: Array<{
    name: string;
    brand: string | null;
    model: string | null;
    purchasePrice: number | null;
    photoUrl: string | null;
  }>,
  incidentDescription: string,
  incidentType: string
): Promise<string> {
  const claude = getClaudeClient();

  const itemList = items
    .map((item, i) => {
      const parts = [`${i + 1}. ${item.name}`];
      if (item.brand) parts.push(`Brand: ${item.brand}`);
      if (item.model) parts.push(`Model: ${item.model}`);
      if (item.purchasePrice != null)
        parts.push(`Purchase Price: $${item.purchasePrice.toFixed(2)}`);
      return parts.join(" | ");
    })
    .join("\n");

  const totalValue = items.reduce(
    (sum, item) => sum + (item.purchasePrice ?? 0),
    0
  );

  const response = await claude.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 2048,
    system:
      "You are a professional insurance claims writer. Write clear, factual, and thorough insurance claim narratives. Include all item details, their values, and the circumstances of the incident. Use professional language appropriate for insurance documentation. Do not embellish or speculate beyond the provided facts.",
    messages: [
      {
        role: "user",
        content: `Write a professional insurance claim narrative for the following incident:

Incident Type: ${incidentType}
Description: ${incidentDescription}

Affected Items:
${itemList}

Total Estimated Value: $${totalValue.toFixed(2)}

Write a comprehensive claim narrative that covers:
1. Description of the incident
2. Detailed list of damaged/affected items with values
3. Total claim value
4. Any relevant details about the items (brand, model)

Format as a professional narrative suitable for submission to an insurance company.`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text ?? "";
}
