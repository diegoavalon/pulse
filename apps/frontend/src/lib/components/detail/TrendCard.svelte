<script lang="ts">
  import TrendChart from "./TrendChart.svelte";
  import { THRESHOLDS, type Profile } from "$lib/data.js";
  import type { DetailData } from "$lib/detail.js";

  interface Props {
    det: DetailData | null;
  }
  let { det }: Props = $props();

  const profile = $derived(det?.profile ?? "mobile");
  const d = $derived(det?.d);

  // Trend data is already in the ProfileData
  const lcpTrend = $derived(d?.lcpTrend ?? []);
  const scoreTrend = $derived(d?.scoreTrend ?? []);
  const clsTrend = $derived(d?.cwv.CLS ? [d.cwv.CLS] : []); // TODO: Extend data model with CLS trend
  const tbtTrend = $derived(d?.cwv.TBT ? [d.cwv.TBT] : []); // TODO: Extend data model with TBT trend

  const hasTrends = $derived(lcpTrend.length > 1 || scoreTrend.length > 1);
</script>

{#if det && d && hasTrends}
  <section class="card trend-card">
    <div class="card-h">
      <div class="card-ico good" aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      </div>
      <h3>Trend History</h3>
      <span class="card-lab">{profile} · last 14 days</span>
    </div>

    <div class="trend-grid">
      {#if lcpTrend.length > 1}
        <div class="trend-item">
          <h4 class="trend-title">LCP over time</h4>
          <TrendChart
            metric="LCP"
            data={lcpTrend}
            {profile}
            thresholds={THRESHOLDS.LCP}
          />
        </div>
      {/if}

      {#if scoreTrend.length > 1}
        <div class="trend-item">
          <h4 class="trend-title">Coach Score over time</h4>
          <div class="trend-chart-wrap">
            <TrendChart
              metric="Score"
              data={scoreTrend}
              {profile}
              thresholds={{ good: 80, ni: 50 }}
              unit=""
            />
          </div>
        </div>
      {/if}
    </div>

    <div class="trend-note">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
      <span>
        Trends show {profile} profile only. Switch profiles to see desktop or mobile independently.
      </span>
    </div>
  </section>
{:else if det}
  <section class="card trend-card empty">
    <div class="card-h">
      <div class="card-ico na" aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      </div>
      <h3>Trend History</h3>
    </div>
    <div class="trend-empty">
      <p>Not enough historical data yet.</p>
      <p class="trend-empty-sub">
        Trends appear after multiple runs. Check back after the next scheduled collection.
      </p>
    </div>
  </section>
{/if}

<style>
  .trend-card {
    padding: var(--spacing-xl);
  }

  .card-h {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }

  .card-ico {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
  }

  .card-ico.good {
    background: var(--good-soft);
    color: var(--good-ink);
  }

  .card-ico.na {
    background: var(--muted);
    color: var(--color-surface-elevated);
    opacity: 0.5;
  }

  .card-h h3 {
    font-family: var(--font-headline-sm);
    font-size: var(--text-headline-sm);
    font-weight: var(--font-weight-headline-sm);
    letter-spacing: var(--tracking-headline-sm);
    margin: 0;
    color: var(--color-ink);
  }

  .card-lab {
    font-size: var(--text-label-sm);
    color: var(--muted);
    margin-left: auto;
  }

  .trend-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-xxl);
  }

  @media (min-width: 768px) {
    .trend-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .trend-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .trend-title {
    font-family: var(--font-body-md);
    font-size: var(--text-body-md);
    font-weight: 600;
    margin: 0;
    color: var(--color-ink);
  }

  .trend-chart-wrap {
    height: 220px;
  }

  .trend-note {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-xl);
    padding: var(--spacing-md);
    background: var(--accent-soft);
    border-radius: var(--radius-md);
    font-size: var(--text-body-sm);
    color: var(--muted);
  }

  .trend-note svg {
    flex: none;
    margin-top: 2px;
  }

  .trend-empty {
    padding: var(--spacing-xxl) 0;
    text-align: center;
    color: var(--muted);
  }

  .trend-empty p {
    margin: 0 0 var(--spacing-sm);
    font-size: var(--text-body-md);
  }

  .trend-empty-sub {
    font-size: var(--text-body-sm);
    opacity: 0.8;
  }

  .card.empty {
    opacity: 0.7;
  }
</style>
