# Tailwind + Pulse Quick Reference

## TL;DR

✅ Use **pulse classes** (.pd, .btn, .hero) for existing components  
✅ Use **Tailwind utilities** (bg-surface, text-ink) for new components  
✅ **Mix both** in the same file — they share the same CSS variables

---

## Most Common Utilities

### Layout

```svelte
<div class="flex gap-4">
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
<div class="p-6">           <!-- padding: 1.5rem -->
<div class="mt-8 mb-4">     <!-- margin-top: 2rem, margin-bottom: 1rem -->
```

### Colors (auto light/dark)

```svelte
<div class="bg-surface text-ink">           <!-- main surface & text -->
<div class="bg-surface-2 text-ink-2">       <!-- secondary -->
<div class="border border-border">          <!-- standard border -->
<div class="text-muted">                    <!-- muted text -->
<div class="bg-accent text-white">          <!-- accent/primary -->
```

### Status Badges

```svelte
<span class="bg-good-soft text-good-ink px-3 py-1 rounded-full text-xs font-mono">
  GOOD
</span>
<span class="bg-ni-soft text-ni-ink px-3 py-1 rounded-full text-xs font-mono">
  NEEDS IMPROVEMENT
</span>
<span class="bg-poor-soft text-poor-ink px-3 py-1 rounded-full text-xs font-mono">
  POOR
</span>
```

### Cards

```svelte
<div class="bg-surface border border-border rounded-lg p-6 shadow-md">
  <h2 class="text-ink font-display text-2xl font-bold">Title</h2>
  <p class="text-muted text-sm mt-2">Description</p>
</div>
```

### Buttons

```svelte
<!-- Tailwind -->
<button class="bg-accent hover:bg-accent-2 text-white rounded-full px-4 py-2 font-bold text-sm">
  Click Me
</button>

<!-- Legacy -->
<button class="btn primary">Click Me</button>
```

### Typography

```svelte
<h1 class="font-display text-4xl font-bold">
<p class="font-sans text-sm text-muted">
<code class="font-mono text-xs">
```

---

## Color Reference

| Class           | Description        |
| --------------- | ------------------ |
| `bg-surface`    | Main surface       |
| `bg-surface-2`  | Secondary surface  |
| `bg-cream`      | Cream/canvas       |
| `text-ink`      | Primary text       |
| `text-ink-2`    | Secondary text     |
| `text-muted`    | Muted text         |
| `text-faint`    | Very subtle text   |
| `border-border` | Standard border    |
| `bg-accent`     | Primary green/lime |

## Status Colors

| Status            | Main      | Soft BG        | Text for Soft BG |
| ----------------- | --------- | -------------- | ---------------- |
| Good              | `bg-good` | `bg-good-soft` | `text-good-ink`  |
| Needs Improvement | `bg-ni`   | `bg-ni-soft`   | `text-ni-ink`    |
| Poor              | `bg-poor` | `bg-poor-soft` | `text-poor-ink`  |
| N/A               | `bg-na`   | `bg-na-soft`   | `text-na`        |

---

## Important Rules

1. **Always wrap in `.pd`** with `data-theme`:

   ```svelte
   <div class="pd" data-theme={themeStore.value}>
     <!-- Your content -->
   </div>
   ```

2. **Prefer semantic names** over arbitrary values:
   - ✅ `bg-surface`
   - ❌ `bg-[#ffffff]`

3. **Use existing pulse classes** for complex components (nav, hero, etc.)

4. **Use Tailwind** for simple layouts, cards, and utility styling

---

## Full Docs

- **Complete Guide:** `apps/frontend/TAILWIND-HYBRID.md`
- **Integration Summary:** `apps/frontend/TAILWIND-INTEGRATION.md`
- **Live Examples:** Visit `/tailwind-demo` in dev server

---

**Questions?** Ask Linus or check the docs above.
