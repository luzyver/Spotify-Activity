<script lang="ts">
  import type { ArtistStat } from '$lib/utils/stats';
  import { Music } from 'lucide-svelte';

  let { artists }: { artists: ArtistStat[] } = $props();

  let max = $derived(artists[0]?.count ?? 1);
</script>

<div class="tile col-span-2 row-span-2 flex flex-col p-4 sm:p-5">
  <span class="tile-label">Artis teratas · 7 hari</span>

  {#if artists.length > 0}
    <ol class="mt-5 flex flex-1 flex-col justify-between gap-3">
      {#each artists as artist, i (artist.name)}
        <li class="flex items-center gap-3">
          <span class="w-4 text-sm font-semibold tabular-nums text-zinc-500">{i + 1}</span>
          {#if artist.imageUrl}
            <img src={artist.imageUrl} alt="" loading="lazy" class="h-10 w-10 shrink-0 rounded-lg object-cover" />
          {:else}
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
              <Music class="h-4 w-4 text-zinc-500" />
            </div>
          {/if}
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline justify-between gap-2">
              <span class="truncate font-semibold {i === 0 ? 'text-lg' : 'text-sm'}">{artist.name}</span>
              <span class="shrink-0 text-xs tabular-nums text-zinc-400">{artist.count}×</span>
            </div>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                class="grow-x h-full rounded-full transition-[width] duration-700"
                style="animation-delay: {250 + i * 90}ms; width: {(artist.count / max) * 100}%; background-color: rgb(var(--accent) / {i === 0 ? 1 : 0.55});"
              ></div>
            </div>
          </div>
        </li>
      {/each}
    </ol>
  {:else}
    <p class="m-auto text-sm text-zinc-500">Belum ada data minggu ini.</p>
  {/if}
</div>
