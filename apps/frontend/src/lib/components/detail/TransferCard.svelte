<script lang="ts">
  import { fmtBytes } from "$lib/data.js";
  import type { DetailData } from "$lib/detail.js";

  interface Props {
    det: DetailData;
  }
  let { det }: Props = $props();

  const tr = $derived(det.transfer);
  const parts = [
    ["js", "JavaScript", "var(--accent)"],
    ["css", "CSS", "var(--ni)"],
    ["image", "Images", "var(--good)"],
    ["other", "Other", "var(--faint)"],
  ] as const;
</script>

<div class="card">
  <div class="card-h">
    <span class="card-ico">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    </span>
    <div class="card-ht">
      <h3>Transfer size</h3>
      <p>{fmtBytes(tr.total)} · {det.totalRequests} requests</p>
    </div>
  </div>

  <div class="tbar">
    {#each parts as [key, label, color] (key)}
      <span style="flex: {tr[key]}; background: {color}" title={label}></span>
    {/each}
  </div>

  <div class="tlist">
    {#each parts as [key, label, color] (key)}
      <div class="tl-r">
        <span class="tl-k">
          <i style="background: {color}"></i>
          {label}
        </span>
        <span class="tl-v mono">{fmtBytes(tr[key])}</span>
        <span class="tl-pc">{Math.round((tr[key] / tr.total) * 100)}%</span>
      </div>
    {/each}
  </div>

  <div class="tl-foot">
    <span>{det.third} third-party requests</span>
    <span class="mono">{Math.round((det.third / det.totalRequests) * 100)}% of total</span>
  </div>
</div>
