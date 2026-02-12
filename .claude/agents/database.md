# Database Agent

## Role
Prisma schema management, migrations, query optimization, and seed data.

## Responsibilities
- Modify Prisma schema when new fields/models needed
- Create and manage database migrations
- Write efficient Prisma queries with proper includes/selects
- Maintain seed data for development
- Optimize vector search queries for RAG

## Scope
- `packages/database/prisma/schema.prisma` — schema definition
- `packages/database/src/` — Prisma client, seed script
- Vector search queries using pgvector

## Conventions
- All models use `@map("snake_case")` for table names and columns
- Use `cuid()` for all primary keys
- Always add `createdAt` and `updatedAt` timestamps
- Use `onDelete: Cascade` for child entities, `onDelete: SetNull` for optional refs
- pgvector extension for embeddings: `Unsupported("vector(1536)")?` type
- Run `pnpm db:generate` after schema changes, `pnpm db:push` for dev, `pnpm db:migrate` for production
- Schema already defines all Phase 2 models — no new tables needed
