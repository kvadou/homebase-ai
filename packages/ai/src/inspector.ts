import { getClaudeClient, VISION_MODEL } from "./claude";

export interface InspectionResult {
  issue: string;
  severity: "cosmetic" | "moderate" | "urgent" | "critical";
  diagnosis: string;
  recommendedAction: string;
  estimatedCost: string;
  urgency: string;
  safetyRisk: boolean;
}

export async function inspectHomeIssue(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif",
  description?: string,
  roomType?: string
): Promise<InspectionResult> {
  const claude = getClaudeClient();

  const systemPrompt = `You are an experienced home inspector and building diagnostics expert. Analyze the photo of a home issue and provide a professional assessment.

You MUST respond with valid JSON matching this exact schema (no markdown, no code fences, just raw JSON):

{
  "issue": "Brief title of the identified issue",
  "severity": "cosmetic|moderate|urgent|critical",
  "diagnosis": "Detailed explanation of what you see, likely causes, and what is happening",
  "recommendedAction": "Step-by-step recommendation for addressing this issue",
  "estimatedCost": "$XX-$XX range for professional repair",
  "urgency": "Timeframe for addressing (e.g., 'Within 24 hours', 'Within 1 week', 'Within 1 month', 'When convenient')",
  "safetyRisk": true/false
}

Severity guidelines:
- cosmetic: Visual imperfection only, no structural or functional impact (scuffs, minor paint chips, small stains)
- moderate: Should be addressed to prevent worsening, but not immediately dangerous (small cracks, minor leaks, worn caulking)
- urgent: Needs prompt attention to prevent significant damage or safety risk (active leaks, electrical issues, mold growth)
- critical: Immediate safety hazard or risk of major damage (structural damage, exposed wiring, gas leaks, severe water damage)

Set safetyRisk to true if the issue could pose any risk to occupants (electrical, structural, mold, fire, slip/fall, etc.).

Provide realistic cost estimates for professional repair. Be specific in your diagnosis and recommendation.`;

  const contextParts: string[] = [
    "Inspect this photo and identify any home issues or problems visible.",
  ];
  if (description) {
    contextParts.push(`The homeowner describes the issue as: "${description}"`);
  }
  if (roomType) {
    contextParts.push(`This photo was taken in: ${roomType}`);
  }
  contextParts.push("Return raw JSON only.");

  const response = await claude.messages.create({
    model: VISION_MODEL,
    max_tokens: 2048,
    system: systemPrompt,
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
            text: contextParts.join("\n"),
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const rawText = textBlock?.text ?? "{}";

  try {
    const fenceMatch = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    const jsonText = fenceMatch ? fenceMatch[1].trim() : rawText.match(/\{[\s\S]*\}/)?.[0] ?? rawText;
    const parsed = JSON.parse(jsonText);

    const validSeverities = ["cosmetic", "moderate", "urgent", "critical"];

    return {
      issue: parsed.issue ?? "Unidentified Issue",
      severity: validSeverities.includes(parsed.severity)
        ? parsed.severity
        : "moderate",
      diagnosis: parsed.diagnosis ?? "Unable to provide a detailed diagnosis from this image.",
      recommendedAction: parsed.recommendedAction ?? "Consult a professional for further assessment.",
      estimatedCost: parsed.estimatedCost ?? "Unknown",
      urgency: parsed.urgency ?? "When convenient",
      safetyRisk: parsed.safetyRisk ?? false,
    };
  } catch (error) {
    console.error("Failed to parse inspection response:", rawText, error);
    return {
      issue: "Analysis Error",
      severity: "moderate",
      diagnosis: "Could not analyze the image. Please try again with a clearer photo showing the issue.",
      recommendedAction: "Take a closer, well-lit photo of the problem area and try again.",
      estimatedCost: "Unknown",
      urgency: "When convenient",
      safetyRisk: false,
    };
  }
}
