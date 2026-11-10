<script lang="ts">
  import type { Snippet } from 'svelte';
  import NumberFlow from '@number-flow/svelte';
  import { cn } from '$lib/utils';

  let {
    label,
    index = '',
    value,
    suffix = '',
    hint = '',
    class: className = '',
    icon,
    children,
  }: {
    label: string;
    /** Readout index shown before the label, e.g. "02" */
    index?: string;
    /** null while the number is still loading */
    value: number | null;
    suffix?: string;
    hint?: string;
    class?: string;
    /** Small icon shown beside the number */
    icon?: Snippet;
    children?: Snippet;
  } = $props();
</script>

<!-- Container query so the number shrinks with the tile instead of overflowing on narrow phones -->
<div class={cn('tile @container flex flex-col p-4 sm:p-5', className)}>
  <span class="tile-label">{#if index}<span class="tag-index">{index} //</span>{/if}{label}</span>
  <!-- The icon shares the number's row: the label row is too narrow for it on small phones -->
  <div class="mt-auto flex items-center justify-between gap-2 pt-6">
    <span class="stat-number min-w-0 truncate text-[clamp(2rem,28cqi,4.25rem)]">
      {#if value === null}
        <span class="animate-pulse text-dim">…</span>
      {:else}
        <!-- Digits roll to the new value; NumberFlow skips the animation under reduced motion -->
        <NumberFlow {value} {suffix} locales="id-ID" />
      {/if}
    </span>
    {#if icon}<span class="shrink-0">{@render icon()}</span>{/if}
  </div>
  {#if hint}
    <span class="mt-2 font-mono text-[11px] text-muted sm:text-xs">{hint}</span>
  {/if}
  {@render children?.()}
</div>
