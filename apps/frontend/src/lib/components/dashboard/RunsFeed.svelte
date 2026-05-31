<script lang="ts">
  import SparkArea from "./SparkArea.svelte";
  import MiniMetric from "./MiniMetric.svelte";
  import Delta from "./Delta.svelte";
  import type { Profile, RunEntry } from "$lib/data.js";
  import { rating, scoreBand, relTime, clockTime } from "$lib/data.js";

  interface Props {
    runs: RunEntry[];
    profile: Profile;
    totalPages: number;
  }
  let { runs, profile, totalPages }: Props = $props();

  function statusColor(status: string): string {
    return status === "good"
      ? "var(--good)"
      : status === "ni"
        ? "var(--ni)"
        : "var(--poor)";
  }
</script>

<div class="listhead">
  <h2>Most Recent</h2>
  <span class="hint">{profile} runs · newest first</span>
</div>

<div class="runs" role="list">
  {#each runs as run, i (run.page.id)}
    {@const d = run.page[profile]}
    {@const lcpRating = rating("LCP", d.cwv.LCP)}
    <div class="runrow" role="listitem">
      <div class="runtime">
        <div class="rel">
          {#if i < 2}<span class="live" aria-label="Recent"></span>{/if}
          {relTime(run.mins)}
        </div>
        <div class="abs">{clockTime(run.at)}</div>
      </div>

      <div class="pg">
        <span class="dot {d.status}" aria-hidden="true"></span>
        <div>
          <div class="pgname">
            {run.page.label}
            <span class="pgtag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                {#if profile === "mobile"}
                  <rect x="7" y="2" width="10" height="20" rx="2.4" />
                  <line x1="11" y1="18.5" x2="13" y2="18.5" />
                {:else}
                  <rect x="2.5" y="4" width="19" height="12.5" rx="2" />
                  <line x1="8.5" y1="20.5" x2="15.5" y2="20.5" />
                  <line x1="12" y1="16.5" x2="12" y2="20.5" />
                {/if}
              </svg>
              {profile === "mobile" ? "Mobile" : "Desktop"}
            </span>
          </div>
          <div class="pggrp">{run.page.group}</div>
        </div>
      </div>

      <span class="scorebig txt-{scoreBand(d.score)}">{d.score}</span>
      <MiniMetric metric="LCP" value={d.cwv.LCP} />
      <MiniMetric metric="CLS" value={d.cwv.CLS} />
      <MiniMetric metric="TBT" value={d.cwv.TBT} />

      <div class="trend">
        <SparkArea
          data={d.lcpTrend}
          color={statusColor(lcpRating)}
          width={88}
          height={32}
        />
        <div class="meta">
          <div style="font-family: var(--mono); font-size: 10.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--faint); font-weight: 600;">LCP</div>
          <Delta value={d.lcpDelta} lowerBetter={true} />
        </div>
      </div>
    </div>
  {/each}

  <a class="view-all-link" href="/all-pages">
    View all {totalPages} pages in the console
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
    </svg>
  </a>
</div>
