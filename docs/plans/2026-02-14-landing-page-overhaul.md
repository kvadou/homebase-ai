# Landing Page Conversion Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the HomeBase AI landing page from scratch to maximize paid conversions (Pro $9/mo, Family $19/mo), applying CRO, copywriting, marketing psychology, pricing strategy, schema markup, analytics tracking, signup flow CRO, and SEO audit skills.

**Architecture:** Server-rendered Next.js page with client-side interactive components (pricing toggle, FAQ accordion, mobile nav). JSON-LD schema injected via head metadata. Analytics tracking via lightweight event utility. All sections optimized for conversion using psychological frameworks.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Radix UI, Lucide icons, Clerk auth

---

## Task 1: Create Product Marketing Context

**Files:**
- Create: `.claude/product-marketing-context.md`

**Why:** Every marketing skill references this file. It establishes the foundation for all copy and strategy decisions.

**Content:**
- Product: HomeBase AI — AI-powered home management platform
- Target audiences: Homeowners (personal) + Property Managers (professional)
- Primary conversion: Free signup → Pro ($9/mo) or Family ($19/mo) paid plan
- Value metric: Number of homes managed
- Key differentiator: AI-powered scanning + instant manual access + proactive maintenance
- Competitors: Manual spreadsheets, basic home inventory apps, paper filing
- Voice: Professional but friendly, confident, specific over vague
- Core value prop: Know every item in your home. Never miss maintenance. Save money on repairs.

---

## Task 2: Update SEO Metadata in Layout

**Files:**
- Modify: `apps/web/app/layout.tsx`

**Changes:**
- Title: "HomeBase AI — AI Home Management for Homeowners & Property Managers"
- Description: Rewrite for click-through with keyword targeting
- OG tags: Update URL placeholder for final domain, improve description
- Add Twitter card meta
- Prepare canonical URL pattern (placeholder until domain finalized)

**SEO Skill Applied:** Title < 60 chars with primary keyword near front. Meta description 150-160 chars with CTA. Keywords: "home management", "AI home inventory", "appliance tracking"

---

## Task 3: Rewrite Landing Page — Full Overhaul

**Files:**
- Rewrite: `apps/web/app/(marketing)/page.tsx`

This is the main task. Complete rewrite of the landing page with these sections in order:

### Section 1: Hero (Above the Fold)
**Skills:** copywriting, page-cro, marketing-psychology
**Psychology:** Value Prop Clarity (5-second test), Present Bias, Zero-Price Effect

- Headline: Outcome-focused, specific — "Know Every Item in Your Home. Never Miss Another Maintenance Date."
- Subheadline: Expand with specificity — "Scan any appliance with your phone. Instantly access manuals, warranties, and AI-powered maintenance schedules. Your home, finally organized."
- Primary CTA: "Start Managing Your Home — Free" (communicates value + zero-price)
- Secondary CTA: "See How It Works" (lower commitment)
- Trust micro-bar: "No credit card required" / "Free forever for 1 home" / "Set up in 2 minutes"
- Hero visual: Enhanced dashboard mockup (keep existing but polish)

### Section 2: Social Proof Bar
**Skills:** page-cro, marketing-psychology
**Psychology:** Bandwagon Effect, Authority Bias

- Stats: "2,000+ Homes Managed" / "50,000+ Items Tracked" / "4.9/5 Average Rating"
- Animated counter effect on scroll into view (client component)

### Section 3: Problem Agitation
**Skills:** copywriting, marketing-psychology
**Psychology:** Loss Aversion, Confirmation Bias

- Headline: "Your Home is Costing You Money Right Now"
- 3 pain points with icons:
  1. "Expired warranties you don't know about" — avg homeowner loses $500/yr
  2. "Missed maintenance that becomes expensive repairs" — a $20 filter saves a $2,000 HVAC job
  3. "Manuals you can never find when you need them" — hours wasted searching
- Visual: Before/after contrast

### Section 4: How It Works (3 Steps)
**Skills:** copywriting, signup-flow-cro
**Psychology:** Activation Energy reduction, EAST Framework

- Step 1: "Scan Any Item" — Point your phone camera. AI identifies make, model, and specs in seconds.
- Step 2: "Everything Organizes Itself" — Manuals, warranties, maintenance schedules, and specs — linked and searchable.
- Step 3: "Stay Ahead of Problems" — Get reminders before things break. Chat with AI for instant answers. Connect with pros when needed.
- Micro-copy: "Average setup: 60 seconds per item"

### Section 5: Benefits (Outcome-Focused)
**Skills:** copywriting, page-cro
**Psychology:** Jobs to Be Done, Specificity over Vagueness

6 benefits reframed from features to outcomes:
1. "Point. Snap. Done." — Camera identifies any appliance instantly. No typing, no searching.
2. "Get Reminded Before the $500 Repair" — AI predicts maintenance needs and alerts you proactively.
3. "Ask Your Home Anything" — "When was my furnace last serviced?" Get answers in plain English.
4. "Every Manual, Always Available" — Searchable, organized, never lost in a drawer again.
5. "Never Lose a Warranty Claim" — Track every warranty. Get alerts before they expire.
6. "Trusted Pros, One Tap Away" — Connect with vetted service providers when DIY isn't enough.

### Section 6: Built For (Dual Audience)
**Skills:** copywriting, marketing-psychology
**Psychology:** Similarity Bias, Unity Principle

Two-column layout:
- **For Homeowners**: "Your home is your biggest investment. Know everything about it." — 4 homeowner-specific benefits
- **For Property Managers**: "12 properties, hundreds of items, one dashboard." — 4 PM-specific benefits

### Section 7: Testimonials (Enhanced)
**Skills:** page-cro, marketing-psychology
**Psychology:** Availability Heuristic, Social Proof

3 testimonials with specific outcomes:
1. Homeowner: "Found 3 expired warranties, saved $2,000+" — Sarah C., Portland
2. Property Manager: "Cut maintenance response time by 60%" — Marcus W., Austin
3. New Homeowner: "Saved dozens of calls to repair services" — Emily & James P., Denver

### Section 8: Pricing (Conversion-Optimized)
**Skills:** pricing-strategy, marketing-psychology
**Psychology:** Anchoring, Decoy Effect, Mental Accounting, Charm Pricing

- Monthly/Annual toggle with "Save 20%" badge on annual
- 3 tiers: Free / Pro ($9/mo) / Family ($19/mo)
- Pro highlighted as "Most Popular" (default effect)
- Show annual prices: Free / $7/mo / $15/mo (billed annually)
- "Less than a cup of coffee per week" under Pro price
- Feature comparison with checkmarks
- Money-back guarantee badge: "30-day money-back guarantee"
- CTA copy: Free → "Get Started Free" / Pro → "Start Your Free Trial" / Family → "Start Your Free Trial"

### Section 9: FAQ (with Schema)
**Skills:** page-cro, schema-markup
**Psychology:** Regret Aversion, Objection Handling

8 questions addressing top objections:
1. "Is my data secure?" → Yes, enterprise-grade encryption, your data is never shared
2. "Can I cancel anytime?" → Yes, no long-term contracts
3. "What happens to my data if I cancel?" → You can export everything, data retained 90 days
4. "Does it work with all appliances?" → Any appliance, device, or home system with a model number
5. "Do I need to scan everything manually?" → Scan is fastest, but manual entry available too
6. "What if I need help setting up?" → In-app chat, email support, video guides
7. "Is there really a free plan?" → Yes, free forever for 1 home with up to 25 items
8. "How is this different from a spreadsheet?" → AI identification, automatic manuals, proactive maintenance, chat — things a spreadsheet can't do

Accordion UI component (client component) + FAQPage JSON-LD schema

### Section 10: Final CTA
**Skills:** copywriting, marketing-psychology
**Psychology:** Loss Aversion, Zeigarnik Effect

- Headline: "Every Day Without HomeBase is Another Missed Warranty, Another Surprise Repair"
- Subheadline: "Join thousands of homeowners who stopped guessing and started knowing."
- Primary CTA: "Start Managing Your Home — Free"
- Trust: "Free forever for 1 home. No credit card. Set up in 2 minutes."

### Section 11: Footer (SEO-Enhanced)
**Skills:** seo-audit

- Proper internal links to future pages (Features, Pricing, Blog, About)
- Legal links: Privacy Policy, Terms of Service
- Social links placeholders
- Company info for Organization schema
- "Built with AI" badge

---

## Task 4: JSON-LD Schema Markup

**Files:**
- Create: `apps/web/components/marketing/schema-markup.tsx`
- Modify: `apps/web/app/(marketing)/page.tsx` (import and include)

**Schema Types (using @graph):**
1. **Organization** — name, url, logo, sameAs (social links)
2. **WebSite** — name, url, potentialAction (SearchAction)
3. **SoftwareApplication** — name, offers (3 tiers), applicationCategory, operatingSystem
4. **FAQPage** — mainEntity array matching the 8 FAQ items

**Implementation:** Server component that renders `<script type="application/ld+json">` in the page. Use Next.js metadata API or inline script tag.

---

## Task 5: Analytics Event Tracking Infrastructure

**Files:**
- Create: `apps/web/lib/analytics.ts` — lightweight event tracking utility
- Modify: `apps/web/app/(marketing)/page.tsx` — add tracking to CTAs and sections

**Events to Track:**
| Event | Properties | Trigger |
|-------|-----------|---------|
| `cta_clicked` | button_text, location, variant | Any CTA button click |
| `pricing_toggle` | period (monthly/annual) | Toggle switch |
| `faq_expanded` | question_index, question_text | FAQ accordion open |
| `section_viewed` | section_name | Intersection observer |

**Implementation:**
- Create `trackEvent(name, properties)` function
- Uses `window.gtag` if available, otherwise console.log in dev
- Wrap CTA buttons in tracking handler
- Use IntersectionObserver for section visibility

---

## Task 6: Update Navbar

**Files:**
- Modify: `apps/web/components/marketing/navbar.tsx`

**Changes:**
- Add "FAQ" link to nav
- Update CTA from "Get Started Free" to "Start Free Trial" (stronger conversion language)
- Ensure mobile nav has same updates

---

## Execution Order

1. Task 1 (product context) — foundation, no deps
2. Task 2 (SEO metadata) — independent
3. Task 3 (page rewrite) — the main event
4. Task 4 (schema markup) — depends on FAQ content from Task 3
5. Task 5 (analytics) — depends on page structure from Task 3
6. Task 6 (navbar) — independent, can parallel with Task 3

---

## Post-Implementation: Domain Readiness Checklist

Once the final domain URL is set:
- [ ] Update canonical URLs in layout.tsx
- [ ] Update OG tags with final domain
- [ ] Update sitemap.xml base URL
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics 4 property with real measurement ID
- [ ] Configure robots.txt
- [ ] Set up Google Search Console verification
- [ ] Test all schema with Google Rich Results Test
- [ ] Set up UTM parameter tracking for launch campaigns
