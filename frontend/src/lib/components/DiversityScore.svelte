<script lang="ts">
  import type { ListeningInsights } from '$lib/utils/analytics';

  let { insights }: { insights: ListeningInsights } = $props();

  const diversityLevel = $derived.by(() => {
    const score = insights.artistDiversity || 0;
    if (score > 15)
      return {
        label: 'Very Diverse',
        color: 'text-purple-400',
        bg: 'from-purple-500/20',
        emoji: '🌈',
      };
    if (score > 10)
      return { label: 'Diverse', color: 'text-blue-400', bg: 'from-blue-500/20', emoji: '🎨' };
    if (score > 5)
      return { label: 'Moderate', color: 'text-yellow-400', bg: 'from-yellow-500/20', emoji: '🎭' };
    return { label: 'Focused', color: 'text-orange-400', bg: 'from-orange-500/20', emoji: '🎯' };
  });

  const repeatLevel = $derived.by(() => {
    const rate = insights.repeatRate || 0;
    if (rate > 70) return { label: 'High Repeat', color: 'text-red-400', emoji: '🔁' };
    if (rate > 50) return { label: 'Moderate Repeat', color: 'text-yellow-400', emoji: '🔄' };
    return { label: 'Low Repeat', color: 'text-green-400', emoji: '✨' };
  });
</script>

<div class="space-y-4">
  <h3 class="text-lg font-semibold sm:text-xl">Listening Habits</h3>

  <div class="grid gap-3 sm:grid-cols-2">
    <!-- Artist Diversity -->
    <div class="rounded-lg border border-white/5 bg-white/[0.02] p-4">
      <div class="mb-3 flex items-center justify-between">
        <span class="text-xs font-medium uppercase tracking-wider text-gray-500"
          >Artist Diversity</span
        >
        <span class="text-lg">{diversityLevel.emoji}</span>
      </div>

      <div class="mb-1 text-2xl font-semibold">{insights.artistDiversity ?? 0}%</div>
      <div class="mb-3 text-sm text-gray-400">{diversityLevel.label}</div>

      <div class="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          class="h-full bg-[#1db954]"
          style="width: {Math.min(insights.artistDiversity ?? 0, 100)}%"
        ></div>
      </div>

      <p class="mt-2 text-xs text-gray-600">
        {insights.uniqueArtists} different artists
      </p>
    </div>

    <!-- Repeat Rate -->
    <div class="rounded-lg border border-white/5 bg-white/[0.02] p-4">
      <div class="mb-3 flex items-center justify-between">
        <span class="text-xs font-medium uppercase tracking-wider text-gray-500">Repeat Rate</span>
        <span class="text-lg">{repeatLevel.emoji}</span>
      </div>

      <div class="mb-1 text-2xl font-semibold">{insights.repeatRate ?? 0}%</div>
      <div class="mb-3 text-sm text-gray-400">{repeatLevel.label}</div>

      <div class="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          class="h-full bg-[#1db954]"
          style="width: {Math.min(insights.repeatRate ?? 0, 100)}%"
        ></div>
      </div>

      <p class="mt-2 text-xs text-gray-600">
        {insights.uniqueTracks} unique tracks
      </p>
    </div>
  </div>
</div>
