<script lang="ts">
  import type { HistoryItem } from '$lib/types';
  import { Music } from 'lucide-svelte';

  let { history }: { history: HistoryItem[] } = $props();

  let topTracks = $derived(() => {
    const trackCounts: Record<string, { track: string; artist: string; plays: number }> = {};

    history.forEach((item) => {
      const key = `${item.track}|||${item.artist}`;
      if (!trackCounts[key]) {
        trackCounts[key] = {
          track: item.track,
          artist: item.artist,
          plays: 0,
        };
      }
      trackCounts[key].plays++;
    });

    return Object.values(trackCounts)
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 10);
  });

  let maxPlays = $derived(topTracks()[0]?.plays || 1);

  const colors = [
    'from-yellow-500 to-orange-500',
    'from-gray-400 to-gray-500',
    'from-orange-600 to-orange-700',
    'from-[#1db954] to-[#1ed760]',
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-red-500 to-red-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
  ];
</script>

<div class="glass-card flex h-full flex-col rounded-xl p-4 sm:p-6">
  <div class="mb-4 flex items-center gap-2 sm:mb-6">
    <Music class="h-4 w-4 text-[#1db954] sm:h-5 sm:w-5" />
    <h3 class="text-lg font-bold sm:text-xl">Top Tracks</h3>
  </div>

  <div class="flex-1 space-y-2 sm:space-y-3">
    {#each topTracks() as track, i (track.track + track.artist)}
      <div class="group">
        <div class="mb-1 flex min-h-[40px] items-center justify-between gap-2">
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <span
              class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold sm:h-6 sm:w-6 sm:text-xs {i <
              3
                ? 'bg-gradient-to-br ' + colors[i] + ' text-white'
                : 'bg-white/10 text-gray-400'}"
            >
              {i + 1}
            </span>
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-medium sm:text-base">{track.track}</div>
              <div class="truncate text-[10px] text-gray-400 sm:text-xs">{track.artist}</div>
            </div>
          </div>
          <span class="ml-1 flex-shrink-0 text-xs text-gray-400 sm:ml-2 sm:text-sm"
            >{track.plays}</span
          >
        </div>
        <div class="h-1.5 overflow-hidden rounded-full bg-white/10 sm:h-2">
          <div
            class="h-full rounded-full bg-gradient-to-r {colors[
              i
            ]} transition-all duration-700 group-hover:shadow-lg"
            style="width: {(track.plays / maxPlays) * 100}%"
          ></div>
        </div>
      </div>
    {/each}
  </div>
</div>
