<script lang="ts">
  import type { DetailData } from "$lib/detail.js";

  interface Props {
    det: DetailData;
  }
  let { det }: Props = $props();
</script>

<div class="card">
  <div class="card-h">
    <span class="card-ico">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="4.5" width="18" height="15" rx="2.2" />
        <circle cx="8.5" cy="10" r="1.6" />
        <path d="M4 17l5-4 4 3 3.5-3 4 3.5" />
      </svg>
    </span>
    <div class="card-ht">
      <h3>Visual progress</h3>
      <p>
        {det.hasScreenshots
          ? `${det.filmstrip.length} frames · ${det.profile}`
          : "Filmstrip"}
      </p>
    </div>
  </div>

  {#if !det.hasScreenshots}
    <div class="empty">
      <div class="empty-ico">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4.5" width="18" height="15" rx="2.2" />
          <path d="M4 18l5-4 3 2.2" /><path d="M14 13l3-2.5 4 3.5" />
          <path d="M3.5 3.5l17 17" />
        </svg>
      </div>
      <div class="empty-t">No screenshots retained for this run</div>
      <div class="empty-b">{det.noShotReason}</div>
      <button class="btn ghost sm" type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 11a8 8 0 1 0-1.5 5" /><path d="M20 5v5h-5" />
        </svg>
        Re-run with capture
      </button>
    </div>
  {:else}
    <div class="filmstrip">
      {#each det.filmstrip as frame (frame.t)}
        <div class="frame" class:is-fcp={frame.fcp} class:is-lcp={frame.lcp}>
          <div class="shot {det.profile}">
            <div class="s-bar"></div>
            <div class="s-hero" style="opacity: {frame.progress >= 0.3 ? 1 : 0}"></div>
            <div class="s-lines" style="opacity: {frame.progress >= 0.55 ? 1 : 0}">
              <span></span><span></span><span style="width:62%"></span>
            </div>
            <div class="s-cards" style="opacity: {frame.progress >= 0.85 ? 1 : 0}">
              <i></i><i></i><i></i>
            </div>
            {#if frame.progress < 0.3}
              <div class="s-blank"></div>
            {/if}
          </div>
          <div class="ftime">
            <span class="fms">{(frame.t / 1000).toFixed(1)}s</span>
            {#if frame.lcp}
              <span class="ftag lcp">LCP</span>
            {:else if frame.fcp}
              <span class="ftag fcp">FCP</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
