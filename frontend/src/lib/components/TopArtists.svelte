<script lang="ts">
  import type { ArtistStat } from '$lib/utils/stats';
  import { Music } from 'lucide-svelte';

  let { artists }: { artists: ArtistStat[] } = $props();

  let max = $derived(artists[0]?.count ?? 1);
</script>

<!-- Three rows tall on the 4-column grid, where it fills the cells next to the stat tiles -->
<div class="tile col-span-2 row-span-2 flex flex-col p-4 sm:p-5 md:row-span-3 xl:row-span-2">
  <span class="tile-label"><span class="tag-index">05 //</span>Artis teratas · 7 hari</span>

  {#if artists.length > 0}
    <ol class="mt-5 flex flex-1 flex-col justify-between gap-3">
      {#each artists as artist, i (artist.name)}
        <li class="flex items-center gap-3">
          <span class="w-5 font-mono text-xs tabular-nums {i === 0 ? 'text-gold' : 'text-dim'}">{String(i + 1).padStart(2, '0')}</span>
          {#if artist.imageUrl}
            <img src={artist.imageUrl} alt="" loading="lazy" class="h-10 w-10 shrink-0 object-cover ring-1 {i === 0 ? 'ring-gold/70' : 'ring-line-strong'}" />
          {:else}
            <div class="flex h-10 w-10 shrink-0 items-center justify-center bg-surface-2 ring-1 ring-line-strong">
              <Music class="h-4 w-4 text-dim" />
            </div>
          {/if}
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline justify-between gap-2">
              <span class="truncate font-semibold {i === 0 ? 'text-base sm:text-lg' : 'text-sm'}">{artist.name}</span>
              <span class="shrink-0 font-mono text-xs tabular-nums text-muted">{artist.count}×</span>
            </div>
            <div class="segmented mt-1.5 h-1.5 overflow-hidden bg-hud/10">
              <div
                class="grow-x h-full transition-[width] duration-700"
                style="animation-delay: {250 + i * 90}ms; width: {(artist.count / max) * 100}%; background-color: rgb(var(--accent) / {i === 0 ? 1 : 0.55});"
              ></div>
            </div>
          </div>
        </li>
      {/each}
    </ol>
  {:else}
    <p class="m-auto text-sm text-muted">Belum ada data minggu ini.</p>
  {/if}
</div>
