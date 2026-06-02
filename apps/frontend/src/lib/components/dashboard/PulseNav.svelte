<script lang="ts">
  import { base } from "$app/paths";
  import type { Profile } from "$lib/data.js";
  import { toggleTheme } from "$lib/theme.svelte.js";

  interface Props {
    profile: Profile;
    theme: string;
    activePage: "home" | "allpages";
    onprofilechange: (p: Profile) => void;
  }
  let { profile, theme, activePage, onprofilechange }: Props = $props();
</script>

<nav class="pnav" aria-label="Site navigation">
  <div class="container flex items-center gap-6">
    <div class="brand">
      <div class="mark" aria-hidden="true">
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
          <path d="M2 12h4l2.5-7 4 14 2.5-7H22" />
        </svg>
      </div>
      <b>eVitals</b>
    </div>

    <div class="links">
      <a href={`${base}/`} class:active={activePage === "home"}>Home</a>
      <a href={`${base}/all-pages`} class:active={activePage === "allpages"}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.5-3.5" />
        </svg>
        All Pages
      </a>
      <a href="#">Trends</a>
      <a href="#">Settings</a>
    </div>

    <div class="ml-auto right">
      <div class="seg" role="group" aria-label="Profile">
        <button
          aria-pressed={profile === "mobile"}
          onclick={() => onprofilechange("mobile")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="7" y="2" width="10" height="20" rx="2.4" />
            <line x1="11" y1="18.5" x2="13" y2="18.5" />
          </svg>
          Mobile
        </button>
        <button
          aria-pressed={profile === "desktop"}
          onclick={() => onprofilechange("desktop")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="2.5" y="4" width="19" height="12.5" rx="2" />
            <line x1="8.5" y1="20.5" x2="15.5" y2="20.5" />
            <line x1="12" y1="16.5" x2="12" y2="20.5" />
          </svg>
          Desktop
        </button>
      </div>

      <button class="btn primary" type="button">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M20 11a8 8 0 1 0-1.5 5" /><path d="M20 5v5h-5" />
        </svg>
        Run check
      </button>

      <button
        class="theme-toggle"
        type="button"
        title="Toggle theme"
        onclick={toggleTheme}
        aria-label="Toggle dark mode"
      >
        {#if theme === "dark"}
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3.6" />
            <path
              d="M12 3.5v2M12 18.5v2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M3.5 12h2M18.5 12h2M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4"
            />
          </svg>
        {:else}
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M20 13.5A8 8 0 0 1 10.5 4a7 7 0 1 0 9.5 9.5z" />
          </svg>
        {/if}
      </button>
    </div>
  </div>
</nav>
