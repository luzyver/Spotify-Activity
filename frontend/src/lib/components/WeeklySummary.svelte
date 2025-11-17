<script lang="ts">
  import type { HistoryItem } from '$lib/types';

  let { history }: { history: HistoryItem[] } = $props();

  const weeklyStats = $derived.by(() => {
    const now = new Date();

    // Start of this week (Monday 00:00:00)
    const dayOfWeek = now.getDay();
    const mondayDate = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), mondayDate);

    const thisWeek = history.filter((item) => new Date(item.timestamp) >= startOfWeek);

    if (thisWeek.length === 0) {
      return {
        totalPlays: 0,
        uniqueTracks: 0,
        totalMinutes: 0,
        topDay: 'N/A',
        topDayPlays: 0,
      };
    }

    const uniqueTracks = new Set(thisWeek.map((item) => item.uri)).size;
    const totalMinutes = Math.round(thisWeek.length * 3.5); // Assuming avg 3.5 min per track

    // Format time as hours and minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const formattedTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Find top day
    const dayPlays: Record<string, number> = {};
    thisWeek.forEach((item) => {
      const day = new Date(item.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      dayPlays[day] = (dayPlays[day] || 0) + 1;
    });

    const topDayEntry = Object.entries(dayPlays).sort((a, b) => b[1] - a[1])[0];

    return {
      totalPlays: thisWeek.length,
      uniqueTracks,
      listeningTime: formattedTime,
      topDay: topDayEntry?.[0] || 'N/A',
      topDayPlays: topDayEntry?.[1] || 0,
    };
  });

  const stats = $derived([
    {
      label: 'Total Plays',
      value: weeklyStats.totalPlays,
    },
    {
      label: 'Unique Tracks',
      value: weeklyStats.uniqueTracks,
    },
    {
      label: 'Listening Time',
      value: weeklyStats.listeningTime,
    },
    {
      label: 'Top Day',
      value: weeklyStats.topDay.slice(0, 3),
      subValue: `${weeklyStats.topDayPlays} plays`,
    },
  ]);
</script>

<div class="space-y-4">
  <h3 class="text-lg font-semibold sm:text-xl">This Week</h3>

  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {#each stats as stat (stat.label)}
      <div class="rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <div class="text-xs font-medium text-gray-500">{stat.label}</div>
        <div class="mt-1 text-xl font-semibold">{stat.value}</div>
        {#if stat.subValue}
          <div class="mt-0.5 text-xs text-gray-600">{stat.subValue}</div>
        {/if}
      </div>
    {/each}
  </div>
</div>
