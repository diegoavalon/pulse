<script lang="ts">
  import { onMount } from "svelte";
  import PulseNav from "$lib/components/dashboard/PulseNav.svelte";
  import AllPagesConsole from "$lib/components/dashboard/AllPagesConsole.svelte";
  import { type Profile } from "$lib/data.js";
  import { themeStore, initTheme } from "$lib/theme.svelte.js";

  let profile = $state<Profile>("mobile");

  onMount(initTheme);
</script>

<svelte:head>
  <title>All Pages · Pulse Vitals</title>
  <meta
    name="description"
    content="eHealth QA — full console view of all tracked pages and Core Web Vitals."
  />
</svelte:head>

<div class="pd allpages" data-theme={themeStore.value}>
  <PulseNav
    {profile}
    theme={themeStore.value}
    activePage="allpages"
    onprofilechange={(p) => (profile = p)}
  />

  <div class="canvas">
    <AllPagesConsole {profile} theme={themeStore.value} />
  </div>
</div>
