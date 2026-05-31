# Project Context

- **Owner:** Diego Avalon
- **Project:** pulse
- **Description:** Self-hosted eHealth/Pulse-branded performance dashboard replacing SpeedCurve-style reporting with sitespeed.io collection, static SvelteKit presentation, and on-demand Claude AI reviews.
- **Stack:** SvelteKit, adapter-static, Tailwind tokens, Chart.js, GitHub Actions, private GitHub Pages, sitespeed.io Docker, Node extraction scripts, Claude API.
- **Created:** 2026-05-31
- **Seed references:** `docs/00__main-brief.md`, `diegoavalon/pulse#1`

## Learnings

- UI must support three audiences through layered detail: marketing/product scorecards, engineering trend views, and developer diagnostics.
- Branding is strict and comes from a provided `DESIGN.md`; no generic theme is acceptable.
- Chart.js should be initialized in Svelte via `onMount`.

### From Onboarding (2026-05-31)

#### Architecture & Tech Stack

- SvelteKit with `adapter-static`, Tailwind v4 (`@tailwindcss/vite`), Chart.js canvas-based (no React).
- Svelte 5 in runes mode; initialized via `onMount` for Chart lifecycle.
- Private GitHub Pages hosting; CI via GitHub Actions.
- Project uses `vp` (Vite+) as the unified CLI for dev/build/check/test.

#### Design System Constraints

- **Branding**: Warm cream background (`#f7f7f2`), olive green primary (`#5b6f00`), bright lime accent (`#b2c248`).
- **Typography**: Quadrant serif for headlines, Melange sans for body/UI copy; tight tracking on display, 1.5 line-height on body.
- **Spacing**: 4px base grid. Named increments: `xs` 4 / `sm` 8 / `md` 12 / `lg` 16 / `xl` 24 / `xxl` 32 / `section` 48 / `section-lg` 80.
- **Components**: Full-pill buttons (9999px radius), 12px radius cards, hairline borders (`#d5d5d2`), minimal shadows (only on overlays).
- **No hardcoded colors**: All colors via Tailwind tokens; Chart.js config consumes colors from CSS custom properties.

#### Data Model & Routes

- Data structure: `summary.json` (committed, infinite trend history) + `detail.json` + screenshots (14-day retention).
- Summary record: `{id, label, url, profile, timestamp, cwv{LCP/CLS/INP/TBT/FCP/TTFB}, coachScore, transfer, requests, ...}`.
- Routes implied: `/` (dashboard with scorecard), `/page/<id>/<profile>` (detail + trends), AI review view.
- Mobile is default profile; desktop is equal first-class dimension (profile toggle must preserve state).

#### Chart.js & Charting

- Trend charts: LCP, CLS, TBT lines over time; bar breakdowns for transfer size (js/css/image) and request counts.
- Initialize in `onMount` against named canvas elements; destructure design tokens for color config.
- Tooltips and legends must follow brand aesthetic (no flashy defaults).

#### Critical UX Patterns

- **Three-tier detail**: Scorecard (red/yellow/green) → diagnostics (trends, coach score) → full-detail (waterfall, screenshots).
- **Scorecard validation**: CLS ≈ 0.77 measured on day one must surface clearly as "poor" to prove system works.
- **No generic components**: Every element (nav, buttons, cards) designed per the editorial aesthetic.

#### Open Questions / Components Needed

- Waterfall and HAR rendering (not covered in DESIGN.md; developer-facing, detailed).
- Mobile breakpoint strategy and responsive vs. separate layouts.
- Pagination, empty states, and 14-day expiry fallback UI.
- Accessibility: focus states, aria labels, high-contrast scorecard.
- Chart tooltip styling within brand guidelines.

#### Team Collaboration Notes

- Onboarding complete (2026-05-31). All 7 pending UI decisions documented in `.squad/decisions.md` awaiting Rusty clarification on priorities.
- Ready for Sprint 1: Tailwind token mapping + scorecard scaffolding to unblock downstream components.

### Issue 2 Dashboard Shell (2026-05-31)

- The design handoff settled on a Variation C-inspired landing page with a clean white/cream Pulse look, floating pill navigation, a Most Recent run area, and Variation B-like All Pages affordance.
- For issue #2, the production Svelte route must not show mock vitals; it should clearly say no performance data is loaded until `summary.json` exists.
- The frontend shell validates through `vp check`, `vp test`, and `vp run -r build` from the repository root.

#### Issue #2 Completion Summary

**Learnings from Linus:**

- Implemented the design handoff as a SvelteKit/Tailwind shell rather than copying React prototype internals, preserving the Variation C editorial landing structure.
- Replaced mock performance values with an explicit no-data state for first collection, improving user clarity.
- Added `+layout.ts` prerendering (adapter-static in `svelte.config.js`) to ensure suitability for static GitHub Pages hosting.
- Svelte 5 runes mode worked well for reactive state; `onMount` lifecycle suitable for future Chart.js initialization.
- Theme.css integration with Tailwind custom properties (`@apply`, CSS variables) proved clean for enforcing brand tokens without duplication.

**Status:** ✓ COMPLETE — Dashboard shell ready for data pipeline integration.
