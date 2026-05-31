<script lang="ts">
  type Profile = 'mobile' | 'desktop';

  interface Props {
    profile: Profile;
    runsIngested: number;
  }

  let { profile, runsIngested = 0 }: Props = $props();

  // Progress represents shell readiness: full bar = TOTAL_STEPS runs collected
  const TOTAL_STEPS = 6;
  const progressPct = $derived(Math.min((runsIngested / TOTAL_STEPS) * 100, 100));
</script>

<section class="rounded-[28px] border border-border bg-surface-elevated p-6 shadow-pulse sm:p-8 lg:p-10">
  <div
    class="mb-7 inline-flex items-center gap-2 rounded-full bg-accent-tint px-4 py-2 text-sm font-semibold text-primary"
  >
    <span class="size-2 rounded-full bg-primary" aria-hidden="true"></span>
    {profile === 'mobile' ? 'Mobile · 4G profile' : 'Desktop · cable profile'}
  </div>

  <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-end">
    <div>
      <h1
        class="max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl"
      >
        Performance data is not loaded yet.
      </h1>
      <p class="mt-6 max-w-2xl text-lg leading-8 text-secondary sm:text-xl">
        This static dashboard shell is ready for the first sitespeed.io collection. Until
        <code class="rounded-full bg-surface-sunken px-2 py-1 font-mono text-sm text-ink"
          >summary.json</code
        >
        lands, Pulse shows the state plainly instead of inventing placeholder metrics.
      </p>
    </div>

    <div class="rounded-3xl border border-border bg-surface-sunken p-5">
      <p class="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">Readiness</p>
      <div class="mt-4 flex items-end gap-2">
        <span class="font-mono text-6xl font-semibold text-primary">{runsIngested}</span>
        <span class="pb-2 text-sm font-semibold text-secondary">runs ingested</span>
      </div>
      <div
        class="mt-5 h-2 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={runsIngested}
        aria-valuemin={0}
        aria-valuemax={TOTAL_STEPS}
        aria-label="Data collection readiness"
      >
        <span
          class="block h-full rounded-full bg-primary transition-all duration-700"
          style="width: {progressPct}%"
        ></span>
      </div>
    </div>
  </div>
</section>
