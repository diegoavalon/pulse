# Vite+ Monorepo Starter

A starter for creating a Vite+ monorepo.

## Performance collection and Pages deployment

`collect.yml` now runs the full pipeline: collect raw sitespeed artifacts, consolidate into committed `data/`, then build and deploy the static dashboard to GitHub Pages from that same consolidated commit.

### What the workflow does (for presentations)

`Pulse Collect` has 3 jobs:

1. **collect**: runs sitespeed for both profiles (`mobile` + `desktop`) and uploads raw artifacts.
2. **consolidate**: extracts/normalizes artifacts into `data/`, validates with `vp check`, `vp test`, and `vp run -r build`, then commits `data/` updates.
3. **deploy**: checks out that consolidated commit, builds the frontend with `BASE_PATH=/${repo-name}`, and deploys `apps/frontend/build` to GitHub Pages.

This means the live dashboard always reflects the same consolidated data commit that passed validation.

### Trigger manually from GitHub (UI)

1. Open **Actions** in this repository.
2. Select **Pulse Collect**.
3. Click **Run workflow**.
4. Choose a branch (typically `main`).
5. Optional inputs:
   - `page_id`: blank = all pages, or set one id from `urls.json` (example: `homepage`)
   - `run_id`: optional override (`YYYY-MM-DDTHH-MM-SS`)
6. Click **Run workflow**.

### Trigger manually from terminal (GitHub CLI)

```bash
# all pages (default when page_id is omitted)
gh workflow run "Pulse Collect" --ref main

# single page
gh workflow run "Pulse Collect" --ref main -f page_id=homepage

# single page with explicit run id
gh workflow run "Pulse Collect" --ref main -f page_id=homepage -f run_id=2026-06-01T11-30-00

# monitor runs
gh run list --workflow "Pulse Collect" --limit 5
gh run watch
```

### Will it collect performance for all pages?

Yes—when `page_id` is blank, the workflow collects for every page listed in `urls.json`, for both `mobile` and `desktop`.

If `page_id` is set, only that one page is collected.

### Run the collect pipeline locally (workflow-equivalent)

This runs the same core flow as `collect.yml`: collect raw artifacts → consolidate to `data/` → validate/build.

1. Install dependencies:

```bash
vp install
```

2. Set one `RUN_ID` and collect artifacts for both profiles (single page example):

```bash
RUN_ID="$(date -u +%Y-%m-%dT%H-%M-%S)"
PROFILE=mobile THROTTLE=4g VIEWPORT=390x844 ITERATIONS=3 PAGE_ID=homepage RUN_ID="$RUN_ID" node scripts/collect-sitespeed.mjs
PROFILE=desktop THROTTLE=cable VIEWPORT=1366x768 ITERATIONS=3 PAGE_ID=homepage RUN_ID="$RUN_ID" node scripts/collect-sitespeed.mjs
```

To collect all pages, omit `PAGE_ID`.

3. Build extractor packages and consolidate into committed dashboard data:

```bash
vp run utils#build
vp run extractor#build
node scripts/consolidate-sitespeed.mjs artifacts data
```

4. Run the same validation/build gates used in CI:

```bash
vp check
vp test
vp run -r build
```

### Verify local data connection and reflected output

Use these checks after consolidation to confirm why a page might be missing in detail views:

```bash
# Warnings from extraction (unknown page id, malformed input, missing files, etc.)
cat data/_extract-warnings.log

# Confirm detail artifacts were generated for the run
find data -path "*/$RUN_ID/detail.json"
```

Optional full coverage check (all ids in `urls.json` for both `mobile` and `desktop`):

```bash
node --input-type=module -e '
import fs from "node:fs/promises";
const urls = JSON.parse(await fs.readFile("urls.json", "utf8"));
const missing = [];
for (const { id } of urls) {
  for (const profile of ["mobile", "desktop"]) {
    try {
      const summary = JSON.parse(await fs.readFile(`data/${id}/${profile}/summary.json`, "utf8"));
      if (!summary.some((r) => r.runId === process.env.RUN_ID)) missing.push(`${id}/${profile}`);
    } catch {
      missing.push(`${id}/${profile}`);
    }
  }
}
console.log(missing.length ? `MISSING\\n${missing.join("\\n")}` : "OK: all pages/profiles have this RUN_ID");
'
```

If files are present under `data/<pageId>/<profile>/<runId>/detail.json`, the extraction side is working; missing page details then usually point to missing/partial raw artifacts for that page/profile pair.

### Required repository settings

1. **Settings → Pages → Build and deployment:** set **Source** to **GitHub Actions**.
2. **Settings → Actions → General → Workflow permissions:** allow **Read and write permissions** so the consolidate job can commit `data/`.
3. Keep the `collect.yml` job permissions intact (`contents: write` for consolidation, `pages: write` + `id-token: write` for deployment) for private GitHub Enterprise Pages compatibility.

## AI review MVP defaults

- Default model: `claude-haiku-4.5`
- Monthly budget ceiling: `$50`
- Guardrail script: `node scripts/ai-review-budget-guardrail.mjs`
- Workflow entrypoint: `.github/workflows/ai-review.yml` (`workflow_dispatch`)

## Development

- Check everything is ready:

```bash
vp run ready
```

- Run the tests:

```bash
vp run -r test
```

- Build the monorepo:

```bash
vp run -r build
```

- Run the development server:

```bash
vp run dev
```
