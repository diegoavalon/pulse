<script lang="ts">
  import SparkArea from "./SparkArea.svelte";
  import type { Profile, Page } from "$lib/data.js";
  import { rating, fmtMetric, fmtBytes, HEADLINE } from "$lib/data.js";

  interface Props {
    profile: Profile;
    page: Page;
  }
  let { profile, page }: Props = $props();

  const d = $derived(page[profile]);
  const statusColor = $derived(
    d.status === "good"
      ? "var(--good)"
      : d.status === "ni"
        ? "var(--ni)"
        : "var(--poor)",
  );
  const poorMetric = $derived(
    HEADLINE.map((m) => ({ m, r: rating(m, d.cwv[m]) })).find(
      (x) => x.r === "poor",
    ),
  );
</script>

<div class="feature" style="border-left-color: {statusColor}">
  <div>
    <div class="tag">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M13 2 4.5 13.5H11l-1 8.5L19 10h-6.5z" />
      </svg>
      Needs attention first
    </div>
    <h3>{page.label}</h3>
    <p>
      {#if poorMetric}
        Its {poorMetric.m} is {fmtMetric(poorMetric.m, d.cwv[poorMetric.m as keyof typeof d.cwv])} — well into the "poor"
        band. Page weighs {fmtBytes(page.transfer.total)} across {page.requests} requests,
        {page.third} third-party. A theme-aware AI review can pinpoint the layout shift and
        render-blocking sources.
      {:else}
        Currently the lowest coach score in the set. Worth a closer look before it slips into the
        red.
      {/if}
    </p>
    <div class="fm">
      {#each HEADLINE as m (m)}
        {@const r = rating(m, d.cwv[m])}
        <div class="x">
          <div class="v txt-{r}">{fmtMetric(m, d.cwv[m])}</div>
          <div class="k">{m}</div>
        </div>
      {/each}
      <div class="x">
        <div class="v">{d.score}</div>
        <div class="k">SCORE</div>
      </div>
    </div>
  </div>
  <SparkArea data={d.lcpTrend} color={statusColor} width={300} height={96} />
</div>
