# Project Context

- **Owner:** Diego Avalon
- **Project:** pulse
- **Description:** Self-hosted eHealth/Pulse-branded performance dashboard replacing SpeedCurve-style reporting with sitespeed.io collection, static SvelteKit presentation, and on-demand Claude AI reviews.
- **Stack:** SvelteKit, adapter-static, Tailwind tokens, Chart.js, GitHub Actions, private GitHub Pages, sitespeed.io Docker, Node extraction scripts, Claude API.
- **Created:** 2026-05-31
- **Seed references:** `docs/00__main-brief.md`, `diegoavalon/pulse#1`

## Learnings

### Data Extraction & Contracts

- Unit tests must cover the Node extraction script independently of sitespeed Docker runs. The script reads `browsertime.json` (iterations, timings, cdp), HAR (per-iteration requests), and screenshots → outputs `summary.json` (committed) + `detail.json` (14-day bounded).
- Test fixtures must include multi-iteration runs (3 iterations, median selected) to validate iteration handling without full browser collection.
- `summary.json` must include explicit units in all numeric fields: ms for LCP/CLS/TBT/FCP/TTFB, bytes for transfer totals, unitless for CLS/coach score. Test that a threshold check on CLS ≤ 0.25 produces "poor" when value is 0.77 (real data from brief).
- Sitespeed version (v41.2.0) and runId (ISO timestamp) must be captured in every summary record for auditability.

### Threshold Correctness (Google CWV Standard)

- LCP: ≤2.5s = Good, ≤4.0s = Needs Work, >4.0s = Poor. Test that LCP 1540ms classifies as Good.
- CLS: ≤0.1 = Good, ≤0.25 = Needs Work, >0.25 = Poor. Test that CLS 0.77 classifies as Poor (validates detection of real issue from brief).
- TBT (headline interactivity proxy, INP deferred to Phase 2): ≤200ms = Good, ≤600ms = Needs Work, >600ms = Poor.
- FCP: ≤1.8s = Good, ≤3.0s = Needs Work, >3.0s = Poor.
- TTFB: ≤800ms = Good, ≤1.8s = Needs Work, >1.8s = Poor.
- INP must be explicitly null or marked unavailable in MVP; never present as a metric (Phase 2 requires RUM for real measurement).
- Threshold function must be unit-agnostic and testable in isolation: `classify(metric, thresholds) → "good" | "needs-work" | "poor"`.

### Profile Isolation (Mobile ≠ Desktop)

- Mobile (4g throttle, 3 iterations) and desktop (cable throttle, 3 iterations) produce non-comparable series. Tests must verify that profiles are never mixed.
- Data layout: `data/<page-id>/<profile>/` where profile ∈ {mobile, desktop}. Test that a query for page "homepage" returns only mobile results when profile="mobile" is explicitly requested.
- Charts and trend lines must show separate lines per profile; UI defaults to mobile view but desktop must be accessible.
- Extraction must parse each profile from the matrix job artifact separately; validate that mobile screenshots ≠ desktop screenshots for same URL.

### Retention Behavior

- Summary records committed to git → infinite retention. Test that querying 100 runs back returns all 100 records.
- Detail.json and screenshots → GitHub Actions artifact → baked into site at build time → manually pruned to last 14 days during consolidation job. Test that `prune_old_details(14_days)` removes runs older than cutoff, summary record remains.
- Pages with no detail records fall back to summary-only view. Test UI graceful degradation when detail missing but summary present.

### Workflow Safety (Race Prevention)

- Matrix jobs (mobile, desktop) upload artifacts only; they must not commit. Tests must verify all job outputs are uploaded, not written to git.
- Single downstream consolidation job downloads both artifacts and performs the only commit. Test that a second consolidate job waiting on collect cannot clobber the first commit.
- Workflow `concurrency` group serializes overlapping runs (e.g., scheduled + manual dispatch). Test that a manually triggered run does not interrupt a scheduled run mid-commit.

### AI Secret Handling

- Claude API key stored as GitHub Actions secret, never baked into frontend code or committed to repo.
- AI review workflow (`workflow_dispatch` trigger) executes the Claude API call server-side, commits markdown review to `data/<page-id>/<profile>/reviews/<timestamp>.md`.
- Test that review markdown never contains API key, auth token, or internal URLs in clear text (should use placeholder or redacted versions).
- Frontend must have no env var exports that could leak secrets; test that `process.env` is not referenced in client-side code.

### One-Off Runs & Persistence

- Manual runs triggered via `workflow_dispatch` over a subset (or all) tracked pages must use the same collection + extraction + consolidation pipeline.
- Test that a one-off run result is persisted to the same `summary.json` history as scheduled runs (same timestamp key, same profile folder structure).
- One-off runs should allow selecting a subset of pages; test that a run with only homepage still correctly joins the full trend history.

### Data Integrity & Auditability

- Each summary record must be a valid JSON object with all required fields (id, label, url, profile, timestamp, cwv, coachScore, transfer, requests, thirdPartyRequests, sitespeedVersion, runId).
- Test JSON schema validation: missing any required field → extraction fails loudly, not silently.
- Timestamp format must be ISO 8601 UTC (e.g., 2026-05-29T13:41:03Z) and sortable. Test that summary records sort chronologically.
- Third-party request count must be ≤ total requests; test invalid data is rejected.

### Scorecard / UI Correctness

- Scorecard groups pages by `group` field from urls.json and shows per-group status (green/yellow/red overall).
- Test that a single "poor" metric on any page in a group marks the group as poor, even if other pages are good.
- Mobile defaults to display; desktop accessible via toggle. Test that toggling changes all chart data and scorecard states.

### INP Handling (Deferred, Phase 2)

- MVP summary records must have `"INP": null` (not omitted, not 0, not a dummy value).
- UI must display "INP requires RUM (Phase 2)" or similar message, not "INP: N/A" or blank space that confuses stakeholders.
- Test that a Phase 2 migration adding real INP data does not break MVP UI or break backward-compatibility queries against MVP summary files.

### Team Collaboration Notes (2026-05-31)

- Onboarding complete. All 10 testing decisions + 9 gating criteria documented in `.squad/decisions.md` awaiting team consensus.
- Ready to review extraction code against gating criteria; will block PRs that skip testing, hardcode thresholds without audit, leak secrets, or allow profile mixing.
- Sprint 1: Work with Livingston/Basher to establish extraction test fixtures; prepare unit test structure in `packages/extract/tests/`.
