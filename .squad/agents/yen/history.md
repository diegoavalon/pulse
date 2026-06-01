# Project Context

- **Owner:** Diego Avalon
- **Project:** pulse
- **Description:** Self-hosted eHealth/Pulse-branded performance dashboard replacing SpeedCurve-style reporting with sitespeed.io collection, static SvelteKit presentation, and on-demand Claude AI reviews.
- **Stack:** SvelteKit, adapter-static, Tailwind tokens, Chart.js, GitHub Actions, private GitHub Pages, sitespeed.io Docker, Node extraction scripts, Claude API.
- **Created:** 2026-05-31
- **Seed references:** `docs/00__main-brief.md`, `diegoavalon/pulse#1`

## Learnings

### Issue #5: Profile-Aware Trend History Test Coverage (2026-05-31)

**Test Coverage Implemented:**

- Created `apps/frontend/src/lib/trend.test.ts` with 21 acceptance tests validating all issue #5 requirements
- **Trend grouping:** Verified each page has independent mobile/desktop trend histories keyed by `${pageId}:${profile}` combinations
- **Profile isolation:** Confirmed switching profiles never mixes data; mobile/desktop summaries compute independently from separate ProfileData
- **Units/labels:** Validated LCP trends are milliseconds, score trends are 0-100 integers, THRESHOLDS define expected units for all CWV metrics
- **Summary-only visibility:** Ensured historical trend data exists independently of detail availability; deltas computed from penultimate summary record
- **Shared contract:** Proved latest trend points equal current CWV/score values; summary aggregates and current status both derive from ProfileData

**Quality Gates Met:**

- ✓ All 47 tests pass (21 new trend tests + 25 detail tests + 1 utils test)
- ✓ Format and lint checks pass (180 files formatted correctly, 0 errors/warnings in 51 files)
- ✓ Static build succeeds; output ready for GitHub Pages deployment
- ✓ Tests cover all acceptance criteria: trend grouping, profile switching, units, summary-only runs, shared contract

**Verdict:** Issue #5 test coverage COMPLETE. All acceptance criteria validated through automated tests. No fixtures needed beyond existing deterministic data in `data.ts`.

## Core Context

### Foundational Test Strategy & Validation Standards (From Onboarding)

**Data Extraction & Contracts:**

- Unit tests must cover Node extraction script independently of sitespeed Docker runs
- Fixtures include multi-iteration runs (3 iterations, median selected)
- `summary.json` must include explicit units (ms for LCP/TBT/FCP/TTFB, bytes for transfer, unitless for CLS/score)
- Sitespeed version (v41.2.0) and runId (ISO timestamp) captured for auditability

**Threshold Correctness (Google CWV):**

- LCP: ≤2.5s good, ≤4.0s ni, >4.0s poor | Test CLS 0.77 → poor (validates brief data)
- CLS: ≤0.1 good, ≤0.25 ni, >0.25 poor
- TBT (INP proxy): ≤200ms good, ≤600ms ni, >600ms poor
- FCP: ≤1.8s good, ≤3.0s ni, >3.0s poor | TTFB: ≤800ms good, ≤1.8s ni, >1.8s poor
- INP null in MVP; Phase 2 uses RUM

**Profile Isolation:** Mobile (4g throttle) ≠ Desktop (cable throttle). Data layout: `data/<page-id>/<profile>/`. Tests verify no mixing; matrix jobs upload separate artifacts; consolidation validates both present before commit.

**Retention & Pruning:** Summary records committed forever; detail.json + screenshots → 14-day rolling window via prune job; summary-only fallback UI.

**Workflow Safety:** Matrix jobs upload only (no commits); consolidation single atomic commit; concurrency group serializes overlapping runs; test idempotency on retry.

**Secret Handling:** Claude API key server-side in GitHub Actions secrets; no env var exports in browser code; review markdown never contains auth tokens/internal URLs; pre-commit hook scans for patterns.

**One-Off & Schema:**

- Manual runs via `workflow_dispatch` persist to same history as scheduled
- Allow duplicates (dedup adds complexity)
- MVP: INP = null (not omitted); UI displays "INP requires RUM (Phase 2)"
- Add `schemaVersion: "1.0"` now for Phase 2 migration safety

### Previous Issue #2 Validation (Yen) — Dashboard Shell

**All acceptance criteria PASSED:**

- ✓ SvelteKit static build; prerendered `index.html`; bundled CSS
- ✓ eHealth/Pulse visual: cream `#f7f7f2`, olive `#5b6f00`, lime `#b2c248`; Quadrant + Melange fonts
- ✓ Empty-state messaging: "Performance data is not loaded yet"
- ✓ Frontend stack: zero React, no backend runtime deps, Svelte 5 + Tailwind v4 + TypeScript
- ✓ Vite+ commands: 168 files formatted, 0 errors, build succeeded

**Verdict:** APPROVED for merge. No revisions required.

---

### Current Issue #5: Profile-Aware Trend History Test Coverage (2026-05-31)

### Issue #5 Test Coverage Implementation (2026-06-01)

**Acceptance Tests Created: 21 tests in `apps/frontend/src/lib/trend.test.ts`**

**All Acceptance Criteria VALIDATED:**

- ✓ **Trend Grouping:** Each page has independent mobile/desktop trend histories keyed by `${pageId}:${profile}`. All pages in same group independently queryable by profile without cross-contamination.

- ✓ **Profile Isolation:** Switching profiles never mixes data. Mobile and desktop summaries compute independently from separate `ProfileData` instances. Deltas calculated from same-profile historical data only.

- ✓ **Units & Labels:** LCP trends milliseconds (validated 0–20,000ms range), score trends unitless 0–100 integers, THRESHOLDS define expected units for all CWV metrics, all threshold boundaries numerically comparable to trend data.

- ✓ **Summary-Only Visibility:** Historical trend data exists independently of detail availability. Minimum 10 data points per trend. Deltas computed from penultimate summary record regardless of detail retention.

- ✓ **Shared Contract:** Latest trend points equal current CWV/score values. Summary aggregates and current status both derive from `ProfileData`. No duplicate data sources.

**Quality Gates Met:**

- ✓ All 47 tests pass (21 new trend + 25 detail + 1 utils)
- ✓ Format/lint: 180 files formatted correctly, 0 errors/warnings
- ✓ Build: Static output ready for GitHub Pages deployment
- ✓ Coverage: All acceptance criteria + edge cases validated through automated tests

**Verdict:** Issue #5 test coverage COMPLETE. All acceptance criteria validated through automated tests. No fixtures needed beyond existing deterministic data in `data.ts`.

### Team Context — Issue #5 Sprint Summary (2026-06-01)

**Parallel Deliverables:**

- **Linus (Frontend):** TrendChart.svelte + TrendCard.svelte with Chart.js/design token integration, profile-aware rendering, full-width display in detail view.

- **Livingston (Data/AI):** SummaryRecord + PageHistory + TrendCatalog data contract with threshold classification covering all Google Web Vitals, profile isolation enforced, 46 comprehensive tests.

**Team Dependencies Satisfied:**

- Frontend components now have validated data contract from Livingston (SummaryRecord types, extraction helpers)
- Data contract has test-proven correctness (Yen: 21 trend tests + 46 threshold tests)
- Profile isolation enforced at both data and component layers
- Threshold functions ready for scorecard display

**Test Coverage Baseline Established:**

- Profile contamination prevention: Any same-profile query returns only same-profile data
- Unit consistency: All numeric fields validated against expected units (ms for LCP/TBT/FCP/TTFB, unitless for CLS/Score)
- Trend data contract: Extraction helpers proven correct through tests
- Regression prevention: 67 combined tests (threshold + trend) form baseline for Phase 2

**Blocked By:** Issue #3 (data extraction pipeline) pending. Frontend, data contract, and tests ready; awaiting live `summary.json` collection.

**Next Phase:** Issue #3 implementation can now validate extracted data against proven contract. Issue #4 (collection pipeline) unblocked once extraction complete.
