# Tailwind v4 Integration — Summary

**Date:** 2025-01-XX  
**Author:** Linus (Frontend Dev)  
**Status:** ✅ Complete

---

## What Was Done

### 1. Created Tailwind v4 `@theme` Configuration

**File:** `apps/frontend/src/routes/theme.css`

- Exposes all pulse-dashboard CSS variables to Tailwind utilities
- Uses `var()` references to maintain single source of truth
- No duplication — pulse-dashboard.css manages light/dark themes

### 2. Hybrid System Architecture

The system allows TWO approaches to coexist:

**A. Legacy Pulse Classes** (keep using these)

```svelte
<div class="pd" data-theme="light">
  <nav class="pnav">...</nav>
  <div class="hero">...</div>
  <button class="btn primary">Click</button>
</div>
```

**B. Tailwind Utilities** (use for new components)

```svelte
<div class="pd" data-theme="light">
  <div class="bg-surface border border-border rounded-lg p-6 shadow-md">
    <h2 class="text-ink font-display text-2xl font-bold">Title</h2>
    <p class="text-muted text-sm">Description</p>
  </div>
</div>
```

### 3. Documentation

**Created:**

- `TAILWIND-HYBRID.md` — Complete guide to the hybrid system
- `tailwind-demo/+page.svelte` — Live examples of both approaches

---

## How It Works

```
┌─────────────────────────────────────────┐
│  pulse-dashboard.css                    │
│  (Source of Truth)                      │
│                                         │
│  .pd {                                  │
│    --bg: #fff;                          │
│    --ink: #292929;                      │
│    --accent: #4dcb2a;                   │
│  }                                      │
│                                         │
│  .pd[data-theme="dark"] {               │
│    --bg: #1c1b15;                       │
│    --ink: #f4f1e6;                      │
│    --accent: #b2c248;                   │
│  }                                      │
└─────────────────────────────────────────┘
                  ↓
         (referenced by)
                  ↓
┌─────────────────────────────────────────┐
│  theme.css                              │
│  (Tailwind @theme)                      │
│                                         │
│  @theme {                               │
│    --color-bg: var(--bg);               │
│    --color-ink: var(--ink);             │
│    --color-accent: var(--accent);       │
│  }                                      │
└─────────────────────────────────────────┘
                  ↓
         (generates utilities)
                  ↓
┌─────────────────────────────────────────┐
│  Your Components                        │
│                                         │
│  <div class="bg-surface text-ink">     │
│  <button class="bg-accent">            │
│  <p class="text-muted">                │
└─────────────────────────────────────────┘
```

---

## Available Tailwind Utilities

### Colors

- Surfaces: `bg-surface`, `bg-surface-2`, `bg-cream`
- Text: `text-ink`, `text-ink-2`, `text-muted`, `text-faint`
- Borders: `border-border`, `border-border-strong`
- Accent: `bg-accent`, `bg-accent-soft`, `text-accent-ink`
- Status: `bg-good`, `bg-ni`, `bg-poor`, `bg-na` (+ `-soft` and `-ink` variants)

### Shadows

- `shadow-sm`, `shadow-md`, `shadow-lg`

### Border Radius

- `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full`

### Fonts

- `font-display`, `font-sans`, `font-mono`

---

## Key Benefits

✅ **Single Source of Truth** — All tokens defined in pulse-dashboard.css  
✅ **Automatic Dark Mode** — Works via `data-theme` attribute  
✅ **Gradual Migration** — Use legacy classes and Tailwind side-by-side  
✅ **No Config File** — Using Tailwind v4's `@theme` directive  
✅ **Type Safety** — CSS variables are referenced, not hardcoded

---

## Testing

Run the demo page to see both approaches:

```bash
vp dev
# Visit: http://localhost:5173/tailwind-demo
```

Toggle between light/dark mode to verify theme switching works.

---

## Next Steps

1. **Use Tailwind for new components** — Start with simple cards, layouts
2. **Keep pulse classes for complex components** — Nav, hero, feature cards, etc.
3. **Document patterns** — As we build, add examples to TAILWIND-HYBRID.md
4. **Refactor gradually** — No rush to convert everything

---

## Questions?

See `TAILWIND-HYBRID.md` for full documentation, or ask Linus.

---

**Verified:** ✅ All checks pass, no formatting issues, no type errors
