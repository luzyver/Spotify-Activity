<script lang="ts">
  import { getMonthCalendarData } from '$lib/utils/historyLoaderStatic';
  import type { HistoryItem } from '$lib/types';
  import { onMount } from 'svelte';

  let { history }: { history: HistoryItem[] } = $props();

  // Combined history (current + historical)
  let allHistory = $state<HistoryItem[]>(history);
  let isLoading = $state(true);

  // Load historical data on mount
  onMount(async () => {
    try {
      // Use the history passed from parent (already combined)
      allHistory = history;
    } catch (error) {
      allHistory = history;
    } finally {
      isLoading = false;
    }
  });

  // Month selector
  let currentDate = $state(new Date());
  let selectedMonth = $state(currentDate.getMonth());
  let selectedYear = $state(currentDate.getFullYear());

  // Get data for selected month
  let monthlyData = $derived(() => {
    const data = getMonthCalendarData(allHistory, selectedYear, selectedMonth);

    return data;
  });

  let dailyData = $derived(monthlyData());
  let maxPlays = $derived(Math.max(...dailyData.map((d) => d.plays), 1));

  // Month navigation
  function previousMonth() {
    if (selectedMonth === 0) {
      selectedMonth = 11;
      selectedYear--;
    } else {
      selectedMonth--;
    }
  }

  function nextMonth() {
    if (selectedMonth === 11) {
      selectedMonth = 0;
      selectedYear++;
    } else {
      selectedMonth++;
    }
  }

  function goToToday() {
    const today = new Date();
    selectedMonth = today.getMonth();
    selectedYear = today.getFullYear();
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  function getIntensity(plays: number): string {
    const ratio = plays / maxPlays;
    if (ratio === 0) return 'bg-white/5';
    if (ratio < 0.25) return 'bg-[#1db954]/20';
    if (ratio < 0.5) return 'bg-[#1db954]/40';
    if (ratio < 0.75) return 'bg-[#1db954]/60';
    return 'bg-[#1db954]/80';
  }

  // Generate calendar grid for the month
  let calendarGrid = $derived(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();

    const grid: Array<{ date: number; plays: number; tracks: any[] } | null> = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(selectedYear, selectedMonth, day).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      const dayData = dailyData.find((d) => d.date === dateStr);
      grid.push({
        date: day,
        plays: dayData?.plays || 0,
        tracks: dayData?.tracks || [],
      });
    }

    // Group into weeks
    const weeks: (typeof grid)[] = [];
    for (let i = 0; i < grid.length; i += 7) {
      weeks.push(grid.slice(i, i + 7));
    }

    return weeks;
  });

  let totalDays = $derived(dailyData.length);
  let activeDays = $derived(dailyData.filter((d) => d.plays > 0).length);
  let totalPlays = $derived(dailyData.reduce((sum, d) => sum + d.plays, 0));
  let avgPlaysPerDay = $derived(totalPlays / activeDays || 0);
</script>

<div class="glass-card rounded-xl p-6">
  {#if isLoading}
    <div class="flex items-center justify-center py-12">
      <div class="text-center">
        <div
          class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#1db954] border-t-transparent"
        ></div>
        <p class="text-sm" style="color: #9ca3af">Loading calendar data...</p>
      </div>
    </div>
  {:else}
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-bold">Activity Calendar</h3>
        <p class="text-xs" style="color: #9ca3af">
          {activeDays} active days
        </p>
      </div>

      <!-- Month Navigator -->
      <div class="flex items-center gap-2">
        <button
          onclick={previousMonth}
          class="rounded-lg border border-white/10 bg-white/5 p-2 transition-all hover:bg-white/10"
          aria-label="Previous month"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onclick={goToToday}
          class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium transition-all hover:bg-white/10"
        >
          {monthNames[selectedMonth]}
          {selectedYear}
        </button>

        <button
          onclick={nextMonth}
          class="rounded-lg border border-white/10 bg-white/5 p-2 transition-all hover:bg-white/10"
          aria-label="Next month"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Stats Summary - Compact -->
    <div class="mb-3 flex gap-2 text-xs">
      <div class="flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2 py-1">
        <span class="font-bold text-[#1db954]">{totalPlays}</span>
        <span style="color: #9ca3af">plays</span>
      </div>
      <div class="flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2 py-1">
        <span class="font-bold">{avgPlaysPerDay.toFixed(1)}</span>
        <span style="color: #9ca3af">avg</span>
      </div>
      <div class="flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2 py-1">
        <span class="font-bold">{Math.max(...dailyData.map((d) => d.plays))}</span>
        <span style="color: #9ca3af">best</span>
      </div>
    </div>

    <!-- Calendar Grid - Monthly View -->
    <div class="mb-3">
      <div class="mb-1.5 grid grid-cols-7 gap-1">
        {#each ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as day (day)}
          <div class="text-center text-[10px] font-medium text-gray-500">
            {day}
          </div>
        {/each}
      </div>

      <div class="space-y-1">
        {#each calendarGrid() as week, weekIndex (weekIndex)}
          <div class="grid grid-cols-7 gap-1">
            {#each week as cell, dayIndex (weekIndex * 7 + dayIndex)}
              {@const globalIndex = weekIndex * 7 + dayIndex}
              {#if cell === null}
                <!-- Empty cell -->
                <div class="aspect-square"></div>
              {:else}
                <div
                  class="group relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded border border-[#1db954] p-1 transition-all hover:z-10 hover:scale-105 {getIntensity(
                    cell.plays
                  )}"
                  style="border-color: {cell.plays === 0 ? 'rgba(255,255,255,0.1)' : ''}"
                  title="{monthNames[
                    selectedMonth
                  ]} {cell.date}, {selectedYear}: {cell.plays} plays"
                >
                  <!-- Date number -->
                  <div class="text-xs font-medium text-white">
                    {cell.date}
                  </div>

                  <!-- Play count -->
                  {#if cell.plays > 0}
                    <div class="mt-0.5 text-[8px] font-bold text-[#1db954]">
                      {cell.plays}
                    </div>
                  {/if}

                  <!-- Tooltip -->
                  {#if cell.plays > 0}
                    <div
                      class="pointer-events-none absolute -top-28 left-1/2 z-20 w-48 -translate-x-1/2 rounded-lg border border-white/20 bg-[#1f2937] p-3 opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
                    >
                      <div class="mb-1 text-sm font-bold">
                        {monthNames[selectedMonth]}
                        {cell.date}, {selectedYear}
                      </div>
                      <div class="text-lg font-bold text-[#1db954]">{cell.plays} plays</div>
                      {#if cell.tracks.length > 0}
                        <div class="mt-2 border-t border-white/10 pt-2">
                          <div class="text-xs text-gray-400">Top track:</div>
                          <div class="line-clamp-1 text-xs font-medium">
                            {cell.tracks[0].track}
                          </div>
                          <div class="text-xs text-gray-400">
                            {cell.tracks[0].artist}
                          </div>
                        </div>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
        {/each}
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center justify-between text-[10px] text-gray-500">
      <span>Less</span>
      <div class="flex gap-0.5">
        <div class="h-2.5 w-2.5 rounded {getIntensity(0)}"></div>
        <div class="h-2.5 w-2.5 rounded {getIntensity(maxPlays * 0.2)}"></div>
        <div class="h-2.5 w-2.5 rounded {getIntensity(maxPlays * 0.4)}"></div>
        <div class="h-2.5 w-2.5 rounded {getIntensity(maxPlays * 0.6)}"></div>
        <div class="h-2.5 w-2.5 rounded {getIntensity(maxPlays * 0.8)}"></div>
      </div>
      <span>More</span>
    </div>
  {/if}
</div>
