<script lang="ts">
  import type { HistoryItem } from '$lib/types';
  import { Crown } from 'lucide-svelte';

  let { history }: { history: HistoryItem[] } = $props();

  let topArtists = $derived(() => {
    const artistCounts = history.reduce(
      (acc, item) => {
        const parts = item.artist
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean);
        for (const name of parts) {
          acc[name] = (acc[name] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, plays]) => ({ name, plays }));
  });

  let maxPlays = $derived(topArtists()[0]?.plays || 1);

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

<div class="glass-card rounded-xl p-6">
  <div class="mb-6 flex items-center gap-2">
    <Crown class="h-5 w-5 text-yellow-500" />
    <h3 class="text-xl font-bold">Top Artists</h3>
  </div>

  <div class="space-y-3">
    {#each topArtists() as artist, i (artist.name)}
      <div class="group">
        <div class="mb-1 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span
              class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold {i < 3
                ? 'bg-gradient-to-br ' + colors[i] + ' text-white'
                : 'bg-white/10 text-gray-400'}"
            >
              {i + 1}
            </span>
            <span class="font-medium">{artist.name}</span>
          </div>
          <span class="text-sm text-gray-400">{artist.plays} plays</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            class="h-full rounded-full bg-gradient-to-r {colors[
              i
            ]} transition-all duration-700 group-hover:shadow-lg"
            style="width: {(artist.plays / maxPlays) * 100}%"
          ></div>
        </div>
      </div>
    {/each}
  </div>
</div>
