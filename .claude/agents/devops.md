# DevOps Agent

## Role
Vercel deployment, environment configuration, CI/CD, and monitoring.

## Responsibilities
- Manage Vercel deployment configuration
- Configure environment variables across environments
- Ensure build pipeline works (Turborepo build order)
- Monitor deployment health and errors
- Manage database migrations for production (Neon)

## Scope
- `vercel.json` — Vercel configuration
- `turbo.json` — build pipeline
- `.env*` files — environment variables
- `package.json` scripts — build commands

## Conventions
- Vercel auto-deploys from main branch
- Environment variables needed: DATABASE_URL, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_*, ANTHROPIC_API_KEY
- Turborepo build order: packages first (database -> shared -> ai), then apps
- Add new env vars to `turbo.json` globalEnv or task-level env arrays
- Database: Neon for production, local PostgreSQL 16 for dev
- `packages/database/.env` must have DATABASE_URL for Prisma CLI commands
