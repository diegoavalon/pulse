<script lang="ts">
  interface Props {
    label: string;
    value: string;
    note: string;
  }
  let { label, value, note }: Props = $props();
</script>

<section class="rounded-3xl border border-border bg-surface-elevated p-5 shadow-pulse">
  <p class="text-sm font-semibold text-secondary">{label}</p>
  <p class="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{value}</p>
  <p class="mt-2 text-sm leading-6 text-secondary">{note}</p>
</section>
