# Onboarding Wizard Design

## Goal
New users complete Add Home → Scan First Item → Get Maintenance Plan in under 5 minutes. This is the fastest path to the "aha moment" where they see AI-powered value.

## Flow

### Step 1 — Welcome (5s)
- Personalized greeting: "Welcome to HomeBase AI, [firstName]!"
- Value prop: "Let's set up your home in under 5 minutes."
- CTA: "Get Started"

### Step 2 — Add Your First Home (30s)
- Simplified form: Home Name (required), Address (optional), Home Type (dropdown)
- No year built, sq ft, description — keep it fast

### Step 3 — Scan Your First Item (60s)
- Camera viewfinder with "Take Photo" button
- Upload fallback for desktop
- Coaching text: "Point your camera at any appliance"
- Suggested item chips: Furnace, Water Heater, HVAC, Fridge

### Step 4 — Review & Confirm Item (30s)
- AI-detected details: name, brand, model, category
- Editable fields, photo thumbnail
- CTA: "Save & Generate Maintenance Plan"

### Step 5 — Your Maintenance Plan (celebration)
- Staggered fade-in of 3-5 maintenance tasks
- Each shows: icon, name, frequency, next due, estimated cost
- Summary: "1 Home · 1 Item · X Tasks Scheduled"
- CTA: "Go to Your Dashboard"

## Trigger
- After Clerk sign-in, dashboard layout checks if user has zero homes
- If zero homes → redirect to `/onboarding`
- Onboarding completion stored in localStorage

## Skip Behavior
- "Skip for now" link on every step (muted gray, bottom-right)
- Skipping stores current step in localStorage
- Dashboard shows "Continue Setup" card at top with progress indicator
- Card is dismissible (permanently hides via localStorage)

## Architecture

### New Files
```
apps/web/app/onboarding/
├── layout.tsx                — Full-screen layout (no sidebar)
├── page.tsx                  — Wizard controller (step state management)
└── components/
    ├── onboarding-wizard.tsx   — Main wizard with step transitions
    ├── step-welcome.tsx        — Welcome screen
    ├── step-add-home.tsx       — Simplified home form
    ├── step-scan-item.tsx      — Reuses existing scan logic
    ├── step-review-item.tsx    — AI results review/edit
    ├── step-maintenance.tsx    — Generated plan reveal
    └── onboarding-progress.tsx — Top progress bar

apps/web/components/dashboard/
    └── continue-setup-card.tsx — Dashboard card for skipped onboarding
```

### Reused API Routes (no new backend)
- `POST /api/homes` — create home
- `POST /api/scan` — AI item scan
- `POST /api/items` — create item
- `POST /api/maintenance/autopilot` — generate maintenance plan

### Reused Components
- Scan components from `/dashboard/scan` (extract shared logic)
- Home type dropdown options
- Maintenance task display cards

## Visual Design

### Layout
- Full-screen white, no sidebar, no dashboard chrome
- HomeBase AI logo top-left (small)
- Progress bar: 5 dots connected by lines
  - Active: teal (#00B4A0)
  - Completed: navy (#0A2E4D)
  - Upcoming: gray
- Content centered, max-width 640px
- Back button on steps 2-5

### Transitions
- Steps slide left-to-right (CSS transition)
- Step 5: tasks fade-in with staggered animation-delay

### Mobile
- Fully responsive, same wizard
- Rear camera default on step 3
- Large touch targets, stacked layout below sm breakpoint

## State Flow
```
Welcome → [homeId] → AddHome → [homeId] → ScanItem → [scanResult] → ReviewItem → [itemId] → Maintenance → Dashboard
```

Each step passes data forward via parent state. No global state library needed.
