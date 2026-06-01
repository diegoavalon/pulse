<script lang="ts">
  import SparkArea from "./SparkArea.svelte";
  import Delta from "./Delta.svelte";
  import {
    PAGES,
    GROUPS,
    rating,
    fmtMetric,
    fmtBytes,
    scoreBand,
    summary,
    type Profile,
  } from "$lib/data.js";

  interface Props {
    profile: Profile;
    theme: string;
  }
  let { profile, theme }: Props = $props();

  let filter = $state("All");
  let query = $state("");

  const s = $derived(summary(profile));
  const statusPill = $derived(
    s.counts.poor ? "poor" : s.counts.ni ? "ni" : "good",
  );
  const pillLabel = $derived(
    `${s.counts.good} good · ${s.counts.ni} warn · ${s.counts.poor} poor`,
  );

  const COLS = ["LCP", "CLS", "TBT", "FCP", "TTFB"] as const;
  const groups = ["All", ...GROUPS] as const;

  function visible(group: string) {
    return PAGES.filter(
      (p) =>
        (filter === "All" || p.group === filter) &&
        p.group === group &&
        (!query || p.label.toLowerCase().includes(query.toLowerCase())),
    );
  }

  function statusColor(s: string): string {
    return s === "good"
      ? "var(--good)"
      : s === "ni"
        ? "var(--ni)"
        : "var(--poor)";
  }
</script>

<div class="con-header">
  <div class="con-brand">
    <div class="con-mark" aria-hidden="true">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 12h4l2.5-7 4 14 2.5-7H22" />
      </svg>
    </div>
    <div>
      <p class="con-title">Vitals Console</p>
      <p class="con-sub">ehealthinsurance · QA · {s.total} pages</p>
    </div>
  </div>
  <div class="con-actions">
    <div class="runinfo">
      <span class="live" aria-label="Live"></span>
      synced 1:41 PM
    </div>
    <span class="pill {statusPill}">
      <span class="dot {statusPill}" aria-hidden="true"></span>
      {pillLabel}
    </span>
  </div>
</div>

<div class="toolbar" role="toolbar" aria-label="Console filters">
  <div class="seg" role="group" aria-label="Profile">
    <button
      aria-pressed={profile === "mobile"}
      onclick={() => (profile = "mobile" as Profile)}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="7" y="2" width="10" height="20" rx="2.4" />
        <line x1="11" y1="18.5" x2="13" y2="18.5" />
      </svg>
      Mobile
    </button>
    <button
      aria-pressed={profile === "desktop"}
      onclick={() => (profile = "desktop" as Profile)}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="2.5" y="4" width="19" height="12.5" rx="2" />
        <line x1="8.5" y1="20.5" x2="15.5" y2="20.5" />
        <line x1="12" y1="16.5" x2="12" y2="20.5" />
      </svg>
      Desktop
    </button>
  </div>

  <div class="chips">
    {#each groups as g (g)}
      <button
        class="chip"
        aria-pressed={filter === g}
        onclick={() => (filter = g)}
      >{g}</button>
    {/each}
  </div>

  <div class="search">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.5-3.5" />
    </svg>
    <input
      type="search"
      placeholder="Filter pages…"
      bind:value={query}
      aria-label="Filter pages"
    />
  </div>

  <button class="btn primary" type="button">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 11a8 8 0 1 0-1.5 5" /><path d="M20 5v5h-5" />
    </svg>
    Run check now
  </button>
</div>

<div class="tablewrap">
  <table>
    <thead>
      <tr>
        <th>Page</th>
        <th>Score</th>
        {#each COLS as col (col)}<th>{col}</th>{/each}
        <th>INP <span class="req">*</span></th>
        <th>Weight</th>
        <th>Req</th>
        <th>LCP · 14d</th>
      </tr>
    </thead>
    <tbody>
      {#each GROUPS as group (group)}
        {@const rows = visible(group)}
        {#if rows.length}
          <tr class="grouprow">
            <td colspan="11">{group}</td>
          </tr>
          {#each rows as page (page.id)}
            {@const d = page[profile]}
            {@const lcpRating = rating("LCP", d.cwv.LCP)}
            <tr class="page" onclick={() => (window.location.href = `/pages/${page.id}`)}>
              <td class="name">
                <div class="nm">
                  <span class="dot {d.status}" style="width:8px;height:8px" aria-hidden="true"></span>
                  <div>
                    <div class="name-main">{page.label}</div>
                    <div class="name-url">{new URL(page.url).pathname}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="scorecell txt-{scoreBand(d.score)}">{d.score}</span>
              </td>
              {#each COLS as m (m)}
                {@const r = rating(m, d.cwv[m])}
                <td><span class="num {r}">{fmtMetric(m, d.cwv[m])}</span></td>
              {/each}
              <td><span class="inp-tag">RUM →</span></td>
              <td>
                <div class="pageweight">
                  <span class="num" style="font-size:12px">{fmtBytes(page.transfer.total)}</span>
                  <div class="wbar">
                    <span style="flex:{page.transfer.js};background:var(--accent)"></span>
                    <span style="flex:{page.transfer.css};background:var(--ni)"></span>
                    <span style="flex:{page.transfer.image};background:var(--good)"></span>
                    <span style="flex:{page.transfer.other};background:var(--faint)"></span>
                  </div>
                </div>
              </td>
              <td>
                <span class="num" style="font-size:12px;color:var(--muted)">{page.requests}</span>
              </td>
              <td>
                <div style="display:flex;align-items:center;gap:9px;justify-content:flex-end">
                  <SparkArea
                    data={d.lcpTrend}
                    color={statusColor(lcpRating)}
                    width={70}
                    height={26}
                  />
                  <Delta value={d.lcpDelta} lowerBetter={true} />
                </div>
              </td>
            </tr>
          {/each}
        {/if}
      {/each}
    </tbody>
  </table>
</div>

<div class="foot">
  <span>* INP requires real-user data — Phase 2 (RUM). TBT shown as lab proxy.</span>
  <span class="sep"></span>
  <span>sitespeed.io 41.2.0 · 3 iter median</span>
  <span class="sep"></span>
  <span>{profile === "mobile" ? "Moto G4 · 4G" : "Desktop · cable"}</span>
</div>
