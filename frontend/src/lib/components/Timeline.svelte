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
      <h3 class="glass sticky top-[57px] z-10 -mx-2 mb-1 flex items-baseline gap-2 rounded-xl px-2 py-2 text-sm font-semibold">
        {group.label}
        <span class="font-normal text-zinc-500">· {group.items.length} lagu</span>
      </h3>
      <ul>
        {#each group.items as item (keyOf(item))}
          <li animate:flip={{ duration: 400 * motion }} in:fly={{ y: -16, duration: 400 * motion }}>
            <a
              href={spotifyUrl(item.uri)}
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04] active:bg-white/[0.06]"
            >
              <span class="w-10 shrink-0 font-mono text-[11px] sm:w-11 sm:text-xs tabular-nums text-zinc-500">{formatTime(item.timestamp)}</span>
              {#if item.imageUrl}
                <img src={item.imageUrl} alt="" loading="lazy" class="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-white/5" />
              {:else}
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                  <Music class="h-4 w-4 text-zinc-500" />
                </div>
              {/if}
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium group-hover:underline">{item.track}</p>
                <p class="truncate text-sm text-zinc-400">
                  {item.artist}{#if showUser}<span class="text-zinc-600"> · {item.user}</span>{/if}
                </p>
              </div>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</div>
