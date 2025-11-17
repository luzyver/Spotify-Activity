<script lang="ts">
  import type { HistoryItem } from '$lib/types';
  import { Users, TrendingUp, Music } from 'lucide-svelte';

  let { history }: { history: HistoryItem[] } = $props();

  let userStats = $derived(() => {
    const stats: Record<string, { plays: number; tracks: Set<string>; artists: Set<string> }> = {};

    history.forEach((item) => {
      if (!stats[item.user]) {
        stats[item.user] = { plays: 0, tracks: new Set(), artists: new Set() };
      }
      stats[item.user].plays++;
      stats[item.user].tracks.add(item.track);
      stats[item.user].artists.add(item.artist);
    });

    return Object.entries(stats)
      .map(([user, data]) => ({
        user,
        plays: data.plays,
        uniqueTracks: data.tracks.size,
        uniqueArtists: data.artists.size,
      }))
      .sort((a, b) => b.plays - a.plays);
  });

  let maxPlays = $derived(userStats()[0]?.plays || 1);
</script>

<div class="glass-card rounded-xl p-6">
  <div class="mb-6 flex items-center gap-2">
    <Users class="h-5 w-5 text-[#1db954]" />
    <h3 class="text-xl font-bold">User Comparison</h3>
  </div>

  <div class="space-y-4">
    {#each userStats() as user, i (user.user)}
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1db954] to-[#1ed760] font-bold"
            >
              {user.user.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 class="font-bold">{user.user}</h4>
              <p class="text-xs text-gray-400">{user.plays} total plays</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-400">
              {user.uniqueTracks} tracks • {user.uniqueArtists} artists
            </div>
          </div>
        </div>

        <div class="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            class="h-full rounded-full bg-gradient-to-r from-[#1db954] to-[#1ed760] transition-all duration-700"
            style="width: {(user.plays / maxPlays) * 100}%"
          ></div>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div class="rounded-lg bg-white/5 p-2 text-center">
            <Music class="mx-auto mb-1 h-4 w-4 text-[#1db954]" />
            <div class="text-xs font-bold">{user.plays}</div>
            <div class="text-[10px] text-gray-500">Plays</div>
          </div>
          <div class="rounded-lg bg-white/5 p-2 text-center">
            <TrendingUp class="mx-auto mb-1 h-4 w-4 text-blue-400" />
            <div class="text-xs font-bold">{user.uniqueTracks}</div>
            <div class="text-[10px] text-gray-500">Tracks</div>
          </div>
          <div class="rounded-lg bg-white/5 p-2 text-center">
            <Users class="mx-auto mb-1 h-4 w-4 text-purple-400" />
            <div class="text-xs font-bold">{user.uniqueArtists}</div>
            <div class="text-[10px] text-gray-500">Artists</div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
