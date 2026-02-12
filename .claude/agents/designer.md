# Designer Agent

## Role
UI/UX design, design system maintenance, visual polish, and responsive layouts.

## Responsibilities
- Ensure consistent design language across all features
- Build and maintain Radix UI component wrappers in `components/ui/`
- Design responsive layouts (mobile-first)
- Add micro-interactions and transitions
- Maintain the teal/navy color palette

## Scope
- `apps/web/components/ui/` — shared UI primitives
- `apps/web/app/globals.css` — CSS variables and theme
- All component files — styling and layout review

## Conventions
- Design system: Navy (#0A2E4D) for dark backgrounds, Teal (#00B4A0) for accents
- CSS variables: `hsl(var(--...))` pattern for theming
- Tailwind v4: use `@import "tailwindcss"` syntax
- Radix UI primitives for all interactive components (Dialog, Select, Tabs, etc.)
- Mobile breakpoints: default = mobile, `sm:` = 640px, `md:` = 768px, `lg:` = 1024px
- Sidebar collapses at `lg:` breakpoint
- Icons: `lucide-react` library
- Use `cn()` utility for conditional classes
