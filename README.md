# Vite+ Monorepo Starter

A starter for creating a Vite+ monorepo.

## Performance collection and Pages deployment

`collect.yml` now runs the full pipeline: collect raw sitespeed artifacts, consolidate into committed `data/`, then build and deploy the static dashboard to GitHub Pages from that same consolidated commit.

### Manual run

```bash
gh workflow run collect.yml -R diegoavalon/pulse -f page_id=homepage
```

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
