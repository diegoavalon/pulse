# Project Context

- **Owner:** Diego Avalon
- **Project:** pulse
- **Description:** Self-hosted eHealth/Pulse-branded performance dashboard replacing SpeedCurve-style reporting with sitespeed.io collection, static SvelteKit presentation, and on-demand Claude AI reviews.
- **Stack:** SvelteKit, adapter-static, Tailwind tokens, Chart.js, GitHub Actions, private GitHub Pages, sitespeed.io Docker, Node extraction scripts, Claude API.
- **Created:** 2026-05-31
- **Seed references:** `docs/00__main-brief.md`, `diegoavalon/pulse#1`

## Learnings

- Tier 1 summary data is committed indefinitely for trends; rich detail and screenshots are capped to the latest 14 days.
- Summary records must include units explicitly and capture sitespeed version plus run ID.
- AI reviews are workflow-dispatch only and stored as markdown under page/profile review history.

### Get-Acquainted Phase (2026-05-31)

**Page & Profile Structure**

- Stable page IDs (e.g. `homepage`) from `urls.json` {id, label, url, group} are immutable and reused as history keys and dashboard routes.
- Mobile (throttled "4g") and desktop (throttled "cable") are independent first-class dimensions; no profile mixing.
- Each page/profile has its own trend series; UI defaults to mobile, desktop is a toggle.

**Summary Schema (Tier 1 — Committed Forever)**

- Fields: id, label, url, profile, timestamp (ISO 8601Z), iterations (fixed at 3), cwv, coachScore, transfer, requests, thirdPartyRequests, sitespeedVersion (v41.2.0), runId (YYYY-MM-DDTHH-MM-SS format).
- CWV: LCP (ms), CLS (unitless), INP (null in MVP), TBT (ms), FCP (ms), TTFB (ms).
- Transfer: {total, js, css, image} all in bytes.
- Units are implicit in field names; no wrapping unit object. Comments must clarify all numeric units.
- One record per run; appended to data/<id>/<profile>/<timestamp>.json, committed atomically.

**Detail Schema (Tier 2 — 14-day Rolling)**

- Full browsertime.json + HAR + per-iteration timings + screenshots (~600KB each).
- Location: data/<id>/<profile>/detail/<timestamp>.json; screenshots co-located.
- Retention: 14 days rolling. Older runs fall back to summary-only in the UI.
- Extract.mjs processes raw Docker output → summary.json + detail.json + copy screenshots to build tree.

**Metric Thresholds**

- Google CWV standard (LCP ≤2.5s good, etc.).
- INP: null in MVP; Phase 2 will use RUM. Label as "requires RUM — Phase 2" to avoid misleading stakeholders.
- TBT: lab proxy for INP; ≤200ms good, ≤600ms needs improvement, >600ms poor.

**AI Review Contract**

- On-demand only (workflow_dispatch "Run AI Review"). No automatic per-run reviews.
- Theme-aware (must reference known CLS issues: WP sticky header, WC checkout modals; understand eHealth brand).
- Input: detail.json + HAR + render-blocking diagnostics.
- Output: markdown file, data/<id>/<profile>/reviews/<timestamp>.md, versioned + diffable.
- Audience: developers (technical, action-oriented).
- Execution: Claude API via GitHub Actions secret, never client-side. Cost-controlled (on-demand).

**Run Coordination**

- 3 throttled iterations per page/profile; median result reported.
- One-off runs (workflow_dispatch) are persisted like scheduled runs and join trend history.
- Atomic consolidate job prevents race conditions and commit clobbering.
- Raw Docker artifacts (browsertime.json, HAR, screenshots) → GitHub Actions artifacts (90-day default).

**Design System Integration**

- Strict eHealth/Pulse branding via provided DESIGN.md (editorial, warm cream + olive-green accent).
- Tailwind tokens drive all colors, typography, layout. No generic theme.
- Chart.js for trends (canvas-based, initialized via Svelte onMount). Token-styled via CSS custom properties.

### Team Collaboration Notes (2026-05-31)

- Onboarding complete. All 7 data/AI decisions documented in `.squad/decisions.md` awaiting consensus.
- 3 decisions ready for immediate team alignment: Claude model + budget, review prompt template (with Linus), comparison strategy.
- 1 action item: Rusty decides Claude model + budget ceiling; Basher pins in workflow.
- Ready for Sprint 1: Await schema finalization from Rusty/Yen, then implement extraction + consolidation pipeline.
