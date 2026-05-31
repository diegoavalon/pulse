<script lang="ts">
  const items = [
    'LCP, CLS, and TBT trend lines once summary.json is committed',
    'Page weight, request count, and third-party pressure in the engineering table',
    'INP stays labeled as RUM-only until field data exists',
  ] as const;
</script>

<div
  id="diagnostics"
  class="panel panel-lg"
>
  <p class="text-sm font-semibold uppercase tracking-[0.16em] text-accent-tint/80">
    Diagnostics underneath
  </p>
  <h2 class="mt-3 font-display text-3xl font-semibold tracking-tight">
    Layered detail stays intact.
  </h2>
  <ul class="mt-6 space-y-4">
    {#each items as item (item)}
      <li class="flex gap-3 text-sm leading-6 text-accent-tint/90">
        <span class="mt-2 size-1.5 shrink-0 rounded-full bg-primary-bright" aria-hidden="true"
        ></span>
        <span>{item}</span>
      </li>
    {/each}
  </ul>
</div>
