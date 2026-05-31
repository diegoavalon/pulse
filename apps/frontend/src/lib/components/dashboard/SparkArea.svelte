<script lang="ts">
  interface Props {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
  }
  let { data = [], color = "var(--accent)", width = 110, height = 34 }: Props = $props();

  const pad = 2;
  const gradientId = `spark-${Math.random().toString(36).slice(2, 8)}`;

  const pts = $derived.by(() => {
    if (data.length < 2) return [];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = (width - pad * 2) / (data.length - 1);
    return data.map((v, i) => ({
      x: pad + i * stepX,
      y: pad + (height - pad * 2) * (1 - (v - min) / range),
    }));
  });

  const linePath = $derived.by(() => {
    if (pts.length < 2) return "";
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cx = (pts[i].x + pts[i + 1].x) / 2;
      d += ` C${cx},${pts[i].y} ${cx},${pts[i + 1].y} ${pts[i + 1].x},${pts[i + 1].y}`;
    }
    return d;
  });

  const areaPath = $derived(
    pts.length < 2
      ? ""
      : `${linePath} L${pts[pts.length - 1].x},${height - pad} L${pts[0].x},${height - pad} Z`,
  );

  const last = $derived(pts[pts.length - 1]);
</script>

{#if pts.length >= 2}
  <svg
    {width}
    {height}
    style="display: block; overflow: visible"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color={color} stop-opacity="0.22" />
        <stop offset="100%" stop-color={color} stop-opacity="0" />
      </linearGradient>
    </defs>
    <path d={areaPath} fill="url(#{gradientId})" />
    <path
      d={linePath}
      fill="none"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    {#if last}
      <circle cx={last.x} cy={last.y} r="2.6" fill={color} />
    {/if}
  </svg>
{:else}
  <svg {width} {height} aria-hidden="true"></svg>
{/if}
