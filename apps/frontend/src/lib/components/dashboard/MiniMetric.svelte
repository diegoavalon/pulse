<script lang="ts">
  import { rating, fmtMetric, THRESHOLDS } from "$lib/data.js";

  interface Props {
    metric: string;
    value: number;
  }
  let { metric, value }: Props = $props();

  const r = $derived(rating(metric, value));
  const statusVar = $derived(
    r === "good" ? "var(--good)" : r === "ni" ? "var(--ni)" : r === "poor" ? "var(--poor)" : "var(--na)",
  );
  const frac = $derived(() => {
    const t = THRESHOLDS[metric];
    return t ? Math.max(0.04, Math.min(1, value / (t.ni * 1.5))) : 0.5;
  });
</script>

<div class="mm">
  <span class="k">{metric}</span>
  <span class="v txt-{r}">{fmtMetric(metric, value)}</span>
  <div class="meter">
    <span style="width: {frac() * 100}%; background: {statusVar}"></span>
  </div>
</div>
