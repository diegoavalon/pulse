<script lang="ts">
  import { fmtMs } from "$lib/data.js";

  interface Props {
    value: number;
    lowerBetter?: boolean;
  }
  let { value, lowerBetter = true }: Props = $props();

  const improved = $derived(lowerBetter ? value < 0 : value > 0);
  const flat = $derived(Math.abs(value) < 0.0001);
  const cls = $derived(flat ? "flat" : improved ? "down" : "up");
  const label = $derived(
    (value > 0 ? "+" : "−") + fmtMs(Math.abs(value)),
  );
</script>

<span class="delta {cls}">
  {#if flat}
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <path d="M6 12h12" />
    </svg>
  {:else if value < 0}
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 5v14" /><path d="M6 13l6 6 6-6" />
    </svg>
  {:else}
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 19V5" /><path d="M6 11l6-6 6 6" />
    </svg>
  {/if}
  {label}
</span>
