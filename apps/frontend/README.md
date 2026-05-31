# Pulse frontend

Static SvelteKit dashboard shell for the eHealth/Pulse performance reporting UI. The app is built with `adapter-static`, Svelte 5, Tailwind v4 tokens, and no React or backend runtime dependency.

## Design direction

The first route implements the issue #2 shell from the design handoff: warm cream canvas, white editorial cards, rounded/pill controls, olive primary branding, and sparse lime accents. It intentionally shows an empty data state until the collection pipeline commits `summary.json`.

## Vite+ validation

Run from the repository root:

```bash
vp check
vp test
vp run -r build
```

For local frontend iteration:

```bash
vp run frontend#dev
```
