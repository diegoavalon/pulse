# Vite+ Monorepo Starter

A starter for creating a Vite+ monorepo.

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
