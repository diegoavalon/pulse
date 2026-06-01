<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import PulseNav from "$lib/components/dashboard/PulseNav.svelte";
  import ScoreRing from "$lib/components/dashboard/ScoreRing.svelte";
  import Delta from "$lib/components/dashboard/Delta.svelte";
  import MetricTile from "$lib/components/detail/MetricTile.svelte";
  import FilmstripCard from "$lib/components/detail/FilmstripCard.svelte";
  import WaterfallCard from "$lib/components/detail/WaterfallCard.svelte";
  import BlockingTable from "$lib/components/detail/BlockingTable.svelte";
  import TransferCard from "$lib/components/detail/TransferCard.svelte";
  import AdviceCard from "$lib/components/detail/AdviceCard.svelte";
  import ReviewCard from "$lib/components/detail/ReviewCard.svelte";
  import TrendCard from "$lib/components/detail/TrendCard.svelte";
  import { detail } from "$lib/detail.js";
  import { PAGES, summary, scoreBand, rating, fmtMs, type Profile } from "$lib/data.js";
  import { themeStore, initTheme } from "$lib/theme.svelte.js";

  let profile = $state<Profile>("mobile");

  const id = $derived(page.params.id);
  const det = $derived(detail(id, profile));
  const d = $derived(det?.d);

  const ranked = $derived(
    det ? [...PAGES].sort((a, b) => b[profile].score - a[profile].score) : [],
  );
  const rank = $derived(ranked.findIndex((p) => p.id === id) + 1);
  const s = $derived(summary(profile));

  const pagePath = $derived(() => {
    if (!det) return "";
    try {
      return new URL(det.page.url).pathname;
    } catch {
      return det.page.url;
    }
  });

  const METRICS = ["LCP", "CLS", "TBT", "FCP", "TTFB", "INP"] as const;

  function ratingLabel(r: string): string {
    return r === "good" ? "Good" : r === "ni" ? "Needs work" : r === "poor" ? "Poor" : "No data";
  }

  onMount(initTheme);
</script>

<svelte:head>
  <title>{det?.page.label ?? "Page"} · Pulse Vitals</title>
  <meta
    name="description"
    content="Core Web Vitals detail — {det?.page.label ?? ''}, {profile} profile"
  />
</svelte:head>

<div class="pd detailview" data-theme={themeStore.value}>
  <PulseNav
    {profile}
    theme={themeStore.value}
    activePage="allpages"
    onprofilechange={(p) => (profile = p)}
  />

  {#if !det}
    <div class="dwrap">
      <div class="empty">Unknown page ID: {id}</div>
    </div>
  {:else}
    <div class="dwrap">
      <!-- breadcrumb + page switcher -->
      <div class="crumb">
        <a href="/all-pages" class="back">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 12H5" /><path d="M11 18l-6-6 6-6" />
          </svg>
          All Pages
        </a>
        <span class="sl">/</span>
        <span class="cg">{det.page.group}</span>
        <div class="switch">
          <label for="page-select">Jump to</label>
          <select
            id="page-select"
            value={id}
            onchange={(e) => {
              const v = (e.target as HTMLSelectElement).value;
              window.location.href = `/pages/${v}`;
            }}
          >
            {#each PAGES as p (p.id)}
              <option value={p.id}>{p.label}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- page header -->
      <header class="dhead">
        <div class="dh-main">
          <div class="dh-status">
            <span class="dot {d?.status}" aria-hidden="true"></span>
            {ratingLabel(d?.status ?? "na")}
          </div>
          <h1>{det.page.label}</h1>
          <a
            class="dh-url"
            href={det.page.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {pagePath()}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="gi" aria-hidden="true">
              <path d="M14 4h6v6" /><path d="M20 4l-8.5 8.5" />
              <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
            </svg>
          </a>
          <p class="dh-sum">
            Coach score <b>{d?.score}</b> ranks <b>#{rank}</b> of {s.total}
            {profile} pages —
            <a href="/all-pages" class="ilink">
              see all in context
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
              </svg>
            </a>
          </p>
        </div>

        <div class="dh-side">
          <div class="seg" role="group" aria-label="Profile">
            <button
              aria-pressed={profile === "mobile"}
              onclick={() => (profile = "mobile")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px" aria-hidden="true">
                <rect x="7" y="2" width="10" height="20" rx="2.4" /><line x1="11" y1="18.5" x2="13" y2="18.5" />
              </svg>
              Mobile
            </button>
            <button
              aria-pressed={profile === "desktop"}
              onclick={() => (profile = "desktop")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px" aria-hidden="true">
                <rect x="2.5" y="4" width="19" height="12.5" rx="2" /><line x1="8.5" y1="20.5" x2="15.5" y2="20.5" /><line x1="12" y1="16.5" x2="12" y2="20.5" />
              </svg>
              Desktop
            </button>
          </div>

          {#if d}
            <div class="dh-score">
              <ScoreRing score={d.score} size={72} stroke={8} />
              <div class="dh-sc-n txt-{scoreBand(d.score)}">{d.score}</div>
            </div>
          {/if}

          <div class="dh-run">
            <span>
              <span class="live" aria-label="Live data"></span>
              Run {det.run.index} of {det.run.total} · {det.run.kind}
            </span>
            <span class="dh-run-t">May 29, 1:41 PM</span>
          </div>
        </div>
      </header>

      <!-- metric tiles -->
      {#if d}
        <div class="mrow">
          {#each METRICS as m (m)}
            <MetricTile metric={m} {d} />
          {/each}
        </div>
      {/if}

      <!-- trend history -->
      <TrendCard {det} />

      <!-- diagnostics grid -->
      <div class="dgrid">
        <div class="dcol main">
          <FilmstripCard {det} />
          <WaterfallCard {det} />
          <BlockingTable {det} />
        </div>
        <div class="dcol side">
          <TransferCard {det} />
          <AdviceCard {det} />
          <ReviewCard {det} />
        </div>
      </div>

      <div class="dfoot">
        <span>sitespeed.io {det.page.sitespeedVersion ?? "41.2.0"} · {det.page.iterations ?? 3} iterations · median</span>
        <span class="sep"></span>
        <span>{profile === "mobile" ? "Moto G4 · 4G throttled" : "Desktop · cable"}</span>
        <span class="sep"></span>
        <span>Captured {new Date(det.run.when).toLocaleDateString()}</span>
      </div>
    </div>
  {/if}
</div>
