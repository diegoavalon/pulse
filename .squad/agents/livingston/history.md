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

### Issue #5: Profile-Aware Trend History Data Contract (2026-05-31)

**Implementation:**

- Created formal TypeScript data contract in `packages/utils/src/summary.ts` for append-friendly, profile-aware time series.
- Defined `SummaryRecord` interface matching established Tier 1 schema (id, label, url, profile, timestamp, cwv, coachScore, transfer, requests, thirdPartyRequests, sitespeedVersion, runId).
- Defined `PageHistory` structure with independent mobile/desktop time-series arrays (chronological order, oldest first).
- Defined `TrendCatalog` as top-level index keyed by page ID for all tracked pages.
- Added `LatestSnapshot` extraction to derive scorecard state from most recent run per profile.
- Added `extractMetricSeries` and `extractScoreSeries` helpers for Chart.js consumption.

**Threshold Classification:**

- Created `packages/utils/src/thresholds.ts` implementing Google Web Vitals thresholds (LCP ≤2.5s good, CLS ≤0.1 good, TBT ≤200ms good, etc.).
- Defined `rateMetric`, `rateCoachScore`, and `ratePageStatus` classification functions.
- Implemented `formatMetricValue` and `formatBytes` with explicit units (e.g., "1.54 s", "2.3 MB", "0.769" for CLS).
- Added `validateMetricValue` and `validateCoachScore` for extraction error detection.
- Headline metrics (LCP, CLS, TBT) determine page status; worst rating wins.

**Validation:**

- Comprehensive test suite (46 tests) covering:
  - All 18 metric threshold boundary cases (6 metrics × 3 rating tiers).
  - Profile isolation (mobile/desktop histories never mix).
  - INP null handling (MVP returns "na", Phase 2 thresholds ready).
  - Formatting edge cases (trailing zeros, bytes, CLS precision).
  - Latest snapshot extraction and time-series building.
- All tests pass. `vp check` clean (180 files formatted, 51 files linted, zero errors).
- Static build succeeds; ready for GitHub Pages deployment.

**Key Decisions:**

- Units are explicit in field names and type comments, never wrapped in separate unit objects.
- Profile dimension is first-class; each page has independent mobile/desktop arrays.
- Summary-only runs (no detail) remain visible in trends via `PageHistory` structure.
- Latest status and trend views derive from the same `SummaryRecord` contract.
- Schema version field optional for MVP, ready for Phase 2 migrations.
- Trend data structure supports append-only writes (chronological arrays, no sorting required).

### Team Context — Issue #5 Sprint Summary (2026-06-01)

**Parallel Deliverables:**

- **Linus (Frontend):** Implemented `TrendChart.svelte` and `TrendCard.svelte` components with Chart.js initialized in `onMount`. Design tokens consumed via CSS custom properties. Profile isolation enforced through reactive `$derived` bindings. All 47 tests pass including 21 new trend tests.

- **Yen (Testing):** Created 21 acceptance tests in `apps/frontend/src/lib/trend.test.ts` validating trend grouping, profile isolation, units/labels, summary-only visibility, and shared contract. Quality gates: build succeeds, format/lint clean, 92 total tests pass.

**Team Dependencies Established:**

- Frontend now consuming `SummaryRecord` types from `@pulse/utils` package
- `extractMetricSeries` and `extractScoreSeries` helpers ready for trend chart data flow
- Threshold functions (`ratePageStatus`) ready for scorecard integration
- Profile isolation patterns established; schema version field ready for Phase 2 migrations

**Extraction Pipeline Next:**

- Issue #3 (data schema & extraction) will implement Node extraction script
- SummaryRecord contract ready for validation in extraction layer
- TrendCatalog structure supports append-only writes with no sorting required

**Impact Summary:**

- Data contract now shared across team (frontend, extraction, AI reviews)
- Threshold classification baseline established (18 test cases covering all 6 CWV metrics)
- Profile isolation enforced at both data model and frontend component level
- Ready for Issue #3 implementation with proven contract stability
