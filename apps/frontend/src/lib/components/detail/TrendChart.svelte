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
  // Read from .pd container, not :root, since variables are scoped to .pd
  const getColor = (varName: string) => {
    if (typeof window === "undefined") return "#000";
    const pdContainer = document.querySelector('.pd');
    if (!pdContainer) {
      console.warn(`Cannot read CSS variable ${varName}: .pd container not found`);
      return "#000";
    }
    const value = getComputedStyle(pdContainer).getPropertyValue(varName).trim();
    if (!value) {
      console.warn(`CSS variable ${varName} is empty or undefined`);
    }
    return value || "#000";
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

    // Extract brand colors from CSS custom properties
    const good = getColor("--good");
    const ni = getColor("--ni");
    const poor = getColor("--poor");
    const muted = getColor("--muted");
    const surface = getColor("--surface");
    const border = getColor("--border");
    const ink = getColor("--ink");
    const fontSans = getColor("--sans");

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
            pointBackgroundColor: surface,
            pointBorderColor: lineColor,
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2.5,
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
            backgroundColor: surface,
            titleColor: muted,
            bodyColor: ink,
            borderColor: border,
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            cornerRadius: 10,
            titleFont: {
              family: fontSans,
              size: 13,
              weight: '500',
            },
            bodyFont: {
              family: fontSans,
              size: 14,
              weight: '400',
            },
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
              drawBorder: false,
            },
            border: {
              display: false,
            },
            ticks: {
              color: muted,
              maxRotation: 0,
              autoSkipPadding: 20,
              font: {
                family: fontSans,
                size: 13,
                weight: '400',
              },
            },
          },
          y: {
            display: true,
            grid: {
              color: `${border}66`,
              drawBorder: false,
              lineWidth: 1,
            },
            border: {
              display: false,
            },
            ticks: {
              color: muted,
              padding: 8,
              font: {
                family: fontSans,
                size: 13,
                weight: '400',
              },
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
