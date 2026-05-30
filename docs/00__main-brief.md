## Problem — [confirmed]

The company pays for **SpeedCurve.com** to automate Google Web Vital reports across a

list of tracked pages. We want a **self-hosted, open-source alternative** we own

end-to-end: no SaaS lock-in, no per-page billing, full control over UI and data. The

collection engine (sitespeed.io) already produces excellent data and diagnostics — what we

don't want is its default UI. We want our own **strictly eHealth-branded** wrapper around

the same pipeline.

**Why now:** sitespeed.io is proven locally (v41.2.0). The data quality is established;

this brief locks the presentation + scheduling + AI architecture before building.

## Users — [confirmed]

Three audiences → UI uses **layered detail** (scorecard on top, diagnostics underneath):

- **Front-end / theme developers** (primary) — fix the issues. Want waterfalls,

render-blocking, coach advice, full-detail view, and the AI fix recommendations. \*\*The

AI review's audience is developers.\*\*

- **Eng leads / managers** (primary) — trends over time, regressions, is the team

improving. Trend charts.

- **Marketing / product** (secondary) — non-technical. Want a simple green/yellow/red

"are our key pages fast" scorecard.

## Success criteria — [confirmed]

- Scheduled (daily) checks **and** one-off runs on a list of pages, without SpeedCurve.

- Web Vitals visible in a **strictly branded** dashboard, with history/trend over time,

for **both mobile and desktop**.

- Developers can get an **on-demand, theme-aware AI review** of fix opportunities per page.

- No SaaS dependency for the core loop; report is static and cheap to host.

- Eventually reduce/retire reliance on the paid SpeedCurve subscription.

## Scope — [confirmed]

**In (MVP):**

- New standalone **`ehi-perf-dashboard`** GitHub repo (private, GitHub Enterprise).

- **GitHub Actions** for collection (scheduled + manual) and **private GitHub Pages** for hosting.

- ~**10 tracked pages**, defined in a committed `urls.json`.

- **Both mobile + desktop** profiles, mobile prioritized; **3 iterations**, **throttled** connectivity.

- **Two-tier data**: lean committed `summary.json` (trends) + baked `detail.json` + screenshots (full-detail view).

- **SvelteKit** static frontend (`adapter-static`), **eHealth-branded** per a provided `DESIGN.md`, Tailwind tokens, **Chart.js** (`onMount`) for charts. No React dependency.

- **On-demand, theme-aware AI review** via Claude API, triggered by `workflow_dispatch`, committed as markdown.

- **One-off runs** over existing tracked pages (persisted to trends).

**Explicitly out (deferred to later phases):**

- **RUM / real-user field data** (web-vitals beacons) — Phase 2. _Consequence: see INP below._

- **INP as a real metric** — not synthetically measurable; deferred to the RUM phase. TBT is the lab proxy.

- **Production public pages** — Phase 2 (MVP tracks QA only).

- **Arbitrary-URL ad-hoc testing** (ephemeral, non-persisted) — fast-follow after MVP.

- **AI review on every run / regression alerting** — on-demand only for MVP.

- **Grafana / time-series DB** — rejected (pulls UI away from branded goal).

- **Custom sitespeed plugin** — reversed in favor of a post-run extraction script (see decision #11).

- **S3 for raw artifacts** — deferred; MVP uses GitHub Actions artifacts.

## Constraints — [confirmed unless noted]

- **Repo:** standalone `ehi-perf-dashboard`. The theme repo's Jenkins/EKS/Helm/CodeArtifact

infra is **explicitly disregarded** — do not reuse it.

- **CI/Hosting:** GitHub Actions (scheduled + `workflow_dispatch`) + **private GitHub Pages**

(org is on GitHub Enterprise, so private Pages is available).

- **Access/sensitivity:** MVP tracks **QA** pages; private Pages restricts to org members.

Data layer must never embed secrets so a host change stays cheap. \*\*No tracked page is

behind login/auth\*\* — collection needs no cookies/basic-auth/headless workarounds.

- **Collection runtime:** official **`sitespeedio/sitespeed.io` Docker image** run as a

`docker run` step on `ubuntu-latest`. This avoids the local pnpm-chromedriver postinstall

bug entirely and provides Chrome + `tc` throttling out of the box.

- **Measurement:** 3 iterations (median), **throttled `4g`** as primary (mobile priority);

desktop uses a faster profile (e.g. `cable`). Throttling makes results runner-independent

and comparable day-over-day. _[Match against SpeedCurve's current config — see open Q.]_

- **Data store:** **git-committed `summary.json`** (infinite trend history, ~1KB/run, MB/year).

Raw run output → **GitHub Actions artifacts** (archival backstop, default 90-day expiry).

- **AI:** Claude API (in-house `claude-api` skill). Key stored as a **GitHub Actions secret**,

never client-side. On-demand only (cost control).

- **Branding:** a user-provided **`DESIGN.md`** is the strict source of truth. \*\*No generic

theme.** Tokens consumed via **Tailwind\*\* in SvelteKit components. _[Input pending.]_

- **Frontend stack:** SvelteKit (`adapter-static`) + Tailwind tokens + **Chart.js** for charts.

No React in the dependency tree. Charts initialize via `onMount` against a `<canvas>` element.

## Key decisions made (with rationale)

| # | Decision | Rationale | Status |

| --- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |

| 1 | **Standalone `ehi-perf-dashboard` repo** | Theme repo is the _subject_ of monitoring, not its host. Clean separation; perf data doesn't bloat theme git or trigger theme CI. | [confirmed] |

| 2 | **GitHub Actions + private GitHub Pages** | Per explicit direction; disregard theme repo's Jenkins/EKS. Org on Enterprise → private Pages available. | [confirmed] |

| 3 | **Private repo + private Pages** | QA insurance pages, screenshots, internal URLs must not be public. Private Pages covers the three internal audiences. | [confirmed] |

| 4 | **`urls.json` of `{id, label, url, group}` objects** | Stable `id` → history folder key + dashboard route; `label` for UI; `group` for scorecard clustering. Avoids painful migration to per-page config. | [confirmed] |

| 5 | **~10 pages, serial collection** | Comfortably within an Actions job; mobile/desktop parallelized as matrix instead. | [confirmed] |

| 6 | **3 iterations, throttled connectivity** | Single sample is noise (CLS bounced 0.76–0.77 in tests); median of 3 stabilizes. Throttle makes runner-independent + SpeedCurve-comparable. | [confirmed] |

| 7 | **Mobile + desktop as a first-class dimension** | Two non-comparable series. Form factor is a **path-level key**: `data/<id>/<profile>/<ts>.json`. UI defaults to **mobile**. 2-way Actions matrix. | [confirmed] |

| 8 | **Two-tier data schema** | Tier 1 lean `summary.json` (committed → trends, git-friendly). Tier 2 rich `detail.json` + screenshots. Avoids bloating git / slowing Astro glob. | [confirmed] |

| 9 | **Full-detail baked into the published site by the collection job** | Static Astro can't read Actions artifacts at build time; the job that _has_ the raw data extracts `detail.json` + copies screenshots into the build. Raw originals → artifacts as backstop. | [confirmed] |

| 10 | **Retention split:** trends infinite, full-detail **last 14 days** | Summary is tiny → keep forever. Detail (esp. ~600KB screenshots, ~12MB/day) would grow the site unbounded → bound to a 14-day window; older runs fall back to summary. | [confirmed] |

| 11 | **Docker image + post-run Node extraction script (NOT a custom plugin)** | `browsertime.json` + HAR already contain full depth (renderBlocking, cdp, timings, per-iteration). A standalone script is decoupled from the plugin API, survives image upgrades, runs identically local/CI, unit-testable. Docker kills the chromedriver problem. | [confirmed — reverses earlier plugin decision] |

| 12 | **On-demand AI review = `workflow_dispatch`, theme-aware, per page/profile, committed as markdown** | Static Pages has no backend; key must stay server-side. Review → `data/<id>/<profile>/reviews/<ts>.md`, versioned + diffable. Theme-aware (WP/WC, known header CLS) is the differentiator over generic Lighthouse text. | [confirmed] |

| 13 | **One-off runs = `workflow_dispatch` over existing tracked pages, persisted** | Reuses the full pipeline for a chosen subset; results join trends like a scheduled run. Arbitrary-URL ephemeral testing deferred (different mode: throwaway, non-committed). | [confirmed] |

| 14 | **Single workflow: parallel-collect → single consolidate-commit → build+deploy** | Parallel matrix jobs only _upload_ artifacts; one downstream job does the _only_ commit (atomic, no race/clobber); build+deploy in same job → no trigger-chain rebuild loop. Repo-wide `concurrency` group serializes overlapping runs. | [confirmed] |

| 15 | **Standard Google CWV thresholds; TBT as headline interactivity; INP deferred** | Industry standard, matches SpeedCurve language. INP needs real interaction (RUM) → can't measure synthetically; show TBT as lab proxy, INP labeled "requires RUM — Phase 2" to avoid misleading stakeholders. | [confirmed] |

| 16 | **Strict eHealth branding via provided `DESIGN.md`; Tailwind tokens; Astro-native** | Branding is the project's reason for existing. No generic theme. Tokens via Tailwind keep it lightweight + on-brand. | [confirmed] |

| 17 | **Charts = Chart.js via `onMount` in SvelteKit components** | Canvas-based, zero-framework — no React in the tree at all. Simple trend lines and bar breakdowns are exactly the use case Chart.js excels at. Svelte's `onMount` handles the canvas lifecycle cleanly. Token-styled via CSS custom properties on the Chart.js config object. | [confirmed] |

## MVP pipeline (end-to-end)

```

GitHub Actions — scheduled (daily) workflow, concurrency-guarded

│

├─ job: collect (matrix: mobile | desktop) ← COLLECTION ONLY, parallel

│ docker run sitespeedio/sitespeed.io <urls> --3 iterations --throttle 4g/cable

│ → raw browsertime.json + HAR + screenshots

│ → node extract.mjs → summary.json + detail.json + screenshots

│ → UPLOADS artifacts only (no commit)

│

└─ job: consolidate (needs: collect) ← single atomic commit + deploy

→ downloads both matrix artifacts

→ ONE commit of all data to repo

→ vite build (SvelteKit adapter-static) → deploy to private GitHub Pages



workflow_dispatch: "Run Check Now" → one-off over tracked pages (same pipeline, persisted)

workflow_dispatch: "Run AI Review" → reads detail.json → Claude API (theme-aware)

→ commits review .md → rebuild



Roles: Docker = collect | Node script = shape | SvelteKit = present

```

## Data layout

```

ehi-perf-dashboard/

├── urls.json # [{id,label,url,group}] × ~10

├── DESIGN.md # strict branding source of truth (user-provided)

├── data/

│ └── <page-id>/

│ └── <profile>/ # mobile | desktop

│ ├── <timestamp>.json # Tier 1 summary (committed, infinite)

│ └── reviews/<timestamp>.md # AI review output (committed)

├── extract.mjs # raw sitespeed output → summary + detail

├── site/ # SvelteKit app (adapter-static, Tailwind tokens, Chart.js)

└── .github/workflows/ # scheduled + run-now + ai-review

```

Tier-1 `summary.json` record (units explicit — ms / bytes / unitless):

```json
{
  "id": "homepage",

  "label": "Homepage",

  "url": "https://www.qa.ehealthinsurance.com/",

  "profile": "mobile",

  "timestamp": "2026-05-29T13:41:03Z",

  "iterations": 3,

  "cwv": { "LCP": 1540, "CLS": 0.7694, "INP": null, "TBT": 8, "FCP": 1264, "TTFB": 888 },

  "coachScore": 72,

  "transfer": { "total": 2300000, "js": 900000, "css": 120000, "image": 800000 },

  "requests": 101,

  "thirdPartyRequests": 34,

  "sitespeedVersion": "41.2.0",

  "runId": "2026-05-29T13-41-03"
}
```

## Scorecard thresholds (Google CWV standard)

| Metric | Good | Needs improvement | Poor |

| ------------------------------------------- | ------- | ----------------- | ------- |

| LCP | ≤ 2.5s | ≤ 4.0s | > 4.0s |

| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |

| INP _(Phase 2 / RUM)_ | ≤ 200ms | ≤ 500ms | > 500ms |

| **TBT** _(lab proxy for INP, MVP headline)_ | ≤ 200ms | ≤ 600ms | > 600ms |

| FCP | ≤ 1.8s | ≤ 3.0s | > 3.0s |

| TTFB | ≤ 800ms | ≤ 1.8s | > 1.8s |

> Validation signal: the homepage's measured **CLS ≈ 0.77 is deep in "poor"** — the

> scorecard surfaces a real, actionable problem on day one.

## Open questions / pending inputs — [for build phase]

These are inputs and lookups, not unresolved design decisions:

1. **`DESIGN.md`** — user to provide; hard dependency before real UI scaffolding. (Token

structure, color system, typography, components.)

2. **SpeedCurve's current config** — look up its iteration count + connectivity profile to

match for apples-to-apples (we default to 3 iterations / 4g-mobile + cable-desktop).

3. **Exact desktop profile** — confirm `cable` + no/low CPU throttle vs. a specific device.

4. **The initial 10 URLs** — homepage + which key flows? (IDs, labels, groups.)

5. **Claude API budget ceiling** for on-demand reviews + which model.

6. **Artifact retention** — keep Actions artifacts at 90 days or shorter; revisit S3 in Phase 2.

7. **Schedule time** — what hour/timezone for the daily run (low-traffic window for QA).

## Phasing

- **MVP:** everything in "Scope → In" above — QA pages, mobile+desktop, trends, full-detail

(14-day), on-demand theme-aware AI review, one-off re-runs, strict branding.

- **Phase 2:** production public pages; RUM (real INP); arbitrary-URL ephemeral testing;

consider S3 for raw artifacts; possible regression alerting (Slack/Jira).
