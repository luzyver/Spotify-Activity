<script lang="ts">
  import type { ListeningInsights } from '$lib/utils/analytics';
  import { Music, Users, Clock, Flame, Target, Disc3 } from 'lucide-svelte';

  let { insights }: { insights: ListeningInsights } = $props();

  const stats = $derived([
    { label: 'Total Plays', value: insights.totalPlays, icon: Music },
    { label: 'Unique Tracks', value: insights.uniqueTracks, icon: Disc3 },
    { label: 'Artists', value: insights.uniqueArtists, icon: Users },
    { label: 'Favorite Time', value: insights.favoriteTime, icon: Clock },
    { label: 'Streak', value: `${insights.listeningStreak}d`, icon: Flame },
    { label: 'Discovery', value: `${insights.discoveryScore}%`, icon: Target },
  ]);
</script>

<div class="space-y-6">
  <!-- Header Section - Mobile Friendly -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold sm:text-3xl">Overview</h2>
      <p class="mt-1 text-xs text-gray-400 sm:text-sm">
        {insights.musicPersonality} • {insights.avgPlaysPerDay} plays/day
      </p>
    </div>
  </div>

  <!-- Stats Grid - Mobile Friendly (2 cols on mobile, 3 on tablet, 6 on desktop) -->
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
    {#each stats as stat (stat.label)}
      <div
        class="group rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-white/10 hover:bg-white/[0.04] sm:p-4"
      >
        {#each [stat.icon] as Icon (Icon)}
          <Icon class="mb-2 h-4 w-4 text-gray-400" />
        {/each}
        <div class="text-lg font-semibold sm:text-xl">{stat.value}</div>
        <div class="mt-0.5 text-[10px] text-gray-500 sm:text-xs">{stat.label}</div>
      </div>
    {/each}
  </div>
</div>
