# Project Context

- **Owner:** Diego Avalon
- **Project:** pulse
- **Description:** Self-hosted eHealth/Pulse-branded performance dashboard replacing SpeedCurve-style reporting with sitespeed.io collection, static SvelteKit presentation, and on-demand Claude AI reviews.
- **Stack:** SvelteKit, adapter-static, Tailwind tokens, Chart.js, GitHub Actions, private GitHub Pages, sitespeed.io Docker, Node extraction scripts, Claude API.
- **Created:** 2026-05-31
- **Seed references:** `docs/00__main-brief.md`, `diegoavalon/pulse#1`

## Core Context

**Data Contract (Issue #5):** `SummaryRecord` interface in `packages/utils/src/summary.ts` defines Tier 1 schema (id, label, url, profile, timestamp, iterations=3, cwv, coachScore, transfer, requests, thirdPartyRequests, sitespeedVersion, runId). `PageHistory` maintains independent mobile/desktop time-series (chronological, oldest first). `TrendCatalog` indexes by page ID. Units explicit in field names; no wrapping objects. Profile isolation enforced. CWV: LCP (ms), CLS (unitless), TBT (ms), INP (null→Phase 2 RUM). 46 threshold tests pass (all CWV boundaries). `extractMetricSeries`/`extractScoreSeries` ready for Chart.js. Frontend accepts test suite (21 tests) validates profile isolation + schema.

**AI Review Architecture:** On-demand (workflow_dispatch) only; theme-aware (WP sticky header, WC checkout modals); input: detail.json + HAR + render-blocking; output: markdown per page/profile/timestamp; Claude API server-side (GitHub Actions secret); developer audience (technical, action-oriented).

**Issue #6 Implementation:** Model pinned to claude-haiku-4.5 in `config/ai-review-defaults.json`. Budget ceiling: $50/month. Guardrail script `scripts/ai-review-budget-guardrail.mjs` enforces; blocks reviews when projected spend > $50. Workflow `.github/workflows/ai-review.yml` wired with guardrail. Outstanding: usage logging/dashboard, prompt template, model choice clarification (haiku vs. sonnet).

---

## Recent Work

### Issue #6 Batch Coordination: AI Defaults & Guardrails (2026-06-01, 02:55:40Z)

**Status:** ✅ IMPLEMENTATION COMPLETE + VALIDATED

**Delivered:**

1. **AI Defaults & Guardrails Locked:**
   - Default model: `claude-haiku-4.5` (cost-first for MVP on-demand reviews)
   - Budget ceiling: $50/month (enforced by guardrail script)
   - Enforcement: `scripts/ai-review-budget-guardrail.mjs` blocks reviews when projected spend > $50
   - Workflow integration: `.github/workflows/ai-review.yml` enforces defaults and guardrail on dispatch

2. **Configuration & Documentation:**
   - `config/ai-review-defaults.json` — Machine-readable AI defaults + budget ceiling
   - `scripts/ai-review-budget-guardrail.mjs` — Guardrail enforcement script (cost estimation + spend projection)
   - `.github/workflows/ai-review.yml` — Dispatch workflow with guardrail validation step
   - Updated `README.md` + `docs/00__main-brief.md` with AI guardrail documentation

3. **Validation:**
   - ✅ `vp check` — All files formatted, no lint/type errors
   - ✅ `vp test` — 92 tests passed
   - ✅ `vp run -r build` — Build successful

**Coordination Notes:**

- Livingston implemented AI defaults + guardrails per merged user directives (2 decisions from inbox).
- Basher simultaneously implemented collection workflow operating inputs (separate track, no conflicts).
- Rusty conducted implementation audit; identified 1 model choice discrepancy (haiku accepted but sonnet recommended for quality tradeoff).
- Design system unification shipped in parallel (Linus, no blockers).

**Outstanding Issues (From Rusty Audit):**

- Model choice ambiguity: Acceptance criteria specifies claude-haiku-4.5, but recommendation in early analysis suggests claude-3.5-sonnet for quality/cost balance
  - Haiku: ~$0.0005–0.001 USD/call, ~500+ reviews/month at $50 budget
  - Sonnet: ~$0.003–0.015 USD/call, ~165 reviews/month at $50 budget
- No usage logging/dashboard for budget monitoring yet (implementation blockers: token counting via Anthropic API, monthly spend dashboard not yet wired)
- Prompt template ("Quick Wins"/"Deep Dives"/"Blockers") not yet drafted (design deferred to next session)

**Next Steps:**

- Clarify AI model choice with Diego (haiku vs. sonnet); adjust cost estimates accordingly
- Implement usage logging job for budget monitoring (add GitHub Actions step to log token counts)
- Draft review prompt template with theme context injection (WP/WC knowledge + eHealth branding)

**Orchestration Log:** `.squad/orchestration-log/2026-06-01T02:55:40Z-livingston-issue-6-implement.md`
