<script lang="ts">
  import type { ListeningInsights } from '$lib/utils/analytics';
  import { TrendingUp, Music, Users, Clock, Flame, Target } from 'lucide-svelte';

  let { insights }: { insights: ListeningInsights } = $props();

  const stats = $derived([
    {
      label: 'Total Plays',
      value: insights.totalPlays,
      icon: Music,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Unique Tracks',
      value: insights.uniqueTracks,
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Artists',
      value: insights.uniqueArtists,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Favorite Time',
      value: insights.favoriteTime,
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Streak',
      value: `${insights.listeningStreak} days`,
      icon: Flame,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Discovery',
      value: `${insights.discoveryScore}%`,
      icon: Target,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
    },
  ]);
</script>

<div class="glass-card rounded-xl p-6">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h3 class="text-xl font-bold">Your Music Insights</h3>
      <p class="text-sm text-gray-400">Personality: {insights.musicPersonality}</p>
    </div>
    <div class="rounded-full bg-[#1db954]/20 px-4 py-2">
      <span class="text-sm font-bold text-[#1db954]">{insights.avgPlaysPerDay} plays/day</span>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
    {#each stats as stat, i (stat.label)}
      <div
        class="group rounded-lg border border-white/10 {stat.bg} p-4 transition-all hover:scale-105 hover:border-white/20"
      >
        {#each [stat.icon] as Icon (Icon)}
          <Icon class="mb-2 h-5 w-5 {stat.color} transition-transform group-hover:scale-110" />
        {/each}
        <div class="text-lg font-bold">{stat.value}</div>
        <div class="text-xs text-gray-400">{stat.label}</div>
      </div>
    {/each}
  </div>

  <!-- Top Artist & Track -->
  <div class="mt-6 grid gap-4 sm:grid-cols-2">
    <div class="rounded-lg border border-white/10 bg-white/5 p-4">
      <div class="mb-2 text-xs font-medium text-gray-400">Top Artist</div>
      <div class="text-lg font-bold">{insights.topArtist.name}</div>
      <div class="text-sm text-gray-400">{insights.topArtist.plays} plays</div>
    </div>
    <div class="rounded-lg border border-white/10 bg-white/5 p-4">
      <div class="mb-2 text-xs font-medium text-gray-400">Top Track</div>
      <div class="line-clamp-1 text-lg font-bold">{insights.topTrack.name}</div>
      <div class="text-sm text-gray-400">
        {insights.topTrack.artist} • {insights.topTrack.plays} plays
      </div>
    </div>
  </div>
</div>
