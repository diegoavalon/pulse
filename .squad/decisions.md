# Squad Decisions

## Active Decisions

- MVP is a self-hosted performance dashboard for eHealth/Pulse-branded Web Vitals reporting, replacing SpeedCurve-style SaaS dependency for the core loop.
- Use SvelteKit with `adapter-static`, Tailwind design tokens, and Chart.js initialized from Svelte `onMount`; do not add React.
- Collect data through GitHub Actions using the official `sitespeedio/sitespeed.io` Docker image on `ubuntu-latest`.
- Track about 10 QA pages from committed URL configuration, with mobile and desktop as first-class profiles; mobile is the default dashboard view.
- Use three throttled iterations and persist one-off tracked-page runs into the same trend history as scheduled runs.
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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
- Pending decisions from team onboarding (2026-05-31) require consensus before implementation begins
