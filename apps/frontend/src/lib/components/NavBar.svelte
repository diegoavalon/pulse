<script lang="ts">
  type Profile = 'mobile' | 'desktop';

  interface Props {
    profile: Profile;
    onprofilechange: (p: Profile) => void;
  }

  let { profile, onprofilechange }: Props = $props();
</script>

<header
  class="sticky top-3 z-10 flex flex-col gap-4 rounded-full border border-border bg-surface-elevated/95 px-4 py-3 shadow-pulse backdrop-blur md:flex-row md:items-center md:justify-between md:gap-6"
>
  <a
    href="/"
    class="flex items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
  >
    <span
      class="grid size-10 place-items-center rounded-full bg-primary text-accent-tint"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        class="size-5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M3 12h4l2.5-7 4 14 2.5-7h5" />
      </svg>
    </span>
    <span>
      <span class="block font-display text-base font-semibold tracking-tight">Pulse Vitals</span>
      <span class="block text-xs font-medium text-secondary">eHealth QA performance</span>
    </span>
  </a>

  <nav class="flex flex-wrap items-center gap-2 text-sm" aria-label="Dashboard navigation">
    <a class="rounded-full bg-accent-tint px-4 py-2 font-semibold text-primary" href="/">Home</a>
    <a
      class="rounded-full px-4 py-2 font-semibold text-secondary transition hover:bg-surface-sunken hover:text-ink"
      href="#all-pages">All Pages</a
    >
    <a
      class="rounded-full px-4 py-2 font-semibold text-secondary transition hover:bg-surface-sunken hover:text-ink"
      href="#diagnostics">Diagnostics</a
    >
  </nav>

  <div
    class="flex items-center gap-2 rounded-full border border-border bg-surface-sunken p-1"
    role="group"
    aria-label="Profile toggle"
  >
    <button
      class="rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      class:bg-surface-elevated={profile === 'mobile'}
      class:text-ink={profile === 'mobile'}
      class:text-secondary={profile !== 'mobile'}
      aria-pressed={profile === 'mobile'}
      onclick={() => onprofilechange('mobile')}
    >
      Mobile
    </button>
    <button
      class="rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      class:bg-surface-elevated={profile === 'desktop'}
      class:text-ink={profile === 'desktop'}
      class:text-secondary={profile !== 'desktop'}
      aria-pressed={profile === 'desktop'}
      onclick={() => onprofilechange('desktop')}
    >
      Desktop
    </button>
  </div>
</header>
