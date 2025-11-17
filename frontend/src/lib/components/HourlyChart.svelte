<script lang="ts">
  import { getHourlyDistribution } from '$lib/utils/analytics';
  import type { HistoryItem } from '$lib/types';

  let { history }: { history: HistoryItem[] } = $props();

  let hourlyData = $derived(getHourlyDistribution(history));
  let maxPlays = $derived(Math.max(...hourlyData.map((d) => d.plays), 1));
</script>

<div class="glass-card rounded-xl p-6">
  <h3 class="mb-6 text-xl font-bold">Listening by Hour</h3>

  <div class="flex items-end justify-between gap-1">
    {#each hourlyData as data, i (data.hour)}
      <div class="group flex flex-1 flex-col items-center gap-2">
        <div class="relative w-full">
          <div
            class="w-full rounded-t-lg bg-gradient-to-t from-[#1db954] to-[#1ed760] transition-all group-hover:from-[#1ed760] group-hover:to-[#1db954]"
            style="height: {data.plays > 0 ? (data.plays / maxPlays) * 120 : 2}px; min-height: 2px;"
          >
            {#if data.plays > 0}
              <div
                class="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
              >
                {data.plays} plays
              </div>
            {/if}
          </div>
        </div>
        <div class="text-[10px] text-gray-500">{data.hour}</div>
      </div>
    {/each}
  </div>

  <div class="mt-4 flex justify-between text-xs text-gray-500">
    <span>12 AM</span>
    <span>6 AM</span>
    <span>12 PM</span>
    <span>6 PM</span>
    <span>11 PM</span>
  </div>
</div>
