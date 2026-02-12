export { getClaudeClient, sendMessage, DEFAULT_MODEL, VISION_MODEL } from "./claude";
export type { ChatMessage, MessageRole } from "./claude";

export { analyzeItemImage } from "./vision";
export type { ScannedItem } from "./vision";

export { generateEmbedding, chunkText, EMBEDDING_DIMENSION } from "./embeddings";

export {
  buildHomeAssistantPrompt,
  buildVectorSearchQuery,
  searchManualChunks,
} from "./rag";
export type { RetrievedChunk } from "./rag";
