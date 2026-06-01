<script lang="ts">
  import type { DetailData } from "$lib/detail.js";

  interface Props {
    det: DetailData;
  }
  let { det }: Props = $props();

  const r = $derived(det.review);
  const cfg = $derived(
    r.state === "available"
      ? { cls: "ok", tag: "Available", btn: "Open AI review", ghost: false }
      : r.state === "pending"
        ? { cls: "pending", tag: "Pending", btn: "Notify when ready", ghost: true }
        : { cls: "na", tag: "Unavailable", btn: null, ghost: true },
  );
</script>

<div class="card review {cfg.cls}">
  <div class="card-h">
    <span class="card-ico">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
        <circle cx="12" cy="12" r="2.8" />
      </svg>
    </span>
    <div class="card-ht">
      <h3>AI review</h3>
      <p>Annotated trace + fixes</p>
    </div>
  </div>

  <div class="rv-state">
    <span class="rv-ico {cfg.cls}">
      {#if r.state === "available"}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
          <path d="M12 3l1.6 4.8L18 9.4l-4.4 1.6L12 16l-1.6-4.9L6 9.4l4.4-1.6z M19 14l.7 2.1L22 17l-2.3.8L19 20l-.8-2.2L16 17l2.2-.9z" />
        </svg>
      {:else if r.state === "pending"}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6.5 3h11" /><path d="M6.5 21h11" />
          <path d="M8 3v3.2l4 3.8 4-3.8V3" /><path d="M8 21v-3.2l4-3.8 4 3.8V21" />
        </svg>
      {:else}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
          <circle cx="12" cy="12" r="2.8" />
        </svg>
      {/if}
    </span>
    <span class="rv-tag {cfg.cls}">{cfg.tag}</span>
  </div>

  <div class="rv-reason">{r.reason}</div>

  {#if cfg.btn}
    <button class="btn {cfg.ghost ? 'ghost' : 'primary'} full" type="button">
      {cfg.btn}
      {#if !cfg.ghost}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
        </svg>
      {/if}
    </button>
  {/if}
</div>
