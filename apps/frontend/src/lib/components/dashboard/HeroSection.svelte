<script lang="ts">
  import ScoreRing from "./ScoreRing.svelte";
  import type { Profile, Summary, Page } from "$lib/data.js";

  interface Props {
    profile: Profile;
    summary: Summary;
    worst: Page;
  }
  let { profile, summary: s, worst }: Props = $props();

  const profileLabel = $derived(
    profile === "mobile" ? "Mobile · 4G" : "Desktop · cable",
  );
  const wd = $derived(worst[profile]);
</script>

<div class="hero">
  <div>
    <div class="eyebrow">
      <span class="dot good" style="width:7px;height:7px" aria-hidden="true"></span>
      Daily digest · {profileLabel}
    </div>
    <h1>
      <em>{s.counts.good} of {s.total}</em> key pages pass every core vital.
    </h1>
    <p class="verdict">
      {#if s.counts.poor > 0}
        The set is held back by <b>{worst.label}</b>, whose <b>CLS</b> is deep in the red. Fix it first.
      {:else}
        No page is failing a core vital — keep the <b>{s.counts.ni} amber</b> pages from slipping.
      {/if}
    </p>
  </div>

  <div class="hero-score">
    <div class="ring-row">
      <div>
        <div class="num">
          {s.avgScore}<span class="of">/100</span>
        </div>
        <div class="cap">Median coach score</div>
      </div>
      <ScoreRing score={s.avgScore} size={76} stroke={8} />
    </div>
    <div class="dist">
      {#each [
        ["good", "Pass all vitals", s.counts.good],
        ["ni", "Needs improvement", s.counts.ni],
        ["poor", "Failing", s.counts.poor],
      ] as [status, label, count] (status)}
        <div class="dl">
          <span class="lab">
            <span class="dot {status}" aria-hidden="true"></span>
            {label}
          </span>
          <span class="val txt-{status}">{count}</span>
        </div>
      {/each}
    </div>
  </div>
</div>
