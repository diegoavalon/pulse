<script lang="ts">
  import { TYPE_COLOR } from "$lib/detail.js";
  import { fmtBytes, fmtMs } from "$lib/data.js";
  import type { DetailData } from "$lib/detail.js";

  interface Props {
    det: DetailData;
  }
  let { det }: Props = $props();

  const totalMs = $derived(det.blockers.reduce((a, x) => a + x.blockMs, 0));
</script>

<div class="card">
  <div class="card-h">
    <span class="card-ico" class:warn={det.blockers.length > 0} class:good={det.blockers.length === 0}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        {#if det.blockers.length === 0}
          <path d="M5 12.5l4.2 4.2L19 6.5" />
        {:else}
          <path d="M12 4 2.5 20.5h19z" /><path d="M12 10v4.5" /><circle cx="12" cy="17.6" r="0.4" fill="currentColor" stroke="none" />
        {/if}
      </svg>
    </span>
    <div class="card-ht">
      <h3>Render-blocking resources</h3>
      <p>
        {#if det.blockers.length}
          {det.blockers.length} resources · ~{fmtMs(totalMs)} before first paint
        {:else}
          No blocking resources detected
        {/if}
      </p>
    </div>
  </div>

  {#if det.blockers.length}
    <div class="rb">
      <div class="rb-h">
        <span>Resource</span>
        <span>Type</span>
        <span>Source</span>
        <span class="r">Size</span>
        <span class="r">Blocked</span>
      </div>
      {#each det.blockers as blocker, i (i)}
        {@const color = TYPE_COLOR[blocker.type] || "var(--muted)"}
        <div class="rb-r">
          <span class="rb-nm">
            <i style="color: {color}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                {#if blocker.type === "css" || blocker.type === "js"}
                  <path d="M9 8.5 5 12l4 3.5" /><path d="M15 8.5 19 12l-4 3.5" /><path d="M13.5 6l-3 12" />
                {:else}
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                {/if}
              </svg>
            </i>
            {blocker.name}
          </span>
          <span>
            <span class="tchip" style="--tc: {color}">{blocker.type.toUpperCase()}</span>
          </span>
          <span class="rb-src">
            {#if blocker.third}<span class="tpill">3rd-party</span>{/if}
            {blocker.host}
          </span>
          <span class="r mono">{fmtBytes(blocker.size)}</span>
          <span class="r mono blk">{fmtMs(blocker.blockMs)}</span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty sm">
      <div class="empty-ico good">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.2 4.2L19 6.5" />
        </svg>
      </div>
      <div class="empty-t">No render-blocking resources</div>
      <div class="empty-b">Critical path is clean on this run.</div>
    </div>
  {/if}
</div>
