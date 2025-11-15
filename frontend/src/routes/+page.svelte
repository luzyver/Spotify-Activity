<script lang="ts">
  import NowPlayingCard from '$lib/components/NowPlayingCard.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import HistoryCard from '$lib/components/HistoryCard.svelte';
  import Button from '$lib/components/Button.svelte';
  import InsightsCard from '$lib/components/InsightsCard.svelte';
  import HourlyChart from '$lib/components/HourlyChart.svelte';
  import CalendarView from '$lib/components/CalendarView.svelte';
  import TopArtistsChart from '$lib/components/TopArtistsChart.svelte';
  import AchievementBadge from '$lib/components/AchievementBadge.svelte';
  import GoalsWidget from '$lib/components/GoalsWidget.svelte';
  import CompareView from '$lib/components/CompareView.svelte';
  import TimeOfDayChart from '$lib/components/TimeOfDayChart.svelte';
  import MoodAnalysis from '$lib/components/MoodAnalysis.svelte';

  import { ITEMS_PER_PAGE } from '$lib/config';
  import type { NowPlayingBuddy, HistoryItem } from '$lib/types';
  import { calculateInsights } from '$lib/utils/analytics';
  import { achievements, checkAchievements } from '$lib/stores/achievements';
  import { loadAllHistoryStatic } from '$lib/utils/historyLoaderStatic';
  import { onMount } from 'svelte';
  import {
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    TrendingUp,
    Award,
    Calendar,
  } from 'lucide-svelte';

  let { data } = $props();

  let nowPlaying = $state<NowPlayingBuddy[]>(data?.nowPlaying ?? []);
  let allHistory = $state<HistoryItem[]>(data?.history ?? []); // Data dari API (hari ini)
  let combinedHistory = $state<HistoryItem[]>(data?.history ?? []); // Recent + Archive
  let currentPage = $state(1);
  let activeTab = $state<'home' | 'recent' | 'history' | 'insights' | 'achievements' | 'calendar'>(
    'home'
  );
  let isLoadingHistorical = $state(true);

  onMount(async () => {
    try {
      const historicalData = await loadAllHistoryStatic();
      const combined = [...allHistory, ...historicalData];
      const unique = Array.from(
        new Map(combined.map((item) => [`${item.uri}-${item.timestamp}`, item])).values()
      );
      combinedHistory = unique;
    } catch (error) {
      combinedHistory = allHistory;
    } finally {
      isLoadingHistorical = false;
    }
  });

  // For history tab - use combinedHistory
  let filteredCombinedHistory = $derived(
    [...combinedHistory].sort((a, b) => b.timestamp - a.timestamp)
  );

  $effect(() => {
    // Reset to first page whenever the filtered history changes
    filteredCombinedHistory;
    currentPage = 1;
  });

  let totalPages = $derived(Math.ceil(filteredCombinedHistory.length / ITEMS_PER_PAGE));
  let paginatedHistory = $derived(
    filteredCombinedHistory.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  );

  let insights = $derived(calculateInsights(combinedHistory));

  $effect(() => {
    checkAchievements(combinedHistory);
  });

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
  }
</script>

<div class="flex h-screen overflow-hidden pb-16 lg:pb-0">
  <!-- Sidebar - Desktop Only -->
  <aside class="hidden w-64 flex-col gap-2 bg-black p-2 lg:flex">
    <!-- Main Navigation -->
    <div class="rounded-lg bg-[#121212] p-4">
      <nav class="space-y-4">
        <button
          onclick={() => (activeTab = 'home')}
          class="flex w-full items-center gap-4 rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors {activeTab ===
          'home'
            ? 'text-white'
            : 'text-gray-400 hover:text-white'}"
        >
          <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
            />
          </svg>
          <span>Home</span>
        </button>
      </nav>
    </div>

    <!-- Library -->
    <div class="flex-1 overflow-y-auto rounded-lg bg-[#121212] p-4">
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-3 text-gray-400">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="text-sm font-semibold">Your Library</span>
        </div>
      </div>

      <nav class="space-y-2">
        <button
          onclick={() => (activeTab = 'recent')}
          class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors {activeTab ===
          'recent'
            ? 'text-white'
            : 'text-gray-400 hover:text-white'}"
        >
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Recent Plays</span>
        </button>
        <button
          onclick={() => (activeTab = 'history')}
          class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors {activeTab ===
          'history'
            ? 'text-white'
            : 'text-gray-400 hover:text-white'}"
        >
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clip-rule="evenodd"
            />
          </svg>
          <span>History</span>
        </button>
        <button
          onclick={() => (activeTab = 'insights')}
          class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors {activeTab ===
          'insights'
            ? 'text-white'
            : 'text-gray-400 hover:text-white'}"
        >
          <TrendingUp class="h-5 w-5" />
          <span>Insights</span>
        </button>
        <button
          onclick={() => (activeTab = 'achievements')}
          class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors {activeTab ===
          'achievements'
            ? 'text-white'
            : 'text-gray-400 hover:text-white'}"
        >
          <Award class="h-5 w-5" />
          <span>Achievements</span>
        </button>
        <button
          onclick={() => (activeTab = 'calendar')}
          class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors {activeTab ===
          'calendar'
            ? 'text-white'
            : 'text-gray-400 hover:text-white'}"
        >
          <Calendar class="h-5 w-5" />
          <span>Calendar</span>
        </button>
      </nav>
    </div>
  </aside>

  <!-- Main Content Area -->
  <div class="flex flex-1 flex-col overflow-hidden bg-[#121212]">
    <!-- Header with gradient -->
    <header class="relative bg-gradient-to-b from-[#1f1f1f] to-[#121212] px-6 py-4">
      <!-- Header with Logo -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <svg class="h-8 w-8" viewBox="0 0 24 24" fill="#1db954">
            <path
              d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
            />
          </svg>
          <div>
            <h1 class="text-2xl font-bold">
              {#if activeTab === 'home'}
                Spotify Activity
              {:else if activeTab === 'recent'}
                Recent Plays
              {:else if activeTab === 'history'}
                History
              {:else if activeTab === 'insights'}
                Insights
              {:else if activeTab === 'achievements'}
                Achievements
              {:else if activeTab === 'calendar'}
                Calendar
              {/if}
            </h1>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto px-6 py-6">
      {#if activeTab === 'home'}
        <div class="space-y-8">
          <!-- Now Playing Section -->
          <section>
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-2xl font-bold">Now Playing</h2>
              {#if nowPlaying.length > 0}
                <span class="text-sm text-gray-400">{nowPlaying.length} active</span>
              {/if}
            </div>

            {#if nowPlaying.length === 0}
              <EmptyState />
            {:else}
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {#each nowPlaying as buddy, index (buddy.user?.uri ?? index)}
                  <NowPlayingCard {buddy} {index} />
                {/each}
              </div>
            {/if}
          </section>

          <!-- Recent 10 Plays -->
          <section>
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-2xl font-bold">Recent Plays</h2>
              <button
                onclick={() => (activeTab = 'recent')}
                class="text-sm text-gray-400 hover:text-white hover:underline"
              >
                Show all
              </button>
            </div>

            {#if allHistory.length > 0}
              <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {#each allHistory.slice(0, 10) as item, index (item.uri + ':' + item.timestamp)}
                  <HistoryCard {item} {index} currentPage={1} itemsPerPage={10} viewMode="grid" />
                {/each}
              </div>
            {:else}
              <div class="py-16 text-center">
                <div class="mb-4 text-6xl">🎵</div>
                <p class="mb-2 text-lg text-gray-400">No recent plays</p>
                <p class="text-sm text-gray-500">Start listening to see your history</p>
              </div>
            {/if}
          </section>
        </div>
      {:else if activeTab === 'recent'}
        <div class="space-y-8">
          <!-- All Recent Plays (Today from API) -->
          <section>
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-2xl font-bold">Today's Plays</h2>
              <p class="text-sm text-gray-400">{allHistory.length} tracks</p>
            </div>

            {#if allHistory.length > 0}
              <div
                class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              >
                {#each allHistory as item, index (item.uri + ':' + item.timestamp)}
                  <HistoryCard
                    {item}
                    {index}
                    currentPage={1}
                    itemsPerPage={allHistory.length}
                    viewMode="grid"
                  />
                {/each}
              </div>
            {:else}
              <div class="py-16 text-center">
                <div class="mb-4 text-6xl">🎵</div>
                <p class="mb-2 text-lg text-gray-400">No plays today</p>
                <p class="text-sm text-gray-500">Start listening to see your history</p>
              </div>
            {/if}
          </section>
        </div>
      {:else if activeTab === 'history'}
        <div class="space-y-8">
          <!-- All History (Recent + Archive) -->
          <section>
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-2xl font-bold">All History</h2>
              <p class="text-sm text-gray-400">{filteredCombinedHistory.length} tracks</p>
            </div>

            {#if isLoadingHistorical}
              <div class="flex items-center justify-center py-12">
                <div class="text-center">
                  <div
                    class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#1db954] border-t-transparent"
                  ></div>
                  <p class="text-sm text-gray-400">Loading history...</p>
                </div>
              </div>
            {:else if filteredCombinedHistory.length > 0}
              <div
                class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              >
                {#each paginatedHistory as item, index (item.uri + ':' + item.timestamp)}
                  <HistoryCard
                    {item}
                    {index}
                    {currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    viewMode="grid"
                  />
                {/each}
              </div>
            {:else}
              <div class="py-16 text-center">
                <div class="mb-4 text-6xl">🔍</div>
                <p class="mb-2 text-lg text-gray-400">No history found</p>
                <p class="text-sm text-gray-500">Start listening to build your history</p>
              </div>
            {/if}

            <!-- Pagination -->
            {#if totalPages > 1}
              <div class="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === 1}
                  onclick={() => goToPage(1)}
                  class="h-10 w-10"
                >
                  <ChevronsLeft class="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === 1}
                  onclick={() => goToPage(currentPage - 1)}
                  class="h-10 w-10"
                >
                  <ChevronLeft class="h-4 w-4" />
                </Button>

                <div class="rounded-lg bg-white/10 px-4 py-2">
                  <span class="text-sm font-medium">{currentPage}</span>
                  <span class="mx-1.5 text-xs text-gray-500">/</span>
                  <span class="text-sm font-medium text-gray-400">{totalPages}</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onclick={() => goToPage(currentPage + 1)}
                  class="h-10 w-10"
                >
                  <ChevronRight class="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onclick={() => goToPage(totalPages)}
                  class="h-10 w-10"
                >
                  <ChevronsRight class="h-4 w-4" />
                </Button>
              </div>
            {/if}
          </section>
        </div>
      {:else if activeTab === 'insights'}
        <div class="space-y-6">
          {#if isLoadingHistorical}
            <div class="flex items-center justify-center py-12">
              <div class="text-center">
                <div
                  class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#1db954] border-t-transparent"
                ></div>
                <p class="text-sm text-gray-400">Loading insights...</p>
              </div>
            </div>
          {:else}
            <InsightsCard {insights} />
            <div class="grid gap-6 lg:grid-cols-2">
              <HourlyChart history={combinedHistory} />
              <TopArtistsChart history={combinedHistory} />
            </div>
            <div class="grid gap-6 lg:grid-cols-2">
              <TimeOfDayChart history={combinedHistory} />
              <MoodAnalysis history={combinedHistory} />
            </div>
            <CompareView history={combinedHistory} />
          {/if}
        </div>
      {:else if activeTab === 'achievements'}
        <div class="space-y-6">
          <GoalsWidget history={combinedHistory} />

          <div class="rounded-lg bg-[#181818] p-6">
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold">Achievements</h3>
                <p class="text-sm text-gray-400">
                  Unlocked {$achievements.filter((a) => a.unlocked).length} of {$achievements.length}
                </p>
              </div>
              <div class="text-3xl">🏆</div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {#each $achievements as achievement}
                <AchievementBadge {achievement} />
              {/each}
            </div>
          </div>
        </div>
      {:else if activeTab === 'calendar'}
        <div class="space-y-6">
          <CalendarView history={combinedHistory} />
        </div>
      {/if}
    </div>
  </div>

  <!-- Bottom Navigation - Mobile Only -->
  <nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#121212] lg:hidden">
    <div class="flex items-center justify-around px-2 py-2">
      <button
        onclick={() => (activeTab = 'home')}
        class="flex flex-col items-center gap-1 px-3 py-2 transition-colors {activeTab === 'home'
          ? 'text-white'
          : 'text-gray-400'}"
      >
        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
          />
        </svg>
        <span class="text-[10px] font-medium">Home</span>
      </button>

      <button
        onclick={() => (activeTab = 'recent')}
        class="flex flex-col items-center gap-1 px-3 py-2 transition-colors {activeTab === 'recent'
          ? 'text-white'
          : 'text-gray-400'}"
      >
        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="text-[10px] font-medium">Recent</span>
      </button>

      <button
        onclick={() => (activeTab = 'history')}
        class="flex flex-col items-center gap-1 px-3 py-2 transition-colors {activeTab === 'history'
          ? 'text-white'
          : 'text-gray-400'}"
      >
        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="text-[10px] font-medium">History</span>
      </button>

      <button
        onclick={() => (activeTab = 'insights')}
        class="flex flex-col items-center gap-1 px-3 py-2 transition-colors {activeTab ===
        'insights'
          ? 'text-white'
          : 'text-gray-400'}"
      >
        <TrendingUp class="h-6 w-6" />
        <span class="text-[10px] font-medium">Insights</span>
      </button>

      <button
        onclick={() => (activeTab = 'achievements')}
        class="flex flex-col items-center gap-1 px-3 py-2 transition-colors {activeTab ===
        'achievements'
          ? 'text-white'
          : 'text-gray-400'}"
      >
        <Award class="h-6 w-6" />
        <span class="text-[10px] font-medium">Awards</span>
      </button>

      <button
        onclick={() => (activeTab = 'calendar')}
        class="flex flex-col items-center gap-1 px-3 py-2 transition-colors {activeTab ===
        'calendar'
          ? 'text-white'
          : 'text-gray-400'}"
      >
        <Calendar class="h-6 w-6" />
        <span class="text-[10px] font-medium">Calendar</span>
      </button>
    </div>
  </nav>
</div>
