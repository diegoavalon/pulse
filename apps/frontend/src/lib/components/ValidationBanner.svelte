<script lang="ts">
  const steps = ['vp check', 'vp test', 'vp run -r build'] as const;
</script>

<section class="panel panel-sunken panel-lg">
  <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
    <div>
      <p class="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
        Validation flow
      </p>
      <h2 class="mt-2 font-display text-2xl font-semibold tracking-tight">
        Future agents can verify with Vite+.
      </h2>
    </div>
    <div class="flex flex-wrap gap-2">
      {#each steps as step (step)}
        <code
          class="rounded-full border border-border bg-surface-elevated px-4 py-2 font-mono text-sm font-semibold text-ink"
          >{step}</code
        >
      {/each}
    </div>
  </div>
</section>
