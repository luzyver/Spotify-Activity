<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  let {
    label,
    value,
    hint = '',
    class: className = '',
    children,
  }: {
    label: string;
    value: string;
    hint?: string;
    class?: string;
    children?: Snippet;
  } = $props();
</script>

<!-- Container query so the number shrinks with the tile instead of overflowing on narrow phones -->
<div class={cn('tile @container flex flex-col p-4 sm:p-5', className)}>
  <span class="tile-label">{label}</span>
  <span class="stat-number mt-auto truncate pt-6 text-[clamp(1.75rem,26cqi,3.75rem)]">{value}</span>
  {#if hint}
    <span class="mt-2 text-xs text-zinc-400 sm:text-sm">{hint}</span>
  {/if}
  {@render children?.()}
</div>
