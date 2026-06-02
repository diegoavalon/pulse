# Tailwind Hybrid Setup — Pulse Dashboard

## Overview

The pulse-dashboard CSS styling has been **integrated with Tailwind v4** using a hybrid approach that:

- ✅ Preserves the existing design-token CSS system
- ✅ Exposes all tokens to Tailwind utilities
- ✅ Enables gradual migration without refactoring existing components
- ✅ Maintains automatic light/dark theme switching

## Architecture

```
pulse-dashboard.css (source of truth)
    ↓
    ├── CSS custom properties (--bg, --ink, --accent, etc.)
    ├── Light/dark theme via data-theme attribute
    └── Existing component styles (.pd, .hero, .btn, etc.)

theme.css (@theme configuration)
    ↓
    └── Exposes variables to Tailwind utilities via var() references
```

## Usage

### **Option 1: Legacy Classes** (existing components)

```svelte
<button class="btn primary">Save</button>
<div class="pd hero">...</div>
```

### **Option 2: Tailwind Utilities** (new components)

```svelte
<button class="bg-accent text-white px-4 py-2 rounded-full">
  Save
</button>
<div class="bg-surface border border-border rounded-lg p-6 shadow-md">
  ...
</div>
```

### **Option 3: Hybrid** (mix as needed)

```svelte
<div class="hero bg-surface rounded-lg p-6">
  <!-- Use .hero for layout, bg-surface for color -->
</div>
```

## Available Tailwind Tokens

All tokens from pulse-dashboard CSS are now Tailwind utilities:

| Category    | Examples                                                                 |
| ----------- | ------------------------------------------------------------------------ |
| **Colors**  | `bg-surface`, `text-ink`, `border-border`, `text-good`, `bg-accent-soft` |
| **Shadows** | `shadow-sm`, `shadow-md`, `shadow-lg`                                    |
| **Radius**  | `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full`                 |
| **Fonts**   | `font-display`, `font-sans`, `font-mono`                                 |
| **Spacing** | `p-xs`, `p-sm`, `p-md`, `p-lg`, `p-xl`, `p-2xl`, `p-3xl`, `p-4xl`        |

## Files

- **`pulse-dashboard.css`** — Existing design tokens (unchanged)
- **`theme.css`** — New Tailwind @theme configuration
- **`+layout.svelte`** — Updated to import `theme.css`

## Dark Mode

Dark mode works automatically. Both systems respect the `data-theme="dark"` attribute on the root element:

```svelte
<div class="pd" data-theme="dark">
  <!-- Both .pd classes and Tailwind utilities respond to dark mode -->
</div>
```

## Migration Path

**No breaking changes.** You can:

1. **Keep using existing classes** for all components
2. **Use new Tailwind utilities** for new components
3. **Gradually refactor** existing components without rush
4. **Mix both systems** in the same component if needed

## Why This Approach?

- **Maintainability** — Design tokens stay centralized in CSS
- **Flexibility** — Use Tailwind for utilities, classes for components
- **No duplication** — Single source of truth for colors/spacing
- **Theming** — Light/dark mode works out of the box
- **Zero breaking changes** — Existing code continues to work

---

For questions or issues, check `theme.css` for inline documentation.
