# Project Context

- **Owner:** Diego Avalon
- **Project:** pulse
- **Description:** Self-hosted eHealth/Pulse-branded performance dashboard replacing SpeedCurve-style reporting with sitespeed.io collection, static SvelteKit presentation, and on-demand Claude AI reviews.
- **Stack:** SvelteKit, adapter-static, Tailwind tokens, Chart.js, GitHub Actions, private GitHub Pages, sitespeed.io Docker, Node extraction scripts, Claude API.
- **Created:** 2026-05-31
- **Seed references:** `docs/00__main-brief.md`, `diegoavalon/pulse#1`

## Learnings

- MVP must keep the core loop SaaS-free: GitHub Actions collects, Node shapes data, SvelteKit presents, private GitHub Pages hosts.
- Mobile and desktop are first-class profile dimensions; mobile is the default UI perspective.
- INP is deferred to RUM; TBT is the MVP lab proxy.
- **Monorepo structure:** pnpm workspaces with `apps/frontend` (SvelteKit + Tailwind + Chart.js), `packages/utils` (lightweight shared lib), `tools/` placeholder. Using Vite+ toolchain (vp CLI) for dev/build/lint/test.
- **Frontend scaffold exists:** `apps/frontend` is Svelte 5 + SvelteKit 2, pre-configured with adapter-static, Tailwind 4, TypeScript. Baseline pages exist (`+page.svelte`, `+layout.svelte`) but contain placeholder content.
- **DESIGN.md is committed:** Brand-defining system doc specifies editorial/calm aesthetic (warm cream `#f7f7f2`, olive-green accent `#5b6f00`, serif+sans typography). This is the strict source of truth for theming.
- **Data schema deferred to collection phase:** `urls.json`, `summary.json` (Tier-1 trend data), `detail.json` + screenshots (Tier-2, 14-day retention) are not yet populated. Collection job (Docker + extraction) and data commit workflow are pre-planned but not yet wired.
- **Entry point TBD:** No routes exist yet beyond placeholder. Critical path requires: (1) data source for dashboard (urls.json + summary.json structure validation), (2) Tailwind token consumption from DESIGN.md, (3) scorecard/chart components, (4) trending + profile selection UI, (5) detail view + AI review UI.
- **Scope boundaries:** MVP tracks ~10 QA pages (no auth, no arbitrary URLs). Collection is `workflow_dispatch` + daily cron via GitHub Actions matrix (mobile|desktop parallel). AI review is on-demand `workflow_dispatch`, theme-aware, committed as markdown per page/profile.
- **First-principles validation signal:** CLS ≈ 0.77 on homepage will surface immediately on day one as deep "poor" — validates that the pipeline detects real, actionable problems.

## Team Onboarding (2026-05-31)

**Completed:** Rusty, Linus, Basher, Livingston, Yen got acquainted with brief, issue #1, and codebase. All 35+ pending decisions documented in `.squad/decisions.md` for team consensus. Orchestration logs and session log created. Ready for Sprint 1 kickoff.

## Issue #6 Audit: MVP Operating Inputs (2026-06-01)

**Locked:** Artifact retention (90 days), detail/screenshot retention (14-day rolling).

**Assumed (pending verification):** 3 iterations, 4g mobile throttle, cable desktop throttle, no desktop CPU throttle.

**Missing (HITL required):**

1. Initial QA URL catalog (~10 pages with IDs, labels, URLs, groups)
2. SpeedCurve parity verification (iterations, mobile/desktop throttles, CPU throttle)
3. Daily run schedule (hour in UTC + timezone context)
4. Claude API model choice (recommend Sonnet)
5. Claude API budget ceiling (per-review or monthly)

**Decision artifact:** `.squad/decisions/inbox/rusty-issue-6.md` with 5 ordered HITL prompts ready for Diego.

**Next:** Await Diego's responses on prompts 1–5, verify SpeedCurve config, lock values in project config.

**Impact:** Unblocks Sprint 3 collection pipeline once confirmed.

---

## Issue #6 Audit & HITL Facilitation (2026-06-01)

Completed 5-prompt audit of Issue #6 acceptance criteria. Outcome:

**Locked (2):** Artifact retention (90d), detail/screenshot retention (14d rolling).

**Assumed (4):** Iterations (3), mobile throttle (4g), desktop throttle (cable), CPU throttle (none).

**Missing HITL (4):** URL catalog, SpeedCurve parity, daily schedule, Claude model/budget.

**Decision artifact:** `.squad/decisions/inbox/rusty-issue-6.md` with structured HITL prompts 1–5.

**Orchestration logged:** `.squad/orchestration-log/2026-06-01T01-25-57Z-rusty-issue-6.md`
