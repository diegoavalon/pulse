# Tailwind v4 + Pulse Dashboard Hybrid System

## Overview

This project uses a **hybrid CSS approach** that combines:

1. **Pulse Dashboard CSS** (`pulse-dashboard.css`) — Comprehensive design system with semantic tokens
2. **Tailwind v4 utilities** — Powered by `@theme` configuration in `theme.css`

Both systems work together seamlessly. You can use legacy `.pd` classes alongside modern Tailwind utilities.

---

## How It Works

### Source of Truth: `pulse-dashboard.css`

All design tokens are defined in `apps/frontend/src/routes/pulse-dashboard.css`:

```css
/* Light mode */
.pd {
  --bg: var(--ehi-color-background-surface-light);
  --surface: var(--ehi-color-background-surface-light);
  --ink: var(--ehi-color-text);
  --accent: var(--ehi-color-icon-primary);
  /* ... many more tokens ... */
}

/* Dark mode */
.pd[data-theme="dark"] {
  --bg: #1c1b15;
  --surface: #27241b;
  --ink: #f4f1e6;
  --accent: #b2c248;
  /* ... dark variants ... */
}
```

### Tailwind Integration: `theme.css`

The `@theme` file exposes these tokens to Tailwind utilities via `var()` references:

```css
@theme {
  --color-surface: var(--surface);
  --color-ink: var(--ink);
  --color-accent: var(--accent);
  /* ... etc ... */
}
```

**Key insight:** Tailwind utilities read from CSS variables that pulse-dashboard.css manages. No duplication, single source of truth.

---

## Usage Examples

### 1. Using Legacy Pulse Classes

```svelte
<div class="pd" data-theme="light">
  <nav class="pnav">
    <div class="brand">
      <div class="mark">P</div>
      <b>Pulse</b>
    </div>
  </nav>

  <div class="hero">
    <h1>Performance <em>Dashboard</em></h1>
  </div>

  <button class="btn primary">Run Analysis</button>
</div>
```

### 2. Using Tailwind Utilities

```svelte
<div class="pd" data-theme="light">
  <div class="bg-surface border border-border rounded-lg p-6 shadow-md">
    <h2 class="text-ink font-display text-2xl font-bold">Report</h2>
    <p class="text-muted font-sans text-sm mt-2">Latest results from CI</p>

    <div class="flex gap-4 mt-4">
      <span class="bg-good-soft text-good-ink px-3 py-1 rounded-full text-xs font-mono">
        GOOD
      </span>
      <span class="bg-ni-soft text-ni-ink px-3 py-1 rounded-full text-xs font-mono">
        NEEDS IMPROVEMENT
      </span>
    </div>
  </div>
</div>
```

### 3. Mixing Both Approaches

```svelte
<div class="pd" data-theme="dark">
  <!-- Legacy nav component -->
  <nav class="pnav">
    <div class="brand">
      <div class="mark">P</div>
      <b>Pulse</b>
    </div>

    <!-- New Tailwind-based controls -->
    <div class="flex gap-2">
      <button class="bg-accent text-white rounded-full px-4 py-2 font-bold text-sm hover:bg-accent-2">
        Export
      </button>
      <button class="border border-border bg-surface text-ink rounded-full px-4 py-2 text-sm">
        Settings
      </button>
    </div>
  </nav>
</div>
```

---

## Available Tailwind Utilities

### Colors

| Utility                | CSS Variable           | Description                 |
| ---------------------- | ---------------------- | --------------------------- |
| `bg-surface`           | `var(--surface)`       | Primary surface background  |
| `bg-surface-2`         | `var(--surface-2)`     | Secondary surface           |
| `bg-cream`             | `var(--cream)`         | Cream/canvas background     |
| `text-ink`             | `var(--ink)`           | Primary text color          |
| `text-ink-2`           | `var(--ink-2)`         | Secondary text              |
| `text-muted`           | `var(--muted)`         | Muted text                  |
| `text-faint`           | `var(--faint)`         | Faint/disabled text         |
| `border-border`        | `var(--border)`        | Standard border             |
| `border-border-strong` | `var(--border-strong)` | Stronger border             |
| `bg-accent`            | `var(--accent)`        | Primary accent (green/lime) |
| `bg-accent-soft`       | `var(--accent-soft)`   | Soft accent background      |
| `text-accent-ink`      | `var(--accent-ink)`    | Accent text color           |

### Status Colors

| Utility                 | Purpose                  | Light  | Dark        |
| ----------------------- | ------------------------ | ------ | ----------- |
| `bg-good` / `text-good` | Success/good performance | Green  | Light green |
| `bg-ni` / `text-ni`     | Needs improvement        | Yellow | Yellow      |
| `bg-poor` / `text-poor` | Poor performance         | Red    | Light red   |
| `bg-na` / `text-na`     | Not applicable           | Gray   | Gray        |

Each status has three variants:

- `{status}` — Main color (e.g., `bg-good`)
- `{status}-soft` — Soft background (e.g., `bg-good-soft`)
- `{status}-ink` — Text color for soft background (e.g., `text-good-ink`)

### Shadows

- `shadow-sm` — Small shadow
- `shadow-md` — Medium shadow (default for cards)
- `shadow-lg` — Large shadow

### Border Radius

- `rounded-sm` — Small radius (6px)
- `rounded-md` — Medium radius (10px)
- `rounded-lg` — Large radius (14px)
- `rounded-full` — Full rounded (999px)

### Fonts

- `font-display` — Display font (Poppins)
- `font-sans` — Sans font (Open Sans)
- `font-mono` — Monospace font (JetBrains Mono)

---

## Dark Mode

Dark mode works via the `data-theme` attribute on the `.pd` container:

```svelte
<script lang="ts">
  import { themeStore } from '$lib/theme.svelte';
</script>

<div class="pd" data-theme={themeStore.value}>
  <!-- Your content here -->
  <!-- All colors automatically switch based on data-theme -->
</div>
```

**Important:** Always wrap your app in a `.pd` container with `data-theme` for the CSS variables to work correctly.

---

## Migration Strategy

### ✅ Keep Using Legacy Classes For:

- Existing components (`.pnav`, `.hero`, `.btn`, `.feature`, etc.)
- Complex components with established styles
- When you need the exact pulse-dashboard look

### ✅ Use Tailwind Utilities For:

- New components
- Prototyping and rapid iteration
- Simple layouts and utility styling
- Gradual refactoring of existing components

### Example Migration Path

**Before (full pulse-dashboard):**

```svelte
<div class="feature">
  <div>
    <span class="tag">PERFORMANCE</span>
    <h3>Core Web Vitals</h3>
    <p>Lighthouse metrics from real users</p>
  </div>
</div>
```

**After (hybrid):**

```svelte
<div class="bg-surface border-l-4 border-poor rounded-lg p-6 shadow-md">
  <span class="font-mono text-xs tracking-wider uppercase text-poor font-bold flex items-center gap-2">
    PERFORMANCE
  </span>
  <h3 class="mt-2 font-display text-2xl font-bold">Core Web Vitals</h3>
  <p class="text-ink-2 text-sm leading-relaxed">Lighthouse metrics from real users</p>
</div>
```

Both produce similar visual results. Choose based on your context.

---

## Best Practices

1. **Always use `.pd` wrapper:** Ensures CSS variables are in scope
2. **Prefer semantic color names:** Use `bg-surface` not `bg-white`
3. **Use status utilities for metrics:** `bg-good-soft`, `text-ni-ink`, etc.
4. **Leverage font tokens:** `font-display`, `font-sans`, `font-mono`
5. **Respect the design system:** Don't use arbitrary Tailwind values for colors

---

## File Structure

```
apps/frontend/src/
├── routes/
│   ├── layout.css           # Imports Tailwind + theme
│   ├── theme.css            # Tailwind @theme config
│   ├── pulse-dashboard.css  # Source of truth for tokens
│   └── +layout.svelte       # Imports stylesheets
├── lib/
│   └── theme.svelte.ts      # Theme toggle logic
```

---

## Questions?

- **Where do I add new colors?** In `pulse-dashboard.css`, then expose in `theme.css` if needed for Tailwind
- **How do I customize Tailwind?** Edit the `@theme` block in `theme.css`
- **Can I use arbitrary values?** Yes, but prefer design tokens: `bg-[#ff0000]` works, but `bg-poor` is better
- **What about Tailwind config file?** We're using Tailwind v4's `@theme` directive instead of `tailwind.config.ts`

---

**Last updated:** 2025-01-XX  
**Maintained by:** Linus (Frontend Dev)
