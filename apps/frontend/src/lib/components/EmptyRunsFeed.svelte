<script lang="ts">
  type Profile = 'mobile' | 'desktop';

  interface Props {
    profile: Profile;
  }

  let { profile }: Props = $props();
</script>

<div class="section section-lg">
  <div
    class="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between sm:pb-6"
  >
    <div>
      <p class="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Most Recent</p>
      <h2 class="mt-2 font-display text-3xl font-semibold tracking-tight">Awaiting first runs</h2>
    </div>
    <span
      class="self-start rounded-full border border-border bg-surface-sunken px-4 py-2 text-sm font-semibold text-secondary sm:self-auto"
    >
      {profile} profile
    </span>
  </div>

  <div class="grid place-items-center py-12 text-center sm:py-16">
    <div class="max-w-lg">
      <div
        class="mx-auto grid size-16 place-items-center rounded-full bg-accent-tint text-primary"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          class="size-7"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="m7 15 3-3 3 2 5-6" />
        </svg>
      </div>
      <h3 class="mt-5 font-display text-2xl font-semibold tracking-tight">
        No collection has published data yet
      </h3>
      <p class="mt-3 leading-7 text-secondary">
        When the GitHub Actions pipeline commits performance summaries, this area becomes the
        recent-runs feed and the All Pages console. For now, it is intentionally empty.
      </p>
    </div>
  </div>
</div>
