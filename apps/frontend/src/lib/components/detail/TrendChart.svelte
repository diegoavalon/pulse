<script lang="ts">
  import { onMount } from "svelte";
  import { Chart, registerables } from "chart.js";
  import { fmtMetric, rating, type Profile } from "$lib/data.js";

  interface Props {
    metric: string;
    data: number[];
    profile: Profile;
    thresholds?: { good: number; ni: number };
    unit?: string;
  }
  let { metric, data, profile, thresholds, unit = "ms" }: Props = $props();

  let canvas: HTMLCanvasElement | undefined = $state();
  let chart: Chart | null = null;

  // Get colors from CSS custom properties
  const getColor = (varName: string) => {
    if (typeof window === "undefined") return "#000";
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };

  // Format value based on metric type
  const formatValue = (val: number) => {
    if (metric === "Score") {
      return val.toFixed(0);
    }
    return fmtMetric(metric, val);
  };

  // Determine rating for score-based metrics
  const getScoreRating = (val: number) => {
    if (metric === "Score") {
      return val >= 80 ? "good" : val >= 50 ? "ni" : "poor";
    }
    return rating(metric, val);
  };

  onMount(() => {
    Chart.register(...registerables);

    if (!canvas) return;

    const good = getColor("--good");
    const ni = getColor("--ni");
    const poor = getColor("--poor");
    const muted = getColor("--muted");
    const surfaceElevated = getColor("--color-surface-elevated");

    // Determine line color based on latest value's rating
    const latestValue = data[data.length - 1];
    const latestRating = getScoreRating(latestValue);
    const lineColor = latestRating === "good" ? good : latestRating === "ni" ? ni : poor;

    // Generate labels (last 14 data points)
    const labels = data.map((_, i) => {
      const daysAgo = data.length - 1 - i;
      return daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`;
    });

    chart = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${metric} (${profile})`,
            data,
            borderColor: lineColor,
            backgroundColor: `${lineColor}22`,
            borderWidth: 2.5,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: surfaceElevated,
            pointBorderColor: lineColor,
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: surfaceElevated,
            titleColor: muted,
            bodyColor: getColor("--color-ink"),
            borderColor: getColor("--color-border"),
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              title: (items) => labels[items[0].dataIndex],
              label: (item) => {
                const val = item.parsed.y;
                return `${metric}: ${formatValue(val)}`;
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
            ticks: {
              color: muted,
              maxRotation: 0,
              autoSkipPadding: 20,
            },
          },
          y: {
            display: true,
            grid: {
              color: getColor("--color-border") + "40",
            },
            ticks: {
              color: muted,
              callback: (value) => formatValue(value as number),
            },
          },
        },
      },
    });

    return () => {
      if (chart) {
        chart.destroy();
        chart = null;
      }
    };
  });
</script>

<div class="trend-chart">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .trend-chart {
    width: 100%;
    height: 100%;
    min-height: 220px;
  }

  canvas {
    max-width: 100%;
  }
</style>
