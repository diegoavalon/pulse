<script lang="ts">
  import { onMount } from "svelte";
  import PulseNav from "$lib/components/dashboard/PulseNav.svelte";
  import HeroSection from "$lib/components/dashboard/HeroSection.svelte";
  import FeatureCard from "$lib/components/dashboard/FeatureCard.svelte";
  import RunsFeed from "$lib/components/dashboard/RunsFeed.svelte";
  import { PAGES, summary, recentRuns, type Profile } from "$lib/data.js";
  import { themeStore, initTheme } from "$lib/theme.svelte.js";

  let profile = $state<Profile>("mobile");

  const s = $derived(summary(profile));
  const ranked = $derived(
    [...PAGES].sort((a, b) => b[profile].score - a[profile].score),
  );
  const worst = $derived(ranked[ranked.length - 1]);
  const runs = $derived(recentRuns(7));

  onMount(initTheme);
</script>

<svelte:head>
  <title>Pulse Vitals Dashboard</title>
  <meta
    name="description"
    content="eHealth QA performance dashboard — Core Web Vitals overview."
  />
</svelte:head>

<div class="pd" data-theme={themeStore.value}>
  <PulseNav
    {profile}
    theme={themeStore.value}
    activePage="home"
    onprofilechange={(p) => (profile = p)}
  />

  <div class="canvas">
    <HeroSection {profile} summary={s} {worst} />
    <FeatureCard {profile} page={worst} />
    <RunsFeed {runs} {profile} totalPages={PAGES.length} />

    <div class="foot">
      <span>sitespeed.io 41.2.0</span>
      <span class="sep"></span>
      <span>3 iterations · median</span>
      <span class="sep"></span>
      <span>INP requires RUM — Phase 2</span>
    </div>
  </div>
</div>
