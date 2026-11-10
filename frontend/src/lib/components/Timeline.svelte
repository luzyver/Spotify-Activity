<script lang="ts">
  import type { HistoryItem } from '$lib/types';
  import { spotifyUrl } from '$lib/utils';
  import { groupByDay, formatTime } from '$lib/utils/stats';
  import { Music } from 'lucide-svelte';
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import { prefersReducedMotion } from 'svelte/motion';

  let { items, showUser = false }: { items: HistoryItem[]; showUser?: boolean } = $props();

  const keyOf = (item: HistoryItem) => `${item.userId}|${item.uri}|${item.timestamp}`;

  // Drop exact duplicates: a repeated key would make the keyed each block throw
  let groups = $derived.by(() => {
    const seen = new Set<string>();
    return groupByDay(items.filter((item) => !seen.has(keyOf(item)) && !!seen.add(keyOf(item))));
  });

  // New plays slide in from the top and the rest glide down (only for items added later, not on first render)
  let motion = $derived(prefersReducedMotion.current ? 0 : 1);
</script>

<div class="space-y-6">
  {#each groups as group (group.key)}
    <section in:fly={{ y: -12, duration: 350 * motion }}>
      <!-- Day header: a HUD readout pinned under the visor -->
      <h3 class="glass sticky top-[var(--sticky-top,var(--header-h))] z-10 -mx-2 mb-1 flex items-center gap-3 px-2 py-2">
        <span class="hud-text text-sm text-fg">{group.label}</span>
        <span class="font-mono text-[11px] text-hud-text">{group.items.length} lagu</span>
        <span class="h-px flex-1 bg-gradient-to-r from-hud/40 to-transparent" aria-hidden="true"></span>
      </h3>
      <!-- Wide screens read the log in columns, left to right then down -->
      <!-- grid-cols-1 (minmax(0,1fr)): an implicit auto column grows to the longest title and defeats truncate -->
      <ul class="grid grid-cols-1 gap-x-4 lg:grid-cols-2 2xl:grid-cols-3">
        {#each group.items as item (keyOf(item))}
          <li animate:flip={{ duration: 400 * motion }} in:fly={{ y: -16, duration: 400 * motion }}>
            <a
              href={spotifyUrl(item.uri)}
              target="_blank"
              rel="noopener noreferrer"
              class="plate group flex items-center gap-3 border border-transparent px-2 py-2 [--edge:transparent] transition-colors hover:border-hud/30 hover:bg-hud/[0.06] hover:[--edge:var(--color-hud)] active:bg-hud/10"
            >
              <span class="w-10 shrink-0 font-mono text-[11px] tabular-nums text-dim group-hover:text-hud-text sm:w-11 sm:text-xs">{formatTime(item.timestamp)}</span>
              {#if item.imageUrl}
                <img src={item.imageUrl} alt="" loading="lazy" class="h-12 w-12 shrink-0 object-cover ring-1 ring-line-strong" />
              {:else}
                <div class="flex h-12 w-12 shrink-0 items-center justify-center bg-surface-2 ring-1 ring-line-strong">
                  <Music class="h-4 w-4 text-dim" />
                </div>
              {/if}
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-fg">{item.track}</p>
                <p class="truncate text-sm text-muted">
                  {item.artist}{#if showUser}<span class="text-dim"> · {item.user}</span>{/if}
                </p>
              </div>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</div>
