import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is required");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export const DEFAULT_MODEL = "claude-sonnet-4-20250514";
export const VISION_MODEL = "claude-sonnet-4-20250514";

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export async function sendMessage(
  messages: ChatMessage[],
  systemPrompt?: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  const claude = getClaudeClient();

  const response = await claude.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text ?? "";
}
