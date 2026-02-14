export { getClaudeClient, sendMessage, DEFAULT_MODEL, VISION_MODEL } from "./claude";
export type { ChatMessage, MessageRole } from "./claude";

export { analyzeItemImage, analyzeReceipt } from "./vision";
export type { ScannedItem, ReceiptData } from "./vision";

export { generateEmbedding, chunkText, EMBEDDING_DIMENSION } from "./embeddings";

export {
  buildHomeAssistantPrompt,
  buildVectorSearchQuery,
  searchManualChunks,
} from "./rag";
export type { RetrievedChunk } from "./rag";

export { getRepairHelp } from "./repair-help";
export type { RepairHelpResult } from "./repair-help";

export { predictMaintenanceNeeds } from "./predictive";
export type { MaintenancePrediction, PredictiveResult } from "./predictive";

export { generateMaintenancePlan } from "./autopilot";
export type { MaintenancePlanTask, MaintenancePlanResult } from "./autopilot";

export { inspectHomeIssue } from "./inspector";
export type { InspectionResult } from "./inspector";

export { getHomeQueryTools, executeHomeQueryTool } from "./home-queries";
export type { HomeQueryToolDefinition } from "./home-queries";

export { generateClaimNarrative } from "./claims";

export { generateMarketingContent, generateAdCopy, generateCompetitorAnalysis } from "./marketing";
export type { MarketingContentResult, AdCopyResult, CompetitorAnalysisResult } from "./marketing";
