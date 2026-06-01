# Project Context

- **Owner:** Diego Avalon
- **Project:** pulse
- **Description:** Self-hosted eHealth/Pulse-branded performance dashboard replacing SpeedCurve-style reporting with sitespeed.io collection, static SvelteKit presentation, and on-demand Claude AI reviews.
- **Stack:** SvelteKit, adapter-static, Tailwind tokens, Chart.js, GitHub Actions, private GitHub Pages, sitespeed.io Docker, Node extraction scripts, Claude API.
- **Created:** 2026-05-31
- **Seed references:** `docs/00__main-brief.md`, `diegoavalon/pulse#1`

## Learnings

- Collection must run as Dockerized sitespeed.io, not local browser dependencies.
- Scheduled and manual collection should share the same persisted pipeline.
- Matrix collection uploads artifacts only; a single consolidation job commits and deploys.
- The project uses GitHub Actions as its CI backbone with private GitHub Pages for static deployment.
- Mobile and desktop profiles are first-class dimensions tracked separately; mobile is the dashboard default.
- Three throttled iterations (median strategy) per URL/profile stabilizes results vs. single samples.
- Concurrency must serialize overlapping runs repo-wide to prevent matrix-job commit races.
- Trend data (summary.json) is committed infinitely; detail + screenshots bounded to 14 days.
- Claude API secrets stay server-side in GitHub Actions; never exposed to the static frontend.
- Extract logic is a standalone Node script (decoupled from sitespeed plugin API), survives image upgrades.
- URLs, profiles, and collection schedule are driven by committed configuration (urls.json).
- On-demand workflows (run-now, ai-review) reuse the main collection and deployment pipeline.

### Team Collaboration Notes (2026-05-31)

- Onboarding complete. All 8 pipeline decisions documented in `.squad/decisions.md` awaiting consensus.
- 3 decisions ready for immediate alignment: concurrency (Option A), failure handling (Option B), deployment trigger (Option A).
- 1 action item: coordinate with QA on scheduled collection window (low-traffic time).
- Ready for Sprint 1: Await schema finalization from Livingston/Rusty, then scaffold collection dry-run.

## Issue #6 Survey: MVP Operating Inputs (2026-06-01)

Surveyed acceptance criteria against current repo state. Findings:

### ✅ Met or Decided

- **Artifact Retention:** 90-day raw artifacts + 14-day detail window decided and documented
- **MVP Constraints:** All confirmed (QA only, no login, no auth workarounds, committed URL list)
- **Profile Specs (draft):** Mobile 4g + Desktop cable decided; exact definition incomplete

### ⚠️ Partially Met (Needs Validation)

- **SpeedCurve Parity Settings:** Proposed 3 iterations / 4g-cable, marked as "match against SpeedCurve's current config" in brief — needs user verification
- **Desktop Profile:** Cable throttle decided; CPU throttle and target device not specified

### ❌ Not Started (User Input Required)

- **Daily Schedule:** ACTION ITEM — needs QA coordination for low-traffic window + timezone
- **Claude Model/Budget:** Deferred to Livingston; no selection made
- **~10 QA Pages:** No `urls.json` file; user must provide list of page IDs, labels, URLs, groups

### Decision Inbox

- Filed `.squad/decisions/inbox/basher-issue-6.md` with gap analysis + proposed safe defaults
- Awaits Diego's confirmation on schedule, throttle validation, page list, and Claude budget

### Handoff

- Ready to scaffold collection workflow once: (1) schedule confirmed, (2) page list provided, (3) throttle settings validated
- Livingston to wire Claude defaults once model/budget confirmed

---

## Issue #6 Survey: Parity & Retention Gap Analysis (2026-06-01)

Completed acceptance criteria survey. Outcome:

**Locked (2):** Artifact retention (90d), MVP constraints (QA-only, no auth).

**Assumed (2):** SpeedCurve parity (3 iter, 4g-cable), desktop profile (cable only, CPU unspecified).

**Missing (4):** Daily schedule, Claude model/budget, QA page list, exact desktop profile.

**Gap analysis:** `.squad/decisions/inbox/basher-issue-6.md` with safe defaults (urls.json template, workflow scaffold).

**Orchestration logged:** `.squad/orchestration-log/2026-06-01T01-25-57Z-basher-issue-6.md`

---

## Issue #6 Implementation: Operating Inputs Encoded (2026-06-01)

Implemented and committed the Issue #6 operating input defaults directly into repo workflow/config/docs.

### Implemented Defaults

- No direct SpeedCurve parity in MVP (explicitly disabled in config/workflow metadata)
- Desktop profile fixed to `cable` + viewport `1366x768`
- Daily run schedule fixed at `07:00 America/Los_Angeles` (UTC cron + LA-time gate)
- Workflow artifact retention fixed at `14 days`
- Seed QA catalog fixed to current 10-page committed `urls.json` (no invented URLs)

### Files Added/Updated

- `.github/workflows/collect.yml`
- `config/operating-inputs.json`
- `urls.json`
- `docs/01__operating-inputs.md`
- `.squad/decisions.md`

### Learnings

- To schedule a stable local-time run in GitHub Actions, dual UTC cron entries plus a timezone gate is the safest DST-compatible pattern.
- Encoding issue-level operating inputs in both workflow and machine-readable config prevents drift between docs and execution.
- Locking the seed URL catalog in a committed `urls.json` avoids accidental scope creep during early pipeline scaffold work.

---

## Issue #6 Batch Coordination: Operating Inputs (2026-06-01, 02:55:40Z)

**Status:** ✅ IMPLEMENTATION COMPLETE + VALIDATED

**Delivered:**

1. **Operating Input Defaults Locked:**
   - SpeedCurve parity disabled (`directParityInMvp=false`)
   - Desktop profile: 1366x768 on cable throttle, no CPU throttle
   - Daily schedule: 07:00 America/Los_Angeles (UTC-gated cron in workflow)
   - Artifact retention: 14 days for detail/screenshots (GitHub raw artifacts 90-day default)
   - Seed catalog: 10-page QA list in `urls.json` committed (no invented URLs)

2. **Configuration & Documentation:**
   - `config/operating-inputs.json` — Machine-readable operating input baseline
   - `.github/workflows/collect.yml` — Workflow with profile defs + cron schedule + artifact retention policy
   - `urls.json` — Committed QA catalog (immutable seed reference)
   - `docs/01__operating-inputs.md` — Reference guide explaining rationale for each default
   - Updated `README.md` + `docs/00__main-brief.md` with collection defaults

3. **Validation:**
   - ✅ `vp check` — All files formatted, no lint/type errors
   - ✅ `vp test` — 92 tests passed
   - ✅ `vp run -r build` — Build successful

**Coordination Notes:**

- Basher implemented config/workflow per merged user directives (6 decisions captured in inbox).
- Livingston simultaneously implemented AI defaults + guardrails (separate track, no conflicts).
- Rusty conducted implementation audit; identified 3 deferred items (desktop viewport confirmation, schedule HITL, model choice).
- Linus shipped design system unification in parallel (no blockers).

**Outstanding Issues (From Rusty Audit):**

- Desktop viewport (1366x768) is documented in code but could be more explicit as TypeScript constant
- Daily schedule (07:00 LA) confirmed in workflow but requires Diego HITL before full deployment
- No usage logging/dashboard for budget enforcement yet (Livingston to add)

**Next Steps:**

- Confirm desktop viewport lock is sufficiently explicit in code (consider exporting from `packages/utils/src/config.ts`)
- Await Diego's final confirmation on schedule (HITL already completed; just needs formal sign-off)
- Implement usage logging job for budget monitoring (Livingston follow-up)

**Orchestration Log:** `.squad/orchestration-log/2026-06-01T02:55:40Z-basher-issue-6-implement.md`

---

## Page Catalog Replacement: User Top Pages Locked (2026-06-01)

- Replaced `urls.json` with Diego-provided 10-page top-page catalog as single source of truth.
- Synchronized mirrored frontend fixture catalog (`apps/frontend/src/lib/data.ts`) to the same IDs, labels, groups, and URLs.
- Updated fixture diagnostics mappings (`apps/frontend/src/lib/detail.ts`, `apps/frontend/src/lib/detail.test.ts`) so pending/unavailable review state references only valid current page IDs.
- Updated mirrored catalog metadata/docs references (`config/operating-inputs.json`, `docs/01__operating-inputs.md`) to reflect top-page catalog wording.

### Learnings

- Catalog replacement must include fixture mirrors (not only `urls.json`) to avoid stale page IDs breaking tests and UI assumptions.
- Keeping review/no-screenshot fixture maps keyed to current catalog IDs prevents orphaned diagnostics states after URL-list swaps.

## Page Catalog Replacement (2026-06-01, 03:17:03Z)

Completed replacement of committed 10-page `urls.json` with user-provided top-page catalog as the single canonical source of truth.

**Action Taken:**

- Replaced `urls.json` with exact provided entries
- Synchronized frontend fixture catalog (`apps/frontend/src/lib/data.ts`) to same 10 entries
- Updated fixture diagnostic maps (`apps/frontend/src/lib/detail.ts`, `apps/frontend/src/lib/detail.test.ts`) to reference only valid current page IDs
- Updated metadata and docs references (`config/operating-inputs.json`, `docs/01__operating-inputs.md`)

**Validation:** ✅ `vp check`, ✅ `vp test` (92), ✅ `vp build`

**Key Learning:** Catalog replacement must include all mirrors (fixture catalog, diagnostic maps, metadata) to prevent stale page ID references breaking tests and UI assumptions.

**Decision Merged:** `.squad/decisions.md` locked this decision as single source of truth.
