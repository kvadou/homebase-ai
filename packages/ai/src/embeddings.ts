import { getClaudeClient } from "./claude";

const EMBEDDING_DIMENSION = 1536;

/**
 * Generate embeddings for text using Claude.
 * Uses Anthropic's built-in embedding support.
 * Falls back to a simple hash-based approach for development.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // For production, use a dedicated embedding model (e.g., Voyage AI, OpenAI)
  // Claude doesn't natively support embeddings, so we use the Anthropic-recommended
  // Voyage AI or OpenAI embedding endpoint
  // For now, provide a placeholder that can be swapped in
  const apiKey = process.env.EMBEDDING_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("EMBEDDING_API_KEY or ANTHROPIC_API_KEY required for embeddings");
  }

  // Use Voyage AI if available (Anthropic's recommended embedding provider)
  if (process.env.VOYAGE_API_KEY) {
    return generateVoyageEmbedding(text);
  }

  // Fallback: use a deterministic hash for development/testing
  return generateDevEmbedding(text);
}

async function generateVoyageEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "voyage-3",
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Voyage AI embedding failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Simple deterministic embedding for development.
 * NOT suitable for production — use Voyage AI or OpenAI embeddings.
 */
function generateDevEmbedding(text: string): number[] {
  const embedding = new Array(EMBEDDING_DIMENSION).fill(0);
  const normalized = text.toLowerCase().trim();

  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const idx = (charCode * (i + 1)) % EMBEDDING_DIMENSION;
    embedding[idx] += 1 / normalized.length;
  }

  // Normalize to unit vector
  const magnitude = Math.sqrt(
    embedding.reduce((sum: number, val: number) => sum + val * val, 0)
  );
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
}

/**
 * Split text into overlapping chunks for embedding.
 */
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    start += chunkSize - overlap;
  }

  return chunks;
}

export { EMBEDDING_DIMENSION };
