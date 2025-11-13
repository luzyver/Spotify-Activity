<script lang="ts">
  import Equalizer from '$lib/components/Equalizer.svelte';
  import NowPlayingCard from '$lib/components/NowPlayingCard.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import HistoryCard from '$lib/components/HistoryCard.svelte';
  import Button from '$lib/components/Button.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
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
  import { filterAndSortHistory, viewMode } from '$lib/stores/filters';
  import { toggleTheme } from '$lib/stores/theme';
  import { achievements, checkAchievements } from '$lib/stores/achievements';
  import { loadAllHistoryStatic } from '$lib/utils/historyLoaderStatic';
  import { onMount } from 'svelte';
  import {
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    Music2,
    TrendingUp,
    Award,
    Calendar,
    BarChart3,
    Maximize2,
  } from 'lucide-svelte';

  let { data } = $props();

  let nowPlaying = $state<NowPlayingBuddy[]>(data?.nowPlaying ?? []);
  let allHistory = $state<HistoryItem[]>(data?.history ?? []);
  let combinedHistory = $state<HistoryItem[]>(data?.history ?? []); // For insights/achievements
  let currentPage = $state(1);
  let activeTab = $state<'overview' | 'insights' | 'achievements' | 'calendar'>('overview');
  let isFullscreen = $state(false);
  let isLoadingHistorical = $state(true);

  // Load historical data on mount
  onMount(async () => {
    try {
      const historicalData = await loadAllHistoryStatic();

      // Combine and deduplicate
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

  // Filtered history
  let filteredHistoryStore = $derived(filterAndSortHistory(allHistory));
  let filteredHistory = $state<HistoryItem[]>([]);

  $effect(() => {
    const unsubscribe = filteredHistoryStore.subscribe((value) => {
      filteredHistory = value;
      currentPage = 1; // Reset to first page when filters change
    });
    return unsubscribe;
  });

  let totalPages = $derived(Math.ceil(filteredHistory.length / ITEMS_PER_PAGE));
  let paginatedHistory = $derived(
    filteredHistory.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  );

  let insights = $derived(calculateInsights(combinedHistory));

  // Check achievements with combined history
  $effect(() => {
    checkAchievements(combinedHistory);
  });

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    document
      .getElementById('history-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    if (isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }
</script>

<div class="relative z-10 min-h-screen">
  <!-- Header -->
  <header
    class="sticky top-0 z-30 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-md dark:bg-[#0a0a0a]/95"
  >
    <div class="w-full px-3 py-3 sm:px-6 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 sm:gap-3">
          <svg class="h-7 w-7 flex-shrink-0 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="#1db954">
            <path
              d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
            />
          </svg>
          <div>
            <h1 class="gradient-text text-base font-black sm:text-xl lg:text-2xl">
              Spotify Activity
            </h1>
            <p class="hidden text-[10px] text-gray-500 sm:block sm:text-xs">Real-time listening</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            onclick={toggleFullscreen}
            class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:border-[#1db954]/50 hover:bg-white/10"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 class="h-4 w-4" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  </header>

  <!-- Main Layout -->
  <div class="w-full px-3 py-4 sm:px-6 sm:py-6">
    <div class="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:gap-8">
      <!-- Sidebar - Now Playing -->
      <aside class="space-y-4 sm:space-y-6 lg:col-span-4 xl:col-span-3">
        <section class="space-y-4 sm:space-y-6 lg:sticky lg:top-24">
          <div class="mb-3 flex items-center gap-2 sm:mb-4">
            <Equalizer />
            <h2 class="text-base font-bold sm:text-lg lg:text-xl">Now Playing</h2>
            {#if nowPlaying.length > 0}
              <span
                class="ml-auto rounded-full bg-[#1db954]/20 px-2 py-1 text-[10px] text-[#1db954] sm:text-xs"
              >
                {nowPlaying.length}
              </span>
            {/if}
          </div>

          {#if nowPlaying.length === 0}
            <EmptyState />
          {:else}
            <div class="scrollbar-thin max-h-[600px] space-y-2 overflow-y-auto pr-2">
              {#each nowPlaying as buddy, index (buddy.user?.uri ?? index)}
                <NowPlayingCard {buddy} {index} />
              {/each}
            </div>
          {/if}
        </section>
      </aside>

      <!-- Main Content -->
      <main class="lg:col-span-8 xl:col-span-9">
        <!-- Tabs -->
        <div class="mb-6 flex gap-2 overflow-x-auto">
          <button
            onclick={() => (activeTab = 'overview')}
            class="flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm transition-all {activeTab ===
            'overview'
              ? 'border-[#1db954] bg-[#1db954]/20 text-[#1db954]'
              : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'}"
          >
            <Music2 class="h-4 w-4" />
            Overview
          </button>
          <button
            onclick={() => (activeTab = 'insights')}
            class="flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm transition-all {activeTab ===
            'insights'
              ? 'border-[#1db954] bg-[#1db954]/20 text-[#1db954]'
              : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'}"
          >
            <TrendingUp class="h-4 w-4" />
            Insights
          </button>
          <button
            onclick={() => (activeTab = 'achievements')}
            class="flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm transition-all {activeTab ===
            'achievements'
              ? 'border-[#1db954] bg-[#1db954]/20 text-[#1db954]'
              : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'}"
          >
            <Award class="h-4 w-4" />
            Achievements
            {#if $achievements.filter((a) => a.unlocked).length > 0}
              <span class="rounded-full bg-[#1db954] px-2 py-0.5 text-xs">
                {$achievements.filter((a) => a.unlocked).length}
              </span>
            {/if}
          </button>
          <button
            onclick={() => (activeTab = 'calendar')}
            class="flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm transition-all {activeTab ===
            'calendar'
              ? 'border-[#1db954] bg-[#1db954]/20 text-[#1db954]'
              : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'}"
          >
            <Calendar class="h-4 w-4" />
            Calendar
          </button>
        </div>

        <!-- Tab Content -->
        {#if activeTab === 'overview'}
          <!-- Search & Filters -->
          <div class="mb-6 space-y-4">
            <SearchBar />
            <FilterBar history={allHistory} />
          </div>

          <!-- History Section -->
          <section id="history-section">
            <div class="mb-4 flex items-center justify-between sm:mb-6">
              <div class="flex items-center gap-2">
                <Music2 class="h-4 w-4 text-[#1db954] sm:h-5 sm:w-5" />
                <h2 class="text-base font-bold sm:text-lg lg:text-xl">Recent Plays</h2>
              </div>
              <p class="text-[10px] text-gray-400 sm:text-xs lg:text-sm">
                {filteredHistory.length} tracks
              </p>
            </div>

            {#if filteredHistory.length > 0}
              <!-- Grid/List View -->
              <div
                class="mb-4 sm:mb-6 {$viewMode === 'list'
                  ? 'space-y-3'
                  : $viewMode === 'compact'
                    ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                    : 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}"
              >
                {#each paginatedHistory as item, index (item.uri + ':' + item.timestamp)}
                  <HistoryCard
                    {item}
                    {index}
                    {currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    viewMode={$viewMode}
                  />
                {/each}
              </div>
            {:else}
              <div class="py-16 text-center">
                <div class="mb-4 text-6xl">🔍</div>
                <p class="mb-2 text-lg text-gray-400">No results found</p>
                <p class="text-sm text-gray-600">Try adjusting your filters</p>
              </div>
            {/if}

            <!-- Pagination -->
            {#if totalPages > 1}
              <div class="mt-4 flex items-center justify-center gap-1.5 sm:mt-6 sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === 1}
                  onclick={() => goToPage(1)}
                  class="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronsLeft class="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === 1}
                  onclick={() => goToPage(currentPage - 1)}
                  class="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronLeft class="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                <div
                  class="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2"
                >
                  <span class="text-xs font-medium text-gray-300 sm:text-sm">{currentPage}</span>
                  <span class="mx-1 text-[10px] text-gray-500 sm:mx-1.5 sm:text-xs">/</span>
                  <span class="text-xs font-medium text-gray-400 sm:text-sm">{totalPages}</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onclick={() => goToPage(currentPage + 1)}
                  class="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronRight class="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onclick={() => goToPage(totalPages)}
                  class="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronsRight class="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            {/if}
          </section>
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

            <div class="glass-card rounded-xl p-6">
              <div class="mb-6 flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-bold">Achievements</h3>
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
      </main>
    </div>
  </div>

  <!-- Footer -->
  <footer class="mt-12 border-t border-white/5 py-8 text-center text-xs text-gray-500">
    <p class="mb-1">Powered by Spotify Web API</p>
    <p class="text-[10px] text-gray-600">Updates every 10 minutes</p>
  </footer>
</div>
