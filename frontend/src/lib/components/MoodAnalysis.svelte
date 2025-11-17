<script lang="ts">
  import type { HistoryItem } from '$lib/types';
  import { Smile, Meh, Frown, Zap, Heart } from 'lucide-svelte';

  let { history }: { history: HistoryItem[] } = $props();

  // Mock mood analysis - in real app, you'd use Spotify's audio features API
  let moodData = $derived(() => {
    const moods = [
      { name: 'Happy', icon: Smile, color: '#FFD700', percentage: 35 },
      { name: 'Energetic', icon: Zap, color: '#FF6B6B', percentage: 25 },
      { name: 'Romantic', icon: Heart, color: '#FF69B4', percentage: 20 },
      { name: 'Chill', icon: Meh, color: '#4ECDC4', percentage: 15 },
      { name: 'Melancholic', icon: Frown, color: '#9B59B6', percentage: 5 },
    ];

    return moods;
  });

  let dominantMood = $derived(moodData()[0]);
</script>

<div class="glass-card rounded-xl p-6">
  <div class="mb-6">
    <h3 class="mb-2 text-xl font-bold">Mood Analysis</h3>
    <p class="text-sm text-gray-400">Based on your listening patterns</p>
  </div>

  <div class="mb-6 text-center">
    <div
      class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full"
      style="background: {dominantMood.color}20"
    >
      {#each [dominantMood.icon] as Icon (Icon)}
        <Icon class="h-12 w-12" style="color: {dominantMood.color}" />
      {/each}
    </div>
    <div class="text-2xl font-bold" style="color: {dominantMood.color}">
      {dominantMood.name}
    </div>
    <div class="text-sm text-gray-400">Your dominant mood</div>
  </div>

  <div class="space-y-3">
    {#each moodData() as mood, i (mood.name)}
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            {#each [mood.icon] as Icon (Icon)}
              <Icon class="h-4 w-4" style="color: {mood.color}" />
            {/each}
            <span class="text-sm font-medium">{mood.name}</span>
          </div>
          <span class="text-sm text-gray-400">{mood.percentage}%</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            class="h-full rounded-full transition-all duration-700"
            style="width: {mood.percentage}%; background: {mood.color}"
          ></div>
        </div>
      </div>
    {/each}
  </div>
</div>
