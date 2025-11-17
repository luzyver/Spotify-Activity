<script lang="ts">
  import type { HistoryItem } from '$lib/types';

  let { history }: { history: HistoryItem[] } = $props();

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const heatmapData = $derived.by(() => {
    const data: Record<string, Record<number, number>> = {};
    days.forEach((day) => {
      data[day] = {};
      hours.forEach((hour) => {
        data[day][hour] = 0;
      });
    });

    history.forEach((item) => {
      const date = new Date(item.timestamp);
      const day = days[date.getDay()];
      const localHour = date.getHours(); // Use local timezone
      data[day][localHour]++;
    });

    return data;
  });

  const maxValue = $derived(
    Math.max(...Object.values(heatmapData).flatMap((dayData) => Object.values(dayData)), 1)
  );

  function getIntensity(value: number): string {
    const intensity = value / maxValue;
    if (intensity === 0) return 'bg-white/5';
    if (intensity < 0.25) return 'bg-[#1db954]/20';
    if (intensity < 0.5) return 'bg-[#1db954]/40';
    if (intensity < 0.75) return 'bg-[#1db954]/60';
    return 'bg-[#1db954]/80';
  }
</script>

<div class="space-y-4">
  <h3 class="text-lg font-semibold sm:text-xl">Activity Heatmap</h3>

  <div class="overflow-x-auto rounded-lg border border-white/5 bg-white/[0.02] p-3 sm:p-4">
    <div class="min-w-[600px]">
      <!-- Hour labels (local timezone) -->
      <div class="mb-2 flex gap-0.5 pl-10">
        {#each [0, 6, 12, 18] as hour (hour)}
          <div class="flex-1 text-center text-[10px] text-gray-600">
            {hour.toString().padStart(2, '0')}:00
          </div>
        {/each}
      </div>

      <!-- Heatmap grid -->
      <div class="space-y-0.5">
        {#each days as day (day)}
          <div class="flex items-center gap-0.5">
            <div class="w-9 text-[10px] font-medium text-gray-500">{day}</div>
            <div class="flex flex-1 gap-0.5">
              {#each hours as hour (hour)}
                {@const value = heatmapData[day][hour]}
                <div
                  class="group relative aspect-square flex-1 rounded-sm {getIntensity(
                    value
                  )} transition-all hover:scale-110"
                >
                  {#if value > 0}
                    <div
                      class="absolute -top-9 left-1/2 z-20 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <div
                        class="whitespace-nowrap rounded bg-black/90 px-1.5 py-0.5 text-[10px] font-medium text-white"
                      >
                        {day}
                        {hour.toString().padStart(2, '0')}:00<br />
                        {value} plays
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <!-- Legend -->
      <div class="mt-3 flex items-center justify-center gap-1.5">
        <span class="text-[10px] text-gray-600">Less</span>
        <div class="flex gap-0.5">
          <div class="h-2.5 w-2.5 rounded-sm bg-white/5"></div>
          <div class="h-2.5 w-2.5 rounded-sm bg-[#1db954]/20"></div>
          <div class="h-2.5 w-2.5 rounded-sm bg-[#1db954]/40"></div>
          <div class="h-2.5 w-2.5 rounded-sm bg-[#1db954]/60"></div>
          <div class="h-2.5 w-2.5 rounded-sm bg-[#1db954]/80"></div>
        </div>
        <span class="text-[10px] text-gray-600">More</span>
      </div>
    </div>
  </div>
</div>
