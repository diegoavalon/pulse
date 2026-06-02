<script lang="ts">
/**
 * Example component demonstrating the Tailwind v4 + Pulse Dashboard hybrid system
 * 
 * This shows:
 * 1. Using legacy .pd classes for established components
 * 2. Using Tailwind utilities for new/custom elements
 * 3. Mixing both approaches in the same component
 */

import { themeStore } from '$lib/theme.svelte';
</script>

<!-- EXAMPLE 1: Legacy Pulse Dashboard Classes -->
<div class="pd" data-theme={themeStore.value}>
<div class="canvas">
<div class="hero">
<div>
<span class="eyebrow">
<span class="dot good"></span>
HYBRID SYSTEM
</span>
<h1>Tailwind <em>+ Pulse</em></h1>
<p class="verdict">
<b>Two approaches, one design system.</b> Use legacy classes for existing
components or Tailwind utilities for rapid development.
</p>
</div>
</div>

<!-- EXAMPLE 2: Pure Tailwind Utilities -->
<div class="bg-surface border border-border rounded-lg p-6 shadow-md mt-8">
<h2 class="text-ink font-display text-2xl font-bold mb-4">
Pure Tailwind Card
</h2>

<div class="flex gap-3 mb-4">
<span class="bg-good-soft text-good-ink px-3 py-1 rounded-full text-xs font-mono font-bold">
GOOD
</span>
<span class="bg-ni-soft text-ni-ink px-3 py-1 rounded-full text-xs font-mono font-bold">
NEEDS IMPROVEMENT
</span>
<span class="bg-poor-soft text-poor-ink px-3 py-1 rounded-full text-xs font-mono font-bold">
POOR
</span>
<span class="bg-na-soft text-na px-3 py-1 rounded-full text-xs font-mono font-bold">
N/A
</span>
</div>

<p class="text-muted text-sm leading-relaxed">
This card uses only Tailwind utilities. Colors, spacing, typography — everything
references the same CSS variables from pulse-dashboard.css.
</p>
</div>

<!-- EXAMPLE 3: Hybrid Approach -->
<div class="feature mt-8">
<div>
<span class="tag">
<span class="dot poor"></span>
HYBRID EXAMPLE
</span>
<h3>Legacy Structure, Tailwind Details</h3>
<p>The outer .feature class provides the layout...</p>

<!-- But we can use Tailwind for custom elements inside -->
<div class="flex gap-4 mt-4">
<button class="bg-accent hover:bg-accent-2 text-white rounded-full px-4 py-2 font-bold text-sm transition-all">
Tailwind Button
</button>
<button class="btn primary">
Legacy Button
</button>
</div>
</div>

<div class="bg-cream rounded-md p-4 font-mono text-sm text-muted border border-border">
<div>Same theme tokens,</div>
<div>different approaches.</div>
</div>
</div>

<!-- EXAMPLE 4: Status Grid -->
<div class="mt-8">
<h2 class="text-ink-2 font-display text-xl font-bold mb-4">
All Status Colors
</h2>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
<!-- Good -->
<div class="bg-good-soft border-l-4 border-good rounded-md p-4">
<div class="text-good font-bold text-sm mb-1">GOOD</div>
<div class="text-good-ink text-xs font-mono">Score: 95</div>
</div>

<!-- Needs Improvement -->
<div class="bg-ni-soft border-l-4 border-ni rounded-md p-4">
<div class="text-ni font-bold text-sm mb-1">NEEDS IMPROVEMENT</div>
<div class="text-ni-ink text-xs font-mono">Score: 68</div>
</div>

<!-- Poor -->
<div class="bg-poor-soft border-l-4 border-poor rounded-md p-4">
<div class="text-poor font-bold text-sm mb-1">POOR</div>
<div class="text-poor-ink text-xs font-mono">Score: 42</div>
</div>

<!-- N/A -->
<div class="bg-na-soft border-l-4 border-na rounded-md p-4">
<div class="text-na font-bold text-sm mb-1">NOT APPLICABLE</div>
<div class="text-faint text-xs font-mono">No data</div>
</div>
</div>
</div>
</div>
</div>

<style>
/* No custom styles needed! Everything uses either:
   1. Pulse dashboard classes (.pd, .hero, .feature, etc.)
   2. Tailwind utilities (bg-surface, text-ink, etc.)
   
   Both read from the same CSS variable system.
*/
</style>
