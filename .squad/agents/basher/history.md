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
