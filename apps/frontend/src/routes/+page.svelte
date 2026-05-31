<script lang="ts">
type Profile = 'mobile' | 'desktop';
type CollectionState = 'empty' | 'collecting';

let profile = $state<Profile>('mobile');
const collectionState: CollectionState = 'empty';

const shellStats = [
{ label: 'Tracked pages', value: '—', note: 'waiting for urls.json' },
{ label: 'Last run', value: 'No data', note: 'collection has not published yet' },
{ label: 'Profiles', value: 'Mobile + Desktop', note: 'mobile remains the default view' }
];

const upcomingDiagnostics = [
'LCP, CLS, and TBT trend lines once summary.json is committed',
'Page weight, request count, and third-party pressure in the engineering table',
'INP stays labeled as RUM-only until field data exists'
];

const validationSteps = ['vp check', 'vp test', 'vp run -r build'];
</script>

<svelte:head>
<title>Pulse Vitals Dashboard</title>
<meta
name="description"
content="Static eHealth performance dashboard shell awaiting sitespeed.io data."
/>
</svelte:head>

<div class="min-h-screen bg-surface text-ink">
<div class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
<header
class="sticky top-3 z-10 flex flex-col gap-4 rounded-full border border-border bg-surface-elevated/95 px-4 py-3 shadow-pulse backdrop-blur md:flex-row md:items-center md:justify-between md:gap-6"
>
<a href="/" class="flex items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
<span class="grid size-10 place-items-center rounded-full bg-primary text-accent-tint" aria-hidden="true">
<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
<path d="M3 12h4l2.5-7 4 14 2.5-7h5" />
</svg>
</span>
<span>
<span class="block font-display text-base font-semibold tracking-tight">Pulse Vitals</span>
<span class="block text-xs font-medium text-secondary">eHealth QA performance</span>
</span>
</a>

<nav class="flex flex-wrap items-center gap-2 text-sm" aria-label="Dashboard">
<a class="rounded-full bg-accent-tint px-4 py-2 font-semibold text-primary" href="/">Home</a>
<a class="rounded-full px-4 py-2 font-semibold text-secondary transition hover:bg-surface-sunken hover:text-ink" href="#all-pages">All Pages</a>
<a class="rounded-full px-4 py-2 font-semibold text-secondary transition hover:bg-surface-sunken hover:text-ink" href="#diagnostics">Diagnostics</a>
</nav>

<div class="flex items-center gap-2 rounded-full border border-border bg-surface-sunken p-1" aria-label="Profile toggle">
<button
class="rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
class:bg-surface-elevated={profile === 'mobile'}
class:text-ink={profile === 'mobile'}
class:text-secondary={profile !== 'mobile'}
aria-pressed={profile === 'mobile'}
onclick={() => (profile = 'mobile')}
>
Mobile
</button>
<button
class="rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
class:bg-surface-elevated={profile === 'desktop'}
class:text-ink={profile === 'desktop'}
class:text-secondary={profile !== 'desktop'}
aria-pressed={profile === 'desktop'}
onclick={() => (profile = 'desktop')}
>
Desktop
</button>
</div>
</header>

<main class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
<section class="rounded-[28px] border border-border bg-surface-elevated p-6 shadow-pulse sm:p-8 lg:p-10">
<div class="mb-7 inline-flex items-center gap-2 rounded-full bg-accent-tint px-4 py-2 text-sm font-semibold text-primary">
<span class="size-2 rounded-full bg-primary" aria-hidden="true"></span>
{profile === 'mobile' ? 'Mobile · 4G profile' : 'Desktop · cable profile'}
</div>

<div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-end">
<div>
<h1 class="max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
Performance data is not loaded yet.
</h1>
<p class="mt-6 max-w-2xl text-lg leading-8 text-secondary sm:text-xl">
This static dashboard shell is ready for the first sitespeed.io collection. Until
<code class="rounded-full bg-surface-sunken px-2 py-1 font-mono text-sm text-ink">summary.json</code>
lands, Pulse shows the state plainly instead of inventing placeholder metrics.
</p>
</div>

<div class="rounded-3xl border border-border bg-surface-sunken p-5">
<p class="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">Readiness</p>
<div class="mt-4 flex items-end gap-2">
<span class="font-mono text-6xl font-semibold text-primary">0</span>
<span class="pb-2 text-sm font-semibold text-secondary">runs ingested</span>
</div>
<div class="mt-5 h-2 overflow-hidden rounded-full bg-border" aria-hidden="true">
<span class="block h-full w-1/6 rounded-full bg-primary"></span>
</div>
</div>
</div>
</section>

<aside class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
{#each shellStats as stat (stat.label)}
<section class="rounded-3xl border border-border bg-surface-elevated p-5 shadow-pulse">
<p class="text-sm font-semibold text-secondary">{stat.label}</p>
<p class="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{stat.value}</p>
<p class="mt-2 text-sm leading-6 text-secondary">{stat.note}</p>
</section>
{/each}
</aside>
</main>

<section id="all-pages" class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
<div class="rounded-[28px] border border-border bg-surface-elevated shadow-pulse">
<div class="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
<div>
<p class="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Most Recent</p>
<h2 class="mt-2 font-display text-3xl font-semibold tracking-tight">Awaiting first runs</h2>
</div>
<span class="rounded-full border border-border bg-surface-sunken px-4 py-2 text-sm font-semibold text-secondary">
{profile} profile
</span>
</div>
<div class="grid place-items-center px-5 py-12 text-center sm:px-10 sm:py-16">
<div class="max-w-lg">
<div class="mx-auto grid size-16 place-items-center rounded-full bg-accent-tint text-primary" aria-hidden="true">
<svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
<path d="M4 19V5" />
<path d="M4 19h16" />
<path d="m7 15 3-3 3 2 5-6" />
</svg>
</div>
<h3 class="mt-5 font-display text-2xl font-semibold tracking-tight">No collection has published data yet</h3>
<p class="mt-3 leading-7 text-secondary">
When the GitHub Actions pipeline commits performance summaries, this area becomes
the recent-runs feed and the All Pages console. For now, it is intentionally empty.
</p>
</div>
</div>
</div>

<div id="diagnostics" class="rounded-[28px] border border-border bg-primary p-6 text-accent-tint shadow-pulse sm:p-7">
<p class="text-sm font-semibold uppercase tracking-[0.16em] text-accent-tint/80">Diagnostics underneath</p>
<h2 class="mt-3 font-display text-3xl font-semibold tracking-tight">Layered detail stays intact.</h2>
<ul class="mt-6 space-y-4">
{#each upcomingDiagnostics as item (item)}
<li class="flex gap-3 text-sm leading-6 text-accent-tint/90">
<span class="mt-2 size-1.5 rounded-full bg-primary-bright" aria-hidden="true"></span>
<span>{item}</span>
</li>
{/each}
</ul>
</div>
</section>

<section class="rounded-[28px] border border-dashed border-border bg-surface-sunken p-6 sm:p-7">
<div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
<div>
<p class="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Validation flow</p>
<h2 class="mt-2 font-display text-2xl font-semibold tracking-tight">Future agents can verify with Vite+.</h2>
</div>
<div class="flex flex-wrap gap-2">
{#each validationSteps as step (step)}
<code class="rounded-full border border-border bg-surface-elevated px-4 py-2 font-mono text-sm font-semibold text-ink">{step}</code>
{/each}
</div>
</div>
</section>

<footer class="pb-6 text-sm text-secondary">
Pulse/eHealth dashboard shell · static SvelteKit · state: {collectionState}
</footer>
</div>
</div>
