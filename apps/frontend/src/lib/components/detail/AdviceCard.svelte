<script lang="ts">
  import { fmtMs } from "$lib/data.js";
  import type { DetailData, Advice } from "$lib/detail.js";

  interface Props {
    det: DetailData;
  }
  let { det }: Props = $props();

  const SEV_RANK: Record<string, number> = { high: 0, med: 1, low: 2 };
  const sorted = $derived(
    [...det.advice].sort((a, b) => SEV_RANK[a.sev] - SEV_RANK[b.sev]),
  );
</script>

<div class="card">
  <div class="card-h">
    <span class="card-ico">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M9.5 18h5" /><path d="M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.8 10.6c.6.5.8 1 .8 2.4h6c0-1.4.2-1.9.8-2.4A6 6 0 0 0 12 3z" />
      </svg>
    </span>
    <div class="card-ht">
      <h3>Coach advice</h3>
      <p>{sorted.length} recommendations · ranked</p>
    </div>
  </div>

  <div class="advice">
    {#each sorted as adv, i (i)}
      <div class="adv {adv.sev}">
        <div class="adv-top">
          <span class="adv-sev {adv.sev}">
            {adv.sev === "high" ? "High" : adv.sev === "med" ? "Medium" : "Low"}
          </span>
          <span class="adv-metric">{adv.metric}</span>
          {#if adv.savings}
            <span class="adv-save">~{fmtMs(adv.savings)} saved</span>
          {/if}
        </div>
        <div class="adv-t">{adv.title}</div>
        <div class="adv-b">{adv.body}</div>
      </div>
    {/each}
  </div>
</div>
