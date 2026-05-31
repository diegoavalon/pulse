<script lang="ts">
  import { scoreBand } from "$lib/data.js";

  interface Props {
    score: number;
    size?: number;
    stroke?: number;
  }
  let { score, size = 64, stroke = 6 }: Props = $props();

  const r = $derived((size - stroke) / 2);
  const circumference = $derived(2 * Math.PI * r);
  const offset = $derived(circumference * (1 - score / 100));

  function bandColor(s: number): string {
    const b = scoreBand(s);
    return b === "good" ? "var(--good)" : b === "ni" ? "var(--ni)" : "var(--poor)";
  }
</script>

<svg width={size} height={size} style="transform: rotate(-90deg)" aria-hidden="true">
  <circle
    cx={size / 2}
    cy={size / 2}
    r={r}
    fill="none"
    stroke="var(--border)"
    stroke-width={stroke}
  />
  <circle
    cx={size / 2}
    cy={size / 2}
    r={r}
    fill="none"
    stroke={bandColor(score)}
    stroke-width={stroke}
    stroke-dasharray={circumference}
    stroke-dashoffset={offset}
    stroke-linecap="round"
    style="transition: stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)"
  />
</svg>
