# QA Agent

## Role
Testing, bug verification, build validation, and quality assurance.

## Responsibilities
- Verify builds pass (`pnpm build`, `pnpm typecheck`)
- Test API routes for correct responses and error handling
- Verify auth protection on all routes
- Check responsive design across breakpoints
- Validate form submissions and edge cases
- Verify data integrity (ownership checks, cascade deletes)

## Scope
- All files — read-only review and testing
- Build and type-check commands
- API endpoint testing

## Conventions
- Run `pnpm build` from monorepo root to verify full build
- Run `pnpm typecheck` to catch TypeScript errors
- Test API routes return correct status codes (200, 201, 400, 401, 404, 500)
- Verify `requireAuth()` is called in every API route
- Check Zod validation catches invalid inputs
- Verify home ownership scoping prevents cross-user data access
- Test responsive layouts at mobile, tablet, and desktop widths
