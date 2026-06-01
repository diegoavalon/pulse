<script lang="ts">
  import { TYPE_COLOR, TYPE_ICON, getFileName } from "$lib/detail.js";
  import { fmtMs, fmtBytes } from "$lib/data.js";
  import type { DetailData, RequestType } from "$lib/detail.js";

  interface Props {
    det: DetailData;
  }
  let { det }: Props = $props();

  const load = $derived(det.load);
  const T = $derived(det.timing);
  const markers = $derived([
    { k: "FCP", t: T.fcp, c: "var(--ni)" },
    { k: "LCP", t: T.lcp, c: "var(--accent)" },
    { k: "DCL", t: T.dcl, c: "var(--faint)" },
  ]);
  const ticks = $derived([0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(load * f)));

  function pct(v: number): string {
    return Math.max(0, Math.min(100, (v / load) * 100)) + "%";
  }

  function typeColor(type: RequestType): string {
    return TYPE_COLOR[type] || "var(--muted)";
  }

  const TYPES: RequestType[] = ["document", "css", "js", "font", "image", "xhr"];
</script>

<div class="card">
  <div class="card-h">
    <span class="card-ico">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3 3 8l9 5 9-5z" /><path d="M3 13l9 5 9-5" /><path d="M3 8v0" />
      </svg>
    </span>
    <div class="card-ht">
      <h3>Request waterfall</h3>
      <p>{det.shownRequests} of {det.totalRequests} requests · key resources</p>
    </div>
  </div>

  <div class="wf-legend">
    {#each TYPES as ty (ty)}
      <span class="wf-lg">
        <i style="background: {typeColor(ty)}"></i>
        {ty}
      </span>
    {/each}
  </div>

  <div class="waterfall">
    <div class="wf-scale">
      <div class="wf-lbl-sp"></div>
      <div class="wf-ticks">
        {#each ticks as t (t)}
          <span style="left: {pct(t)}">
            {t >= 1000 ? (t / 1000).toFixed(1) + "s" : (t / 1000).toFixed(2) + "s"}
          </span>
        {/each}
      </div>
    </div>

    <div class="wf-body">
      <div class="wf-markers">
        {#each markers as mk (mk.k)}
          <div class="wf-mk" style="left: {pct(mk.t)}; --mkc: {mk.c}">
            <span class="wf-mk-l">{mk.k}</span>
          </div>
        {/each}
      </div>

      {#each det.requests as req, i (i)}
        {@const waitFrac = Math.max(0.04, Math.min(0.92, req.ttfb / req.dur))}
        {@const color = typeColor(req.type)}
        <div class="wf-row" class:blocking={req.blocking}>
          <div class="wf-label">
            <span class="wf-ico" style="color: {color}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                {#if req.type === "image"}
                  <rect x="3" y="4.5" width="18" height="15" rx="2.2" /><circle cx="8.5" cy="10" r="1.6" /><path d="M4 17l5-4 4 3 3.5-3 4 3.5" />
                {:else if req.type === "css" || req.type === "js"}
                  <path d="M9 8.5 5 12l4 3.5" /><path d="M15 8.5 19 12l-4 3.5" /><path d="M13.5 6l-3 12" />
                {:else if req.type === "xhr"}
                  <path d="M12 3 3 8l9 5 9-5z" /><path d="M3 13l9 5 9-5" />
                {:else}
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                {/if}
              </svg>
            </span>
            <span class="wf-nm" title={req.url || "/"}>{getFileName(req.url)}</span>
            {#if req.blocking}
              <span class="wf-flag">blocks</span>
            {:else if req.lcp}
              <span class="wf-flag lcp">LCP</span>
            {/if}
            <span class="wf-sz">{fmtBytes(req.size)}</span>
          </div>
          <div class="wf-track">
            <div
              class="wf-bar"
              style="left: {pct(req.start)}; width: {Math.max(0.7, (req.dur / load) * 100)}%"
            >
              <span class="wf-wait" style="width: {waitFrac * 100}%; background: {color}"></span>
              <span class="wf-dl" style="width: {(1 - waitFrac) * 100}%; background: {color}"></span>
              <span class="wf-ms">{fmtMs(req.dur)}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
