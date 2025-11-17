<script lang="ts">
  import type { HistoryItem } from '$lib/types';
  import { Target, TrendingUp, Award } from 'lucide-svelte';

  let { history }: { history: HistoryItem[] } = $props();

  interface Goal {
    id: string;
    title: string;
    description: string;
    current: number;
    target: number;
    icon: any;
    color: string;
  }

  let goals = $derived<Goal[]>([
    {
      id: 'weekly-plays',
      title: 'Weekly Goal',
      description: 'Listen to 50 tracks this week',
      current: Math.min(history.length, 50),
      target: 50,
      icon: Target,
      color: '#1db954',
    },
    {
      id: 'new-artists',
      title: 'Discover Artists',
      description: 'Find 5 new artists',
      current: Math.min(new Set(history.map((h) => h.artist)).size, 5),
      target: 5,
      icon: TrendingUp,
      color: '#4ECDC4',
    },
    {
      id: 'daily-streak',
      title: 'Daily Streak',
      description: 'Listen every day for a week',
      current: Math.min(new Set(history.map((h) => new Date(h.timestamp).toDateString())).size, 7),
      target: 7,
      icon: Award,
      color: '#FFD700',
    },
  ]);
</script>

<div class="glass-card rounded-xl p-6">
  <div class="mb-6 flex items-center gap-2">
    <Target class="h-5 w-5 text-[#1db954]" />
    <h3 class="text-xl font-bold">Your Goals</h3>
  </div>

  <div class="space-y-4">
    {#each goals as goal, i (goal.id)}
      <div class="space-y-2">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full"
              style="background: {goal.color}20"
            >
              {#each [goal.icon] as Icon (Icon)}
                <Icon class="h-5 w-5" style="color: {goal.color}" />
              {/each}
            </div>
            <div>
              <h4 class="font-bold">{goal.title}</h4>
              <p class="text-xs text-gray-400">{goal.description}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold" style="color: {goal.color}">
              {goal.current}/{goal.target}
            </div>
            <div class="text-xs text-gray-400">
              {Math.round((goal.current / goal.target) * 100)}%
            </div>
          </div>
        </div>

        <div class="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            class="h-full rounded-full transition-all duration-700"
            style="width: {Math.min(
              (goal.current / goal.target) * 100,
              100
            )}%; background: {goal.color}"
          ></div>
        </div>

        {#if goal.current >= goal.target}
          <div class="flex items-center gap-2 text-sm" style="color: {goal.color}">
            <Award class="h-4 w-4" />
            <span class="font-medium">Goal completed! 🎉</span>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
