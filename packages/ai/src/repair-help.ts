import { getClaudeClient, DEFAULT_MODEL } from "./claude";

export interface RepairHelpResult {
  diagnosis: string;
  steps: string[];
  difficulty: "easy" | "moderate" | "hard" | "professional";
  estimatedTime: string;
  toolsNeeded: string[];
  safetyWarnings: string[];
  videos: Array<{
    title: string;
    url: string;
    source: string;
    description: string;
  }>;
  articles: Array<{
    title: string;
    url: string;
    source: string;
  }>;
  partsNeeded: Array<{
    name: string;
    estimatedPrice: string;
    searchUrl: string;
  }>;
}

export async function getRepairHelp(params: {
  itemName: string;
  brand: string | null;
  model: string | null;
  category: string;
  issue: string;
  manualContext?: string;
}): Promise<RepairHelpResult> {
  const claude = getClaudeClient();

  const itemDescription = [
    params.itemName,
    params.brand ? `Brand: ${params.brand}` : null,
    params.model ? `Model: ${params.model}` : null,
    `Category: ${params.category}`,
  ]
    .filter(Boolean)
    .join(", ");

  const systemPrompt = `You are a home repair expert assistant. Given an item and a described issue, provide comprehensive repair guidance.

You MUST respond with valid JSON matching this exact schema (no markdown, no code fences, just raw JSON):

{
  "diagnosis": "A clear explanation of what is likely wrong and why",
  "steps": ["Step 1 description", "Step 2 description", ...],
  "difficulty": "easy" | "moderate" | "hard" | "professional",
  "estimatedTime": "e.g. 30 minutes, 1-2 hours",
  "toolsNeeded": ["Tool 1", "Tool 2", ...],
  "safetyWarnings": ["Warning 1", ...],
  "videoSearchQueries": ["specific YouTube search query 1", "specific YouTube search query 2", "specific YouTube search query 3"],
  "articleSearchQueries": ["specific Google search query 1", "specific Google search query 2", "specific Google search query 3"],
  "partsNeeded": [
    {
      "name": "Part name",
      "estimatedPrice": "$XX-$XX",
      "searchQuery": "specific Amazon search query"
    }
  ]
}

Guidelines:
- Provide 5-10 clear, actionable repair steps
- Include safety warnings for anything involving electricity, gas, water, heights, or heavy objects
- Set difficulty to "professional" if the repair requires licensed work (electrical panel, gas lines, etc.)
- Generate 3 highly specific video search queries that would find relevant repair tutorials on YouTube
- Generate 3 highly specific article search queries for finding repair guides on Google
- For parts, include specific part names and realistic price estimates
- If manual context is provided, reference it for model-specific instructions`;

  const userMessage = `Item: ${itemDescription}
Issue: ${params.issue}${params.manualContext ? `\n\nRelevant manual information:\n${params.manualContext}` : ""}

Please diagnose this issue and provide complete repair guidance.`;

  const response = await claude.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const rawText = textBlock?.text ?? "{}";

  // Parse the JSON response, stripping any markdown fences if present
  const jsonText = rawText.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(jsonText);

  // Build YouTube search URLs from queries
  const videos = (parsed.videoSearchQueries ?? []).map(
    (query: string) => ({
      title: query,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      source: "YouTube",
      description: `Search for "${query}" on YouTube`,
    })
  );

  // Build Google search URLs from queries
  const articles = (parsed.articleSearchQueries ?? []).map(
    (query: string) => ({
      title: query,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      source: "Google",
    })
  );

  // Build Amazon search URLs for parts
  const partsNeeded = (parsed.partsNeeded ?? []).map(
    (part: { name: string; estimatedPrice: string; searchQuery: string }) => ({
      name: part.name,
      estimatedPrice: part.estimatedPrice,
      searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(part.searchQuery || part.name)}`,
    })
  );

  return {
    diagnosis: parsed.diagnosis ?? "Unable to diagnose the issue.",
    steps: parsed.steps ?? [],
    difficulty: parsed.difficulty ?? "moderate",
    estimatedTime: parsed.estimatedTime ?? "Unknown",
    toolsNeeded: parsed.toolsNeeded ?? [],
    safetyWarnings: parsed.safetyWarnings ?? [],
    videos,
    articles,
    partsNeeded,
  };
}
