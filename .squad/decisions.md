# Squad Decisions

## Active Decisions

- MVP is a self-hosted performance dashboard for eHealth/Pulse-branded Web Vitals reporting, replacing SpeedCurve-style SaaS dependency for the core loop.
- Use SvelteKit with `adapter-static`, Tailwind design tokens, and Chart.js initialized from Svelte `onMount`; do not add React.
- Collect data through GitHub Actions using the official `sitespeedio/sitespeed.io` Docker image on `ubuntu-latest`.
- Track about 10 QA pages from committed URL configuration, with mobile and desktop as first-class profiles; mobile is the default dashboard view.
- Use three throttled iterations and persist one-off tracked-page runs into the same trend history as scheduled runs.
- MVP does not target direct SpeedCurve parity; defaults are owned in-repo and tuned for Pulse use.
- Desktop MVP profile is fixed to cable throttle with 1366x768 viewport.
- Daily collection runs at 07:00 America/Los_Angeles; GitHub schedule is UTC-gated in workflow.
- Workflow artifacts retain for 14 days in MVP collection jobs.
- The committed 10-page QA `urls.json` is the seed catalog reference for collection inputs.
- Keep committed trend summaries lightweight and long-lived; keep rich detail and screenshots bounded to the most recent 14 days.
- Use a post-run Node extraction script rather than a custom sitespeed plugin.
- Run Claude-powered AI reviews on demand via workflow dispatch; keep secrets server-side in GitHub Actions and commit review markdown.
- INP is deferred until RUM exists; use TBT as the MVP lab interactivity proxy and label INP as unavailable rather than synthetic.
- Use GitHub Actions plus private GitHub Pages for CI/hosting; disregard Jenkins/EKS/Helm/CodeArtifact infrastructure from other repos.

## Pending Decisions — Team Consensus Needed

### MVP UI Route Structure (Rusty)

**Options:**

- Option A (Scorecard-first): Primary `/` shows mobile scorecard (all ~10 pages, red/yellow/green), drill into page → trends, profile → run detail. **RECOMMENDED**
- Option B (Trend-first): Primary `/pages/<id>`, scorecard secondary.
- Option C (Dashboard hub): `/` is a hub with quick links.

**Recommendation:** Option A maximizes marketing-friendly first impression while leaving drill-down rich.

---

### Data Schema Finalization (Rusty + Livingston)

**Options:**

- Option A (Strict schema): TypeScript interfaces in `packages/utils` before collection; validation fails loudly. **RECOMMENDED + HYBRID**
- Option B (Loose validation): Best-effort JSON, frontend graceful fallback.
- Option C (Hybrid): Core CWV/transfer/requests required; optional graceful omit.

**Recommendation:** Option A + C hybrid. TypeScript interfaces as source of truth. Required fields: id, label, url, profile, timestamp, cwv (null-safe INP), coachScore, transfer, requests. Optional: rich detail. Collection validates required; frontend graceful on optional.

---

### Tailwind Token Consumption Strategy (Linus)

**Options:**

- Option A (Direct config): Hardcode DESIGN.md into `tailwind.config.ts`.
- Option B (CSS custom properties): Define `:root` CSS vars in `app.css` mirroring DESIGN.md, Tailwind references `var(--primary)`. **RECOMMENDED**
- Option C (DESIGN.md → JSON → Tailwind): Over-engineered for MVP.

**Recommendation:** Option B. CSS custom properties in `apps/frontend/src/app.css`. Document mapping in comments. Single source of truth in CSS, decouples from Tailwind config.

---

### First Work Slice Sequence (Rusty + Team)

**Sprint Order:**

1. **Sprint 1:** Data schema (types/validation) + Tailwind tokens (DESIGN.md → CSS vars).
2. **Sprint 2:** Scorecard component (static mock data) + collection dry-run (Basher/Livingston).
3. **Sprint 3:** Trending UI (charts, profile picker) + first live collection run.
4. **Sprint 4:** Detail view (waterfall, diagnostics, screenshots).
5. **Sprint 5:** AI review UI (on-demand).
6. **Sprint 6:** Pages deploy wiring + smoke tests.

**Go/No-Go per sprint:** Schema reviewed → Scorecard renders all metrics + groups → Trends chart renders live data → Waterfall visible + no 404s → Claude API successful + markdown rendered → Pages live + smoke test passes.

---

### Risk Mitigations (Rusty)

- **DESIGN.md fallback:** Use placeholder design tokens + "Bootstrap style" section as backstop if delayed.
- **Collection schema fallback:** Extraction logs missing fields as warnings; frontend omits gracefully.
- **Claude API fallback:** Button disabled at build time if no key; link to roadmap instead.
- **Threshold flexibility:** Constants in `packages/utils` SCORECARD_THRESHOLDS for easy override.

---

### Quality Gates & Definition of Done (Rusty + Yen)

**UI Components:** TypeScript compiles, renders with mock + live data, responsive (mobile-first), accessible (alt, ARIA, kbd nav), matches DESIGN.md tokens (or fallback consistent).

**Data Layer:** Schema interfaces lock before collection; validation unit tests; collection validates loudly.

**Collection Pipeline:** Dry-run on 2–3 URLs succeeds; concurrency tested; partial failure correct.

**Pages Deploy:** Build output to correct dir; Pages points correct; smoke test succeeds (homepage scorecard visible).

**AI Review:** Claude call succeeds, markdown parseable, no secrets leaked, committed to `data/<id>/<profile>/reviews/<ts>.md`.

---

### Mobile Breakpoint Strategy (Linus)

**Options:**

- Option A (Responsive single layout): Tailwind breakpoints scale spacing/font, flex reflows. Simpler. **RECOMMENDED**
- Option B (Separate mobile layout): Different route structure or Svelte component branches. More control.

**Recommendation:** Option A. Shared components, responsive scales (simpler maintenance).

---

### Chart Tooltip & Legend Styling (Linus)

- Chart.js with custom plugins for brand-compliant tooltips
- Tailwind-driven positioning and colors
- Rounded pill aesthetic (9999px radius) for brand consistency

---

### Empty State & Error Handling UI (Linus)

- No runs yet (MVP first day): "Waiting for first collection..."
- Run failure or timeout: "Collection failed; check logs."
- Detail expired (>14 days): "Data archived; see summary."
- Missing profile: "This profile has no data yet."

---

### Waterfall / HAR Rendering Component (Linus)

- Evaluate third-party `waterfall-js` or `har-viewer` vs. custom
- Integrate with Tailwind tokens (colors, spacing)
- Separate page or expandable panel within detail view (TBD after first sprint)

---

### Pagination vs. Scroll for Trend History (Linus)

- Time-range picker (last 7 days, 30 days, all): **RECOMMENDED** (simpler UX than infinite scroll or pagination)
- Virtual scroll for performance if needed

---

### Accessibility: Focus States & High-Contrast Mode (Linus)

- Tailwind `focus-visible` patterns on all interactive elements
- High-contrast scorecard mode option (prominent red/yellow/green)
- Comprehensive aria-labels for non-obvious interactive elements

---

### Mobile-First Navigation (Linus)

- Sticky positioning (not fixed)
- Hamburger menu on mobile, full nav on desktop
- Links: dashboard (home), pages list, settings (future); actions: manual run trigger, AI review

---

### Concurrency & Overlapping Runs (Basher)

**Options:**

- Option A (Repo-wide serialization): All scheduled + manual runs in order. **RECOMMENDED**
- Option B (Per-trigger lanes): Scheduled on one lane, manual on another.
- Option C (Parallel matrix, serialize consolidation): Matrix parallel, consolidation serial.

**Recommendation:** Option A. Simpler to reason about, prevents matrix artifact collisions, daily runs not latency-critical.

---

### Artifact Retention & Cleanup Strategy (Basher)

**Options:**

- Option A (90-day default): GitHub Actions default, assume full details via committed 14-day window. **RECOMMENDED**
- Option B (30-day): Shorter retention, save storage.
- Option C (180-day): Extended for audit trail.

**Recommendation:** Option A. Gives runway for failure postmortems without forcing cleanup logic.

---

### Scheduled Collection Time & Timezone (Basher)

**Action:** Coordinate with product/QA to identify best low-traffic window. e.g., `0 2 * * *` (2 AM UTC) or `0 10 * * *` (10 AM UTC).

---

### Failure Handling: Per-Profile vs. Pipeline-Wide (Basher)

**Options:**

- Option A (All-or-nothing): All profiles must succeed or no commit.
- Option B (Partial success): Mobile success commits even if desktop fails; log in metadata. **RECOMMENDED**

**Recommendation:** Option B. Log "desktop FAILED, mobile only" so trend gaps are auditable; avoid losing mobile data over desktop transients.

---

### Committer Identity for Consolidation Commits (Basher)

**Options:**

- Option A (`github-actions[bot]`): Default, clear automation signal. **RECOMMENDED**
- Option B (Named actor): Service account or Basher identity.
- Option C (Scribe identity): Consistency with session logging.

**Recommendation:** Option A. Standard for Actions, automation clarity, works with private Pages.

---

### Secrets Rotation & Access Control (Basher + Livingston)

**Action:** Defer until Livingston wires Claude API workflow. GitHub Actions secret management (single repo or org-wide, rotation schedule, no logs/artifacts).

---

### Pages Deployment: Automatic vs. Manual Trigger (Basher)

**Options:**

- Option A (Atomic auto-deploy): Consolidation job builds SvelteKit + deploys to Pages. **RECOMMENDED**
- Option B (Commit-triggered deploy): Consolidation commits, separate workflow deploys.

**Recommendation:** Option A. Simpler, prevents race conditions, safe failure mode (Pages stays on previous commit if build fails).

---

### Matrix Profile Expansion (Basher)

- MVP locks to mobile (4g) + desktop (cable) only
- Parameterization (slow-4g, 3g, etc.) deferred to Phase 2

---

### Claude Model for Theme-Aware Reviews (Livingston)

**Options:**

- `claude-opus-4`: Highest quality, ~200k context, highest cost. (Recommended if high-quality priority)
- `claude-3.5-sonnet`: Balanced quality/speed/cost, ~200k context. **RECOMMENDED**
- `claude-3-sonnet`: Cheaper, slightly lower quality.

**Action:** Rusty decides on model + budget ceiling. Basher pins in workflow.

---

### Claude Review Prompt Template & Output Format (Livingston + Linus)

**Action:** Draft example review.md before implementation.

- Prompt structure: How to inject theme context (WP sticky header, WC checkout modals, eHealth branding)
- Output sections: "Quick Wins" + "Deep Dives" + "Blockers" (structured markdown, consistent ordering)
- Depth expectations: Developer-actionable (link to HAR entry, specific fix, priority tier)

---

### Metric Cardinality & Comparison Strategy (Livingston)

**Options:**

- Just analyze this run in isolation
- Compare to previous best ("regressed 200ms since...")
- Compare to n-run average ("200ms above 30-day average")

**Recommendation:** Compare to most recent run (simpler, sufficient signal); defer n-run average to Phase 2.

---

### Review History Retention & Pagination (Livingston)

- Keep all reviews forever (like summary)
- Establish UI pagination strategy: show latest 10, link to full history
- Revisit if repo size becomes an issue (Phase 2)

---

### Schema Versioning & Backward Compatibility (Livingston)

- Add `schemaVersion: "1.0"` to summary.json now (cheap insurance for Phase 2)
- No backfilling for MVP
- Phase 2 design addresses migration when CrUX/RUM added

---

### Screenshot & Raw Artifact Lifecycle Beyond 14 Days (Livingston)

**Recommendation:**

- Delete screenshots after 14 days (saves ~600KB/run)
- Keep raw browsertime.json + HAR in Actions artifacts for 90 days (backstop for re-extraction)
- Detail view shows "data archived" fallback gracefully
- Revisit S3 in Phase 2

---

### Sitespeed Version Upgrades & Backward Compatibility (Livingston)

**Options:**

- Auto-update Docker (latest tag): Risk of schema breakage.
- Pin major version (41.x): Miss improvements.
- Pin exact version (41.2.0): More control. **RECOMMENDED**

**Recommendation:** Pin exact 41.2.0. Require explicit team discussion + extraction update before semver upgrades. Document breaking changes in extract.mjs comments.

---

### Test Strategy: Unit Tests vs. Integration vs. E2E (Yen)

- **Unit tests (non-negotiable):** Extraction logic with fixture data, schema validation, threshold classification, profile isolation, one-off vs. scheduled persistence
- **Integration tests (optional):** Extraction + sitespeed Docker, consolidation coordination, data persistence
- **E2E tests (optional):** Dashboard build, chart rendering, UI threshold display (Phase 2)

**Recommendation:** Unit tests blocking; integration/E2E deferred.

---

### Data Integrity: Test Fixtures & Schema Validation (Yen)

**Recommendation:** Strict schema validation (TypeScript + runtime checks) + maintain 5–10 fixture files:

- Sample browsertime.json (3 iterations, real timing)
- Sample HAR (requests, resource timings)
- Expected summary.json output
- Edge cases: high CLS (0.77), low LCP, poor TBT

---

### Threshold Correctness: Test-Driven Validation (Yen)

**Recommendation:** Pure function `classify(metric, thresholds) → "good" | "needs-work" | "poor"`

- Test all 18 cases: 6 metrics × 3 tiers (LCP, CLS, TBT, FCP, TTFB, INP)
- Test boundary values (LCP=2500ms exactly, CLS=0.25 exactly)
- INP always "unavailable" or null
- Link to Google CWV spec for auditability

---

### Profile Isolation: Preventing Data Cross-Contamination (Yen)

- Extract receives profile ∈ {mobile, desktop}; reject if invalid
- Each summary record must have profile field matching folder it's stored in
- Consolidation validates both matrix artifacts present before commit
- Test that querying `data/homepage/mobile/` returns zero desktop records
- Strict rejection on profile mismatch

---

### Retention & Pruning: Testing the 14-Day Boundary (Yen)

**Recommendation:**

- Prune in consolidation job after commit
- Retain last 14 calendar days (inclusive)
- Log pruned files to retention.log for audit
- Test with frozen clock (mock Date.now()) for boundary behavior

---

### Workflow Safety: Matrix Job Race Prevention Testing (Yen)

**Recommendations:**

- Artifact coordination: Matrix jobs upload separate paths (`artifacts/mobile/`, `artifacts/desktop/`)
- Consolidation atomicity: Single consolidation job downloads both artifacts, performs one atomic commit
- Test matrix job upload succeeds even if other profile fails
- Test consolidation failure (git push timeout) is idempotent on retry
- Test concurrent dispatch queues (only one executes at a time)

---

### Secret Handling & Compliance Testing (Yen)

- Repo scanning tests: No hardcoded API keys, no `process.env.CLAUDE_API_KEY` in browser code
- Review markdown must not contain auth tokens, internal URLs, sensitive data
- Pre-commit hook scans for secret patterns
- Manual review gate: Yen rejects PRs with suspect content
- Document secret handling in README + review PR template

---

### One-Off Runs: Persistence & Deduplication (Yen)

**Recommendation:**

- Allow duplicates (dedup adds complexity)
- Use standard runId (ISO timestamp)
- Document that multiple same-timestamp same-profile runs are visible as separate entries
- Log each manual run to audit trail for cost tracking

---

### INP Handling: Phase 2 Migration Safety (Yen)

**Recommendations:**

- MVP summary.INP = null (not omitted, not 0)
- UI displays "INP requires RUM (Phase 2)" (explicit message, not blank)
- Do NOT backfill synthetic INP into old runs (misleading)
- At Phase 2, add schema version field to support migrations
- Test UI graceful degradation when INP = null

---

### Test Organization & Running Tests (Yen)

- Extraction tests in `packages/extract/tests/`
- Require all tests pass before `vp ready` succeeds
- Descriptive test names (e.g., `cls-0-77-classified-as-poor.test.ts`)
- Add `vp run -r test` to CI before deploy

---

## Issue #2: Dashboard Shell Bootstrap

**Status:** ✓ COMPLETE (2026-05-31)

### Decision

**What Linus Built:**

- Implemented branded static SvelteKit shell using `adapter-static`, ensuring GitHub Pages compatibility
- Variation C editorial landing structure: clean cream (`#f7f7f2`) canvas with olive primary (`#5b6f00`) and lime accents (`#b2c248`)
- Floating pill navigation; "Most Recent run" section; "All Pages" affordance
- Empty-state messaging: "Performance data is not loaded yet" with explanatory subtext ("Until `summary.json` lands, Pulse shows the state plainly instead of inventing placeholder metrics")
- Shell stats display graceful fallback ("—" for page count, "No data" for last run) rather than mock data
- No React dependencies; pure SvelteKit 2 + Svelte 5 (runes mode) + Tailwind v4 + TypeScript
- Prerendering via `+layout.ts` + `svelte.config.js` adapter-static configuration

### Validation

**Yen Approval:**

- ✓ Static build succeeds; output to `build/` with prerendered `index.html` and bundled CSS/JS assets
- ✓ eHealth/Pulse visual direction achieved: warm cream canvas, white elevated surfaces, olive primary, lime accents; Quadrant serif display font, Melange sans body; rounded cards (`rounded-[28px]`), pill controls (`rounded-full`); spare shadows (`shadow-pulse`)
- ✓ Empty-state messaging clear and prominent; no placeholder nonsense
- ✓ Frontend stack verified: zero React imports, no backend runtime deps, no `process.env` in client code
- ✓ Vite+ commands functional: `vp check` (168 files formatted, 0 errors), `vp test` (1 utils test pass), `vp run -r build` (success, ready for Pages)
- ✓ Accessibility: `focus-visible:ring-2 focus-visible:ring-primary` on interactives; `aria-label` on profile toggle; semantic HTML; `aria-hidden` on decorative elements
- ✓ Quality gates: SvelteKit → static HTML/CSS/JS; TypeScript strict; design tokens consistent; shell ready for `summary.json` integration
- **Verdict:** APPROVED for merge. No revisions required.

### Learnings

**From Linus:**

- **Svelte 5 Runes in Practice:** Reactive state management via `$derived` and `$state` works cleanly for dashboard layout; no need for external state container for first iteration
- **Theme.css Integration:** CSS custom properties (`:root` in `app.css`) mirroring DESIGN.md design tokens integrate seamlessly with Tailwind `@apply` and direct `var()` references; decouples Tailwind config from brand values for maintainability
- **Static Prerendering:** Adding `+layout.ts` with prerendering config ensures every route produces static HTML at build time; no server-side runtime overhead for Pages
- **Empty-State UX:** Explicit "no data" state prevents user confusion; beats placeholder charts or mock metrics that look real but aren't
- **Design Token Discipline:** Strict adherence to branded colors/spacing/typography from day one (Quadrant serif, Melange sans, 4px grid) prevents visual debt and ensures consistency for future component additions

---

## Issue #5: Profile-Aware Trend History & Charts

**Status:** ✓ COMPLETE (2026-05-31)

### Frontend Implementation (Linus)

**Decision:** Implement profile-aware trend charts using Chart.js initialized in Svelte `onMount`, with design tokens consumed via CSS custom properties and profile isolation enforced by component-level reactive bindings.

**Components Created:**

1. **TrendChart.svelte** — Chart.js wrapper component
   - Initializes Chart.js in `onMount` to avoid SSR issues
   - Consumes CSS custom properties for all chart colors (`--good`, `--ni`, `--poor`, `--muted`, `--color-surface-elevated`, `--color-border`)
   - Dynamically determines line color based on latest value's rating (good → green, ni → yellow, poor → red)
   - Supports CWV metrics (LCP, CLS, TBT with `fmtMetric`) and score metrics (Coach Score as integer)
   - Destroys chart instance on component unmount to prevent memory leaks

2. **TrendCard.svelte** — Section container
   - Displays LCP trend and Coach Score trend in two-column grid
   - Profile-aware: trend data from `det.d` which is profile-isolated
   - Empty state when trend data insufficient (<2 points)
   - Informational note: "Trends show {profile} profile only. Switch profiles to see desktop or mobile independently."

**Integration:** Added TrendCard to `/pages/[id]/+page.svelte` above diagnostics grid, full-width for readability. Profile switching triggers Svelte reactive `$derived` bindings → TrendCard re-renders → Chart.js destroys old chart and re-initializes with new profile data.

**Validation:** ✓ Build succeeds (`vp run -r build`), tests pass (47 total, includes 21 new trend tests), TypeScript clean, profile isolation verified through re-renders.

**Trade-offs:** Chart.js chosen for well-documented framework-agnostic approach with out-of-the-box tooltip/legend/axis support. Bundle cost ~50KB gzipped acceptable for UX improvement. Alternatives (native SVG, D3.js, Recharts) rejected for complexity, bundle size, or React incompatibility.

---

### Data Contract (Livingston)

**Decision:** Implement append-friendly, profile-aware time-series data contract supporting Chart.js visualizations while maintaining strict profile isolation and explicit units.

**Data Structures:**

1. **SummaryRecord** — Single run record with explicit units in field names
   - Fields: id, label, url, profile, timestamp (ISO 8601Z), cwv, coachScore, transfer, requests, thirdPartyRequests, sitespeedVersion, runId
   - CWV metrics: LCP (ms), CLS (unitless), TBT (ms), FCP (ms), TTFB (ms), INP (null in MVP)
   - Transfer sizes: total, js, css, image, other (all bytes)

2. **PageHistory** — Profile-aware container with independent mobile/desktop arrays
   - Each array chronological (oldest first) for append-friendly writes
   - Supports summary-only runs (no detail dependency)

3. **TrendCatalog** — Top-level index keyed by page ID
   - Includes lastUpdated and pageCount metadata
   - Single source for both scorecard and trend chart data

**Threshold Classification (`thresholds.ts`):**

- LCP: ≤2500ms good, ≤4000ms ni, >4000ms poor
- CLS: ≤0.1 good, ≤0.25 ni, >0.25 poor
- TBT: ≤200ms good, ≤600ms ni, >600ms poor
- FCP: ≤1800ms good, ≤3000ms ni, >3000ms poor
- TTFB: ≤800ms good, ≤1800ms ni, >1800ms poor
- INP: ≤200ms good, ≤500ms ni, >500ms poor (Phase 2, MVP returns null)

**Helper Functions:**

- `rateMetric` — Classify single metric value
- `ratePageStatus` — Worst of headline metrics (LCP, CLS, TBT) determines status
- `formatMetricValue` — Units-aware formatting ("1.54 s", "0.769", "888 ms")
- `latestSnapshots` — Extract most recent run per page/profile
- `extractMetricSeries` — Direct Chart.js consumption without transformation
- `extractScoreSeries` — Coach score time-series extraction

**Validation:** ✓ 46 comprehensive tests covering all 18 threshold boundaries, profile isolation, INP null handling, formatting edge cases. `vp check` clean (180 files formatted, 51 linted, 0 errors). Static build succeeds. 92 total tests pass.

**Key Decisions:**

- Units explicit in field names and type comments, never wrapped in separate unit objects
- Profile dimension first-class; each page has independent mobile/desktop arrays
- Summary-only runs remain visible in trends via `PageHistory` structure
- Latest status and trend views derive from same `SummaryRecord` contract
- Schema version field optional for MVP, ready for Phase 2 migrations
- Trend data structure supports append-only writes (chronological arrays, no sorting required)

---

### Test Coverage (Yen)

**Decision:** Implement comprehensive acceptance test suite (21 tests) validating all Issue #5 requirements in `apps/frontend/src/lib/trend.test.ts`.

**Coverage:**

1. **Trend Grouping** — Each page has independent mobile/desktop trend histories keyed by `${pageId}:${profile}`. All pages in same group independently queryable by profile without cross-contamination.

2. **Profile Isolation** — Switching profiles never mixes data. Mobile and desktop summaries compute independently from separate `ProfileData` instances. Deltas calculated from same-profile historical data only.

3. **Units & Labels** — LCP trends milliseconds (validated range 0–20,000ms), score trends unitless integers 0–100, THRESHOLDS define expected units for all CWV metrics (ms for LCP/TBT/FCP/TTFB, empty string for CLS), all threshold boundaries numerically comparable to trend data.

4. **Summary-Only Visibility** — Historical trend data exists independently of detail availability. Minimum 10 data points per trend. Deltas computed from penultimate summary record regardless of detail retention.

5. **Shared Contract** — Latest trend points equal current CWV/score values. Summary aggregates and current status both derive from `ProfileData`. No duplicate data sources.

**Rationale:** No new fixtures needed; existing deterministic fixture data in `data.ts` provides sufficient coverage through 14-point trend series per page per profile. 21 tests cover all acceptance criteria plus edge cases (boundary values, delta calculations, summary aggregation correctness).

**Validation:** ✓ All 47 tests pass (21 new + 25 detail + 1 utils). Format/lint: 180 files formatted, 0 errors/warnings. Build succeeds; static output ready for Pages deployment.

**Impact:** Blocks none. Enables frontend developers to confidently integrate trend charts knowing data contract validated. Ready for integration once Issue #3 (data schema & extraction) delivers live summary data.

---

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
- Pending decisions from team onboarding (2026-05-31) require consensus before implementation begins

## Issue #6 Decision: MVP Operating Inputs Audit & HITL Facilitation

**Rusty | 2026-06-01**

### Summary

Audited the repository and `docs/00__main-brief.md` for values needed to finalize issue #6 (Finalize MVP operating inputs and parity settings). Result: **2 items locked, 4 assumed + pending verification, 4 completely missing**.

### Locked Values ✅

| Item                                | Value                 | Source                                                         |
| ----------------------------------- | --------------------- | -------------------------------------------------------------- |
| Artifact retention (GitHub Actions) | 90 days default       | docs/00\_\_main-brief.md:315 + .squad/decisions.md             |
| Detail/screenshot retention         | 14-day rolling window | docs/00\_\_main-brief.md:157 + .squad/decisions.md (confirmed) |

### Assumed (Requires Verification) ⚠️

| Item                 | Default    | Source                       | Action                                        |
| -------------------- | ---------- | ---------------------------- | --------------------------------------------- |
| Iterations           | 3 (median) | docs/00\_\_main-brief.md:322 | Verify against SpeedCurve actual              |
| Mobile throttle      | `4g`       | docs/00\_\_main-brief.md:115 | Verify against SpeedCurve config              |
| Desktop throttle     | `cable`    | docs/00\_\_main-brief.md:115 | Verify against SpeedCurve config              |
| Desktop CPU throttle | None       | inferred                     | Confirm exact profile (cable + CPU throttle?) |

### Missing (HITL Required) ❌

1. **Initial QA URL catalog** — ~10 pages with stable IDs, labels, URLs, groups. Required format: `urls.json` with `{id, label, url, group}` tuples.
2. **Daily run schedule** — Hour (UTC) and timezone context. Low-traffic window for QA.
3. **Claude API model** — Which model for on-demand reviews (e.g., claude-3-5-sonnet)?
4. **Claude API budget** — Per-review cost tolerance or monthly ceiling (e.g., $1/review or $50/month).

### HITL Decision Prompts (Ordered Checklist)

Present to Diego Avalon + product/QA one-by-one via issue #6 thread:

#### Prompt 1: Initial QA Page Catalog

```
We need the initial ~10 QA pages to track. For each, provide:
- ID (stable, lowercase, e.g., `homepage`)
- Label (human-friendly, e.g., "Home")
- URL (full QA URL, no auth required)
- Group (logical grouping for scorecard, e.g., `core`, `checkout`)

Example:
[
  {"id": "homepage", "label": "Homepage", "url": "https://qa.ehealth.local/", "group": "core"}
]
```

#### Prompt 2: SpeedCurve Parity Config

```
What are SpeedCurve's current collection settings?
- Number of iterations (we default to 3; correct?)
- Mobile connectivity (we default to `4g`; what does SpeedCurve use?)
- Desktop connectivity (we default to `cable`; what does SpeedCurve use?)
- CPU throttle (desktop only; any applied?)
```

#### Prompt 3: Desktop Profile Definition

```
Confirm the exact desktop collection profile:
- Connectivity: `cable`?
- CPU throttle: None / 2x / 4x / custom?
- Device/viewport: 1366x768 (sitespeed.io default) or specific?
```

#### Prompt 4: Daily Run Schedule

```
When should the daily collection run (low-traffic window)?
- Hour (UTC): e.g., 02:00 UTC, 10:00 UTC, 22:00 UTC?
- Timezone context: What timezone is QA in?
(We'll schedule UTC and you verify alignment.)
```

#### Prompt 5: Claude API Model & Budget

```
For on-demand AI reviews (theme-aware advice per page/profile):
- Model: claude-3-5-sonnet / claude-opus-4.1 / other?
  (Recommend Sonnet for cost/quality balance.)
- Budget: Max cost per review, or monthly ceiling?
  (e.g., "$1 per review" or "$50/month total".)
- Scope: Both mobile + desktop, or mobile only?
```

### Recommended Flow

1. **Diego** posts answers to prompts 1–5 as issue #6 comment (or Slack/email to Rusty).
2. **Rusty** looks up SpeedCurve config (UI / docs / ask product) + compares defaults.
3. **Rusty** locks final values in `.squad/decisions.md` or project config (TBD post-decision).
4. **Unblock Sprint 3:** Collection workflow can finalize GitHub Actions schedule + Claude API call.

### Rationale

- **Locked items** are firm across all references; no follow-up needed.
- **Assumed defaults** are reasonable per design doc but require external verification (SpeedCurve audit).
- **Missing items** are pure human input: catalog domain knowledge (QA URLs), product choice (schedule), budget/model (cost control).
- **Parity verification** ensures day-over-day comparison fairness (different settings = incompatible trends).

### Files to Update Once Confirmed

- `urls.json` — committed URL catalog
- `.github/workflows/collect.yml` — schedule cron + Claude model + budget env var (if per-request limit)
- `packages/utils/src/config.ts` — collection profile defs (iterations, throttles, timezones)
- `docs/01__operating-inputs.md` — new operational reference doc (optional)

---

**Blocked on:** Diego's answers + SpeedCurve config lookup.
**Unblocks:** Sprint 3 (collection + AI review workflows).
**Estimated resolution:** End of day (assuming Diego turnaround ≤ 2h).

---

## Issue #6 Survey: MVP Operating Inputs & Parity Settings — Pipeline Review

**Basher | 2026-06-01**

### Acceptance Criteria — Assessment

#### ✅ Partially Met: SpeedCurve Parity Settings

**Current State:**

- Decided: 3 iterations (median), mobile throttle = `4g`, desktop throttle = `cable`
- Location: `docs/00__main-brief.md` line 111–115
- Rationale: Noise reduction + runner independence + SpeedCurve comparability documented

**Gap:**

- Marked as "OPEN Q" in brief: "Match against SpeedCurve's current config"
- No actual SpeedCurve iteration count / connectivity profile lookup
- No confirmation that `4g` (mobile) and `cable` (desktop) match your current SpeedCurve setup

**Action Required:**

- Verify SpeedCurve's current throttle profile + iteration strategy
- Confirm or override the proposed MVP defaults
- Document exact profile names for sitespeed.io CLI (e.g., `--throttle 4g`)

---

#### ✅ Partially Met: Desktop Profile Definition

**Current State:**

- Proposed: `cable` (faster than mobile `4g`); no CPU throttle mentioned
- Location: `.squad/agents/basher/history.md`, `.squad/decisions.md`
- Stated: "MVP rigid (mobile 4g | desktop cable); parameterization deferred to Phase 2"

**Gap:**

- Exact desktop profile incomplete: throttle name only, no device target or CPU setting
- Brief says "e.g. `cable`" suggesting flexibility, but exact choice not locked
- No sitespeed.io profile definition in repo; will need mapping to real params

**Action Required:**

- Confirm desktop throttle = `cable` (or alternative)
- Confirm if CPU throttle is disabled or set to a specific value
- Create profile definitions before writing collection workflow

---

#### ❌ Not Started: Daily Run Schedule + Timezone

**Current State:**

- Documented as ACTION ITEM in `.squad/decisions.md`:
  - "Coordinate with product/QA to identify best low-traffic window"
  - Examples: `0 2 * * *` (2 AM UTC) or `0 10 * * *` (10 AM UTC)
  - No decision made; no workflow scheduled yet

**Gap:**

- No schedule confirmed
- No timezone decided (UTC vs. your org's local time)
- No collection workflow file exists (`.github/workflows/collect.yml` or similar)

**Action Required:**

- Decide collection window (time + timezone)
- Consider: low-traffic time for your QA environment, ops team availability for triage
- Once decided, will be written to `cron` field in GitHub Actions workflow

---

#### ✅ Decided: Artifact Retention Policy for MVP

**Current State:**

- Decision: Option A (90-day GitHub Actions default)
- Location: `.squad/decisions.md`, `docs/00__main-brief.md`
- Rationale: Summary.json trends committed infinitely; detail + screenshots bounded to 14-day rolling window
- Not yet configured in workflow (no workflow file exists)

**Detail:**

- Trend data (`summary.json`): committed to repo, infinite retention ✅
- Rich detail + screenshots: baked into site for last 14 days only ✅
- Raw artifacts (GitHub Actions): default 90-day expiry (no special cleanup needed) ✅

**Action Required:**

- None — use as-is for MVP; workflow will reference default retention
- Reserve Phase 2 for custom retention logic if needed

---

#### ❌ Not Started: Claude Model & Budget Ceiling for AI Review

**Current State:**

- No decision made; marked as "defer until Livingston wires Claude API workflow"
- Location: `.squad/decisions.md` under "Secret Rotation & Access Control"
- On-demand only (no per-run cost bleed)

**Gap:**

- No Claude model chosen (e.g., `claude-3-sonnet-20240229`)
- No budget/cost ceiling defined (e.g., "max $X/month for on-demand reviews")
- No workflow_dispatch endpoint wired yet

**Action Required:**

- Decide Claude model (availability, cost, capability tier)
- Define budget ceiling + overage handling (disable button if exceeded?)
- Defer exact implementation to Livingston (AI/Claude specialist)

---

#### ✅ Confirmed: MVP Constraints Remain Explicit

**Current State:**

- All constraints documented in `docs/00__main-brief.md` lines 89–104:
  - QA pages only (not production)
  - No login-protected pages
  - No cookies/auth workarounds
  - No arbitrary ad-hoc URLs (run-now is limited to tracked pages)

**Validation:**

- ✅ No tracked page behind login/auth
- ✅ Data layer has no embedded secrets
- ✅ URLs driven by committed `urls.json` (stable, vetted)

---

#### ❌ Not Started: Initial ~10 QA Page Entries

**Current State:**

- No `urls.json` file in repo
- Schema expected: `[{id, label, url, group}]` (per decision #4, `docs/00__main-brief.md` line 145)
- No sample data, no placeholder

**Gap:**

- User must provide the list; this is human input
- Needs stable IDs (no UUIDs; e.g., `homepage`, `pricing`, `contact`)
- Needs group labels (for scorecard clustering)

**Action Required:**

- Provide or confirm the initial ~10 pages (IDs, labels, URLs, groups)
- Once confirmed, scaffold `urls.json` in repo root
- Use as single source of truth for all collection runs

---

### Summary: What Needs User Input

| Item                                   | Current                          | Status                     | Owner              |
| -------------------------------------- | -------------------------------- | -------------------------- | ------------------ |
| SpeedCurve iteration/throttle settings | 3 iter, 4g mobile, cable desktop | Proposed; needs validation | Diego/Product      |
| Desktop profile exact definition       | cable (no CPU throttle detail)   | Proposed; incomplete       | Diego/Product      |
| Daily run schedule                     | None decided                     | ACTION ITEM                | Diego/QA           |
| Daily run timezone                     | None decided                     | ACTION ITEM                | Diego/QA           |
| Claude model & budget                  | `claude-haiku-4.5`, $50/month    | IMPLEMENTED (Issue #6)     | Diego + Livingston |
| ~10 QA page entries                    | None confirmed                   | ACTION ITEM                | Diego/Product      |

---

### Proposed Safe Defaults (Where No Value Exists)

**If user requests immediate MVP scaffolding without decisions:**

```json
// urls.json — placeholder structure (user to fill)
[
  {
    "id": "homepage",
    "label": "Homepage",
    "url": "https://example.com/",
    "group": "key_pages"
  }
  // ... 9 more entries
]
```

**GitHub Actions workflow defaults (to be written):**

- Schedule: `0 2 * * *` (2 AM UTC) — low-traffic default; user overrides post-MVP
- Timezone: UTC (no offset; always explicit in cron)
- Retention: 90 days (GitHub Actions default; no override needed)
- Throttle: `4g` (mobile), `cable` (desktop) — from brief recommendation
- Iterations: 3 (median strategy; from brief decision #6)

**Claude defaults (for Livingston):**

- Model: `claude-haiku-4.5` (locked MVP default for on-demand review)
- Budget: $50/month (hard guardrail; review blocked when projected spend exceeds ceiling)

---

### Next Steps

1. **Diego:** Confirm or override throttle/profile/schedule/budget items above
2. **Diego + QA:** Decide daily collection window (time + timezone)
3. **Diego + Product:** Provide ~10 QA page entries (or placeholder to scaffold)
4. **Basher:** Once inputs confirmed, scaffold collection workflow + `urls.json`
5. **Livingston:** Once Claude model/budget confirmed, wire AI review workflow

---

### Issue #6 Implementation Lock (2026-06-01)

Implemented repository defaults in workflow/config/docs:

- No direct SpeedCurve parity in MVP
- Desktop profile fixed to `1366x768` on `cable`
- Daily schedule fixed to `07:00 America/Los_Angeles`
- Artifact retention fixed to `14 days`
- Seed catalog locked to current committed 10-page `urls.json`

## Issue #6 AI/Claude Constraints — Current State vs Missing

**Livingston | 2026-06-01**

**Status:** Pending user confirmation  
**Owner:** Livingston (Data/AI Engineer)  
**Acceptance Criteria:** All three items below must be confirmed for issue #6 resolution.

---

### 1. Claude Model Expectation for On-Demand Review

#### Current State

**Decision documented but pending implementation:**

- Options: `claude-opus-4` (highest quality, ~200k context, highest cost), `claude-3.5-sonnet` (balanced quality/speed/cost, ~200k context), `claude-3-sonnet` (cheaper, lower quality)
- **Recommendation:** `claude-3.5-sonnet` (cost-aware balance for MVP)
- **Action assignee:** Rusty (Lead) — final model decision
- **Constraint:** On-demand only (`workflow_dispatch`), never automatic per-run reviews

#### Gap

- **No explicit model pinned** in code or workflow config
- No fallback model specified if Claude API becomes unavailable
- No usage telemetry / logging plan for cost tracking

#### Recommendation Options

| Option                        | Model               | Cost/Call              | Context     | Use Case                                                      |
| ----------------------------- | ------------------- | ---------------------- | ----------- | ------------------------------------------------------------- |
| **A: Quality-First**          | `claude-opus-4`     | ~$0.015–0.05 USD/call  | 200k tokens | High-quality theme-aware reviews; accept higher per-call cost |
| **B: Balanced (RECOMMENDED)** | `claude-3.5-sonnet` | ~$0.003–0.015 USD/call | 200k tokens | MVP cost-aware; same capability as 3-sonnet with better speed |
| **C: Cost-First**             | `claude-3-sonnet`   | ~$0.003–0.010 USD/call | 200k tokens | Aggressive cost control; acceptable quality for MVP           |

**Cost note:** Actual per-review cost depends on:

- Input size (detail.json + HAR + theme context = ~10–50 KB, ~2k–10k input tokens)
- Output size (review markdown = ~1k–5k output tokens)
- Volume (one-off reviews only = low frequency in MVP)

---

### 2. Budget Ceiling Expectation / Usage Guardrails for MVP

#### Current State

- **No budget ceiling documented**
- **No usage guardrails defined**
- **No cost monitoring mechanism**
- Cost control mentioned only as "on-demand only" (implicit rate limiting)

#### Gap

- Acceptance criterion "Claude budget ceiling expectations" is not addressed
- No documented max spend per month/quarter
- No alerting if API costs exceed threshold
- No rate limiting or review quota enforcement

#### Recommendation Options

| Option                                        | Budget                                    | Rationale                                                                                 | Enforcement                                           |
| --------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **A: Proof-of-Concept (RECOMMENDED for MVP)** | $50/month (~165 reviews at 3.5-sonnet)    | Conservative; catch issues early; manual GitHub Actions secret rotation if overages occur | Manual review of Actions logs + Anthropic billing     |
| **B: Generous (Team Trust)**                  | $200/month (~665 reviews at 3.5-sonnet)   | Assumes ad-hoc review frequency; covers spike testing; developer trust model              | Same as A, but raises alert threshold                 |
| **C: Production-Ready**                       | $500/month (~1,600 reviews at 3.5-sonnet) | Production thresholds; supports team growth; requires monitoring automation               | Add GitHub Actions cost-tracking job + Slack alerting |

**Notes:**

- Pricing estimates assume **3.5-sonnet** model at current Claude API rates (May 2026)
- **Enforcement:** Add GitHub Actions job that logs cumulative API usage (via `Anthropic.messages.count_tokens()`). No hard limit in GitHub Actions (secret cannot be revoked mid-build); instead, surface usage in logs + monthly review

#### Suggested MVP Approach

1. **Start with Option A ($50/month):** Conservative, low risk
2. **Monthly review:** Check `gh actions logs` for API cost trends
3. **Upgrade to Option B/C** after 2–3 months of data if team demand is higher

---

### 3. Constraints That Must Remain Explicit for MVP Scope

#### Current State (Confirmed)

From `docs/00__main-brief.md`:

- ✅ **On-demand only:** `workflow_dispatch` trigger, never automatic per-run
- ✅ **Theme-aware:** Must reference known issues (WP sticky header, WC checkout modals, eHealth branding)
- ✅ **Server-side:** Claude API key stored as GitHub Actions secret; never client-side
- ✅ **Output format:** Committed as markdown under `data/<id>/<profile>/reviews/<timestamp>.md`
- ✅ **Audience:** Developers (technical, action-oriented language)
- ✅ **Detail dependency:** Input includes `detail.json` + HAR + render-blocking diagnostics
- ✅ **No secrets leaked:** Markdown output must sanitize URLs, PII, internal hosts

#### Gaps

- **Prompt template not drafted:** "Quick Wins" + "Deep Dives" + "Blockers" structure mentioned but not implemented
- **Theme context injection method:** How to feed WP/WC knowledge into prompt not specified
- **HAR filtering logic:** Which HAR entries to include (render-blocking only? top N? all?) not decided
- **Output validation:** No plan to scan markdown for accidental secrets/PII

#### Explicit MVP Constraints (To be documented)

Add these to acceptance criteria:

1. **No RUM data:** MVP uses lab data only (detail.json from sitespeed.io)
2. **No arbitrary URLs:** Reviews only pages in `urls.json`
3. **No login-protected pages:** QA URLs only, no auth workarounds
4. **No cookies/session injection:** Detail data must capture fresh sessions
5. **No production monitoring in MVP:** Only QA environment (matches collection scope)
6. **Review availability:** Blocked on "No passing baseline run to diff against" (UI shows "pending AI review")

---

### Decision Checklist for Rusty/Diego

- [x] Approve Claude model: `claude-haiku-4.5`.
- [x] Approve budget ceiling: $50/month.
- [x] Confirm usage enforcement: Block review when projected monthly spend exceeds budget.
- [ ] Confirm all 6 MVP constraints above are acceptable?
- [ ] Assign implementation: Who drafts prompt template + HAR filter logic?

---

### Next Steps

1. **Rusty confirms:** Model + budget + enforcement approach
2. **Livingston drafts:** Example review.md template + prompt structure
3. **Basher implements:** Workflow config + GitHub Actions secret + usage logging
4. **Linus reviews:** Theme context injection (WP/WC knowledge + eHealth branding)
5. **Issue #6 acceptance:** All criteria met + decision document moved to `.squad/decisions/approved/`

---

## Issue #6 Implementation Update (2026-06-01)

- Default on-demand AI review model is now pinned to `claude-haiku-4.5` in `config/ai-review-defaults.json`.
- Monthly AI review budget ceiling is now pinned to `$50` in `config/ai-review-defaults.json`.
- Guardrail enforcement is implemented in `scripts/ai-review-budget-guardrail.mjs` and wired into `.github/workflows/ai-review.yml`.
- Guardrail blocks dispatches when `current_month_spend_usd + estimated_review_cost_usd > 50`.

---

## Issue #6 Implementation: Operating Inputs & AI Defaults (2026-06-01)

### Summary

Issue #6 implementation completed across three domains: collection workflow operating inputs, AI defaults and guardrails, and implementation audit. Combined changes passed validation (`vp check`, `vp test` 92 tests, `vp run -r build`).

### Basher: Operating Inputs Implementation

**Date:** 2026-06-01T22:00:00-05:00  
**By:** Basher (via Copilot)  
**Status:** ✅ Implemented

Locked issue #6 operating-input defaults in repository configuration:

1. ✅ No direct SpeedCurve parity in MVP (`directParityInMvp=false`)
2. ✅ Desktop profile: 1366x768 on cable throttle
3. ✅ Daily schedule: 07:00 America/Los_Angeles
4. ✅ Artifact retention: 14 days (`upload-artifact.retention-days: 14`)
5. ✅ Seed catalog: Current committed 10-page QA list in `urls.json` (no invented URLs)

**Files touched:**

- `.github/workflows/collect.yml`
- `config/operating-inputs.json`
- `urls.json`
- `docs/01__operating-inputs.md`
- `README.md`
- `docs/00__main-brief.md`

### Livingston: AI Defaults & Budget Guardrails

**Date:** 2026-06-01T22:00:00-05:00  
**By:** Livingston (Data/AI Engineer)  
**Status:** ✅ Implemented

Implemented explicit MVP AI defaults and enforcement:

- **Default model:** `claude-haiku-4.5` (cost-first for on-demand reviews)
- **Budget ceiling:** $50/month
- **Enforcement:** `scripts/ai-review-budget-guardrail.mjs` blocks reviews when projected spend exceeds ceiling
- **Workflow integration:** `.github/workflows/ai-review.yml` enforces defaults and guardrail

**Files touched:**

- `config/ai-review-defaults.json`
- `scripts/ai-review-budget-guardrail.mjs`
- `.github/workflows/ai-review.yml`
- `README.md`
- `docs/00__main-brief.md`

### Rusty: Implementation Audit & Gap Identification

**Date:** 2026-06-01  
**By:** Rusty (Lead)  
**Status:** ✅ Review Complete, Gaps Documented

Comprehensive coverage analysis of issue #6 acceptance criteria:

**✅ Fully Covered (Locked):**

- Artifact retention: 14 days — explicitly documented and implemented
- AI budget ceiling: $50/month — implemented in defaults + guardrail

**⚠️ Partially Covered (Gaps):**

- Desktop profile (1366x768 cable) — documented but viewport size not explicitly locked in config
- Daily schedule (07:00 LA) — documented but requires HITL confirmation before cron implementation

**❌ Mismatch (Requires Clarification):**

- AI model selection — acceptance criteria specifies `claude-haiku-4.5`, but Livingston recommendation vs. deployment differs. Cost estimates tied to model choice.

**Recommended Actions:**

1. Verify desktop viewport locked to 1366x768 in code
2. Confirm daily schedule time + timezone with user before implementing cron
3. Clarify AI model choice (haiku vs. sonnet); adjust cost estimates accordingly
4. Do not deploy collection workflow until: (1) viewport explicitly confirmed, (2) schedule confirmed + implemented, (3) model decision finalized

### User Directives Captured (2026-05-31)

**By:** Diego Avalon (via Copilot)

| Timestamp                 | Decision                                     | Why                                                   |
| ------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| 2026-05-31T21:43:27-05:00 | No direct SpeedCurve parity in MVP           | User decision from issue #6 operating input checklist |
| 2026-05-31T21:44:01-05:00 | Enable desktop profile 1366x768 cable        | User decision from issue #6 operating input checklist |
| 2026-05-31T21:44:38-05:00 | Daily run schedule 07:00 America/Los_Angeles | User decision from issue #6 operating input checklist |
| 2026-05-31T21:45:16-05:00 | Workflow artifact retention 14 days          | User decision from issue #6 operating input checklist |
| 2026-05-31T21:45:58-05:00 | Default on-demand AI model: claude-haiku-4.5 | User decision from issue #6 operating input checklist |
| 2026-05-31T21:46:41-05:00 | Monthly AI budget ceiling: $50/month         | User decision from issue #6 operating input checklist |

### Design & Frontend Updates (Parallel Track)

**Date:** 2026-05-31–2026-06-01  
**By:** Linus (Frontend Dev)  
**Status:** ✅ Implemented

#### Container Width Consistency Fix

**Change:** Unified container width across all pages to 1340px.

- Previously: Home page at 1180px, All Pages at 1340px
- Now: Both use 1340px for consistency
- File: `apps/frontend/src/routes/pulse-dashboard.css` (line 282)

#### Design System Unification

**Change:** Created unified container system (`/apps/frontend/src/lib/styles/containers.css`) consolidating:

- Tailwind-based containers (newer components)
- Pulse Dashboard custom CSS (legacy)

**New container types:**

- `.card` — Primary elevated containers (stat cards, feeds, data tables)
- `.section` — Large content areas (page heroes, major blocks)
- `.panel` — Accent panels with colored backgrounds (diagnostics, callouts)

**Design token mapping:**

- Background (elevated): `--color-surface-elevated` (#ffffff)
- Background (sunken): `--color-surface-sunken` (#f2f2ec)
- Border: `--color-border` (#d5d5d2)
- Shadow: `--shadow-pulse` (0 0 36px rgb(0 0 0 / 0.03))
- Radius (card): `--radius-lg` (12px)
- Radius (section/panel): `--radius-xl` (16px)
- Padding variants: `--spacing-lg` (16px), `--spacing-xl` (24px), `--spacing-xxl` (32px)

**Migrated components:**

- EmptyRunsFeed.svelte → `.section.section-lg`
- DiagnosticsPanel.svelte → `.panel.panel-lg`
- StatCard.svelte → `.card.card-padding-sm`
- ValidationBanner.svelte → `.panel.panel-sunken.panel-lg`
- ReadinessHero.svelte → `.section.section-xl` with nested `.card`

**Note:** Pulse Dashboard components maintain existing custom CSS (`.pd` root scope) for intentional visual distinction.

### Validation Results

- ✅ `vp check` — All files formatted correctly, no lint/type errors
- ✅ `vp test` — 92 tests passed
- ✅ `vp run -r build` — Build successful

### Next Steps

**Before Issue #6 Closure:**

- [ ] Desktop profile locked: `1366x768 cable` confirmed in code + docs
- [ ] Daily schedule locked: Time + timezone confirmed + cron implemented
- [ ] AI model confirmed: Haiku or Sonnet; cost estimates aligned
- [ ] Collection workflow exists: `.github/workflows/collect.yml` with profile definitions
- [ ] Config constants exist: `packages/utils/src/config.ts` exports PROFILES + ITERATIONS
- [ ] Usage logging ready: GitHub Actions job logs API spend
- [ ] All user prompts answered: Issue #6 thread shows Diego's responses

**Current Readiness:** ~75% unblocked; awaiting final three clarifications from user.
