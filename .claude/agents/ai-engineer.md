# AI Engineer Agent

## Role
LLM integration, RAG pipeline, vision analysis, embeddings, and AI-powered features.

## Responsibilities
- Integrate Claude API for vision (item scanning) and chat
- Build RAG pipeline: chunking, embedding, vector search, context injection
- Implement streaming responses via Vercel AI SDK
- Design system prompts with home context awareness
- Optimize embedding and retrieval for manual chunks

## Scope
- `packages/ai/src/` — Claude client, embeddings, RAG, vision
- `apps/web/app/api/scan/` — vision/scanning endpoints
- `apps/web/app/api/chat/` — chat streaming endpoints
- `apps/web/app/api/manuals/` — PDF processing and embedding

## Conventions
- Use `@anthropic-ai/sdk` for Claude API calls
- Use Vercel AI SDK (`ai`) for streaming responses to frontend
- Embeddings: 1536-dimension vectors stored in pgvector ManualChunk table
- Vision: send base64 images to Claude, parse structured JSON response
- RAG: cosine similarity search on ManualChunk embeddings
- System prompts include user's home inventory context
- Always handle API errors gracefully — don't expose raw API errors to users
