<script lang="ts">
  import Delta from "$lib/components/dashboard/Delta.svelte";
  import { rating, fmtMetric, fmtMs } from "$lib/data.js";
  import type { ProfileData } from "$lib/data.js";

  const THRESH_TEXT: Record<string, string> = {
    LCP: "Good ≤ 2.5 s",
    CLS: "Good ≤ 0.10",
    TBT: "Good ≤ 200 ms",
    FCP: "Good ≤ 1.8 s",
    TTFB: "Good ≤ 0.8 s",
    INP: "Field-only",
  };

  const RATING_LABEL: Record<string, string> = {
    good: "Good",
    ni: "Needs work",
    poor: "Poor",
    na: "No data",
  };

  interface Props {
    metric: string;
    d: ProfileData;
  }
  let { metric, d }: Props = $props();

  const isInp = $derived(metric === "INP");
  const value = $derived(d.cwv[metric as keyof typeof d.cwv] as number | null);
  const r = $derived(isInp ? "na" : rating(metric, value));
  const delta = $derived(metric === "LCP" ? d.lcpDelta : null);
</script>

<div class="mtile {r}">
  <div class="mt-top">
    <span class="mt-k">{metric}</span>
    {#if isInp}
      <span class="mt-band na">RUM</span>
    {:else}
      <span class="mt-band {r}">{RATING_LABEL[r]}</span>
    {/if}
  </div>

  {#if isInp}
    <div class="mt-v na">—</div>
    <div class="mt-sub">Needs real users · Phase 2</div>
  {:else}
    <div class="mt-v txt-{r}">{fmtMetric(metric, value)}</div>
    <div class="mt-sub">
      <span>{THRESH_TEXT[metric]}</span>
      {#if delta !== null}
        <Delta value={delta} lowerBetter={true} />
      {/if}
    </div>
  {/if}
</div>
