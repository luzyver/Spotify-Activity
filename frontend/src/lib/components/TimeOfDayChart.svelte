<script lang="ts">
  import type { HistoryItem } from '$lib/types';
  import { Sunrise, Sun, Sunset, Moon } from 'lucide-svelte';

  let { history }: { history: HistoryItem[] } = $props();

  let timeOfDayData = $derived(() => {
    const periods = {
      morning: { name: 'Morning', icon: Sunrise, color: '#FFD700', count: 0, hours: '5-11 AM' },
      afternoon: { name: 'Afternoon', icon: Sun, color: '#FF6B6B', count: 0, hours: '12-5 PM' },
      evening: { name: 'Evening', icon: Sunset, color: '#FF69B4', count: 0, hours: '6-9 PM' },
      night: { name: 'Night', icon: Moon, color: '#9B59B6', count: 0, hours: '10 PM-4 AM' },
    };

    history.forEach((item) => {
      // Convert to GMT+7 (WIB)
      const date = new Date(item.timestamp);
      const utcHour = date.getUTCHours();
      const wibHour = (utcHour + 7) % 24; // GMT+7

      if (wibHour >= 5 && wibHour < 12) periods.morning.count++;
      else if (wibHour >= 12 && wibHour < 18) periods.afternoon.count++;
      else if (wibHour >= 18 && wibHour < 22) periods.evening.count++;
      else periods.night.count++;
    });

    const total = Object.values(periods).reduce((sum, p) => sum + p.count, 0);

    return Object.values(periods).map((p) => ({
      ...p,
      percentage: total > 0 ? (p.count / total) * 100 : 0,
    }));
  });

  let favoriteTime = $derived(
    timeOfDayData().reduce((max, p) => (p.count > max.count ? p : max), timeOfDayData()[0])
  );
</script>

<div class="glass-card rounded-xl p-6">
  <div class="mb-6">
    <h3 class="mb-2 text-xl font-bold">Time of Day Preferences</h3>
    <p class="text-sm text-gray-400">When you listen most</p>
  </div>

  <div class="mb-6 text-center">
    <div
      class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
      style="background: {favoriteTime.color}20"
    >
      {#each [favoriteTime.icon] as Icon (Icon)}
        <Icon class="h-10 w-10" style="color: {favoriteTime.color}" />
      {/each}
    </div>
    <div class="text-xl font-bold" style="color: {favoriteTime.color}">
      {favoriteTime.name} Listener
    </div>
    <div class="text-sm text-gray-400">{favoriteTime.hours}</div>
  </div>

  <div class="grid grid-cols-2 gap-4">
    {#each timeOfDayData() as period, i (period.name)}
      <div
        class="rounded-lg border border-white/10 p-4 transition-all hover:scale-105"
        style="background: {period.color}10"
      >
        <div class="mb-3 flex items-center justify-between">
          {#each [period.icon] as Icon (Icon)}
            <Icon class="h-5 w-5" style="color: {period.color}" />
          {/each}
          <span class="text-sm font-bold" style="color: {period.color}">
            {period.percentage.toFixed(0)}%
          </span>
        </div>
        <div class="mb-1 text-sm font-bold">{period.name}</div>
        <div class="mb-2 text-xs text-gray-400">{period.hours}</div>
        <div class="text-xs text-gray-500">{period.count} plays</div>
      </div>
    {/each}
  </div>
</div>
