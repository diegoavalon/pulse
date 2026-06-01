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
