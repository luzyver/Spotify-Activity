<script lang="ts">
  import NowPlayingCard from '$lib/components/NowPlayingCard.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import HistoryCard from '$lib/components/HistoryCard.svelte';
  import Button from '$lib/components/Button.svelte';
  import InsightsCard from '$lib/components/InsightsCard.svelte';
  import HourlyChart from '$lib/components/HourlyChart.svelte';
  import CalendarView from '$lib/components/CalendarView.svelte';
  import TopArtistsChart from '$lib/components/TopArtistsChart.svelte';
  import AchievementsCard from '$lib/components/AchievementsCard.svelte';
  import CompareView from '$lib/components/CompareView.svelte';
  import TimeOfDayChart from '$lib/components/TimeOfDayChart.svelte';
  import MoodAnalysis from '$lib/components/MoodAnalysis.svelte';
  import WeeklySummary from '$lib/components/WeeklySummary.svelte';
  import ListeningHeatmap from '$lib/components/ListeningHeatmap.svelte';
  import DiversityScore from '$lib/components/DiversityScore.svelte';
  import PeriodComparison from '$lib/components/PeriodComparison.svelte';
  import QuickStats from '$lib/components/QuickStats.svelte';
  import TopTracksChart from '$lib/components/TopTracksChart.svelte';

  import { ITEMS_PER_PAGE } from '$lib/config';
  import type { NowPlayingBuddy, HistoryItem } from '$lib/types';
  import { calculateInsights } from '$lib/utils/analytics';
  import { checkAchievements } from '$lib/stores/achievements';
  import { checkGoals } from '$lib/stores/goals';
  import GoalsCard from '$lib/components/GoalsCard.svelte';
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
    checkGoals(combinedHistory, combinedHistory);
  });

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
  }
</script>

<div class="flex h-screen max-w-full overflow-hidden pb-16 lg:pb-0">
  <!-- Sidebar - Desktop Only -->
  <aside class="hidden w-72 flex-col gap-3 bg-black p-3 lg:flex">
    <!-- Navigation Menu -->
    <div
      class="flex-1 overflow-y-auto rounded-xl border border-white/5 bg-gradient-to-b from-[#1a1a1a] to-[#121212] p-4"
    >
      <nav class="space-y-2">
        <!-- Home -->
        <button
          onclick={() => (activeTab = 'home')}
          class="group relative flex w-full items-center gap-4 overflow-hidden rounded-xl px-4 py-4 text-left transition-all duration-300 {activeTab ===
          'home'
            ? 'scale-[1.02] bg-gradient-to-r from-[#1db954] to-[#1ed760] text-white shadow-xl shadow-[#1db954]/20'
            : 'text-gray-400 hover:scale-[1.01] hover:bg-white/5 hover:text-white'}"
        >
          <div
            class="rounded-lg p-2 {activeTab === 'home'
              ? 'bg-white/20'
              : 'bg-white/5 group-hover:bg-white/10'}"
          >
            <svg
              class="h-5 w-5 transition-transform group-hover:rotate-12"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
              />
            </svg>
          </div>
          <div class="flex-1">
            <div class="text-sm font-bold">Home</div>
            <div class="text-xs opacity-70">Main dashboard</div>
          </div>
          {#if activeTab === 'home'}
            <div class="h-2 w-2 animate-pulse rounded-full bg-white"></div>
          {/if}
        </button>

        <!-- Recent Plays -->
        <button
          onclick={() => (activeTab = 'recent')}
          class="group relative flex w-full items-center gap-4 overflow-hidden rounded-xl px-4 py-4 text-left transition-all duration-300 {activeTab ===
          'recent'
            ? 'scale-[1.02] bg-gradient-to-r from-[#1db954] to-[#1ed760] text-white shadow-xl shadow-[#1db954]/20'
            : 'text-gray-400 hover:scale-[1.01] hover:bg-white/5 hover:text-white'}"
        >
          <div
            class="rounded-lg p-2 {activeTab === 'recent'
              ? 'bg-white/20'
              : 'bg-white/5 group-hover:bg-white/10'}"
          >
            <svg
              class="h-5 w-5 transition-transform group-hover:rotate-12"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="flex-1">
            <div class="text-sm font-bold">Recent Plays</div>
            <div class="text-xs opacity-70">Today's tracks</div>
          </div>
          {#if activeTab === 'recent'}
            <div class="h-2 w-2 animate-pulse rounded-full bg-white"></div>
          {/if}
        </button>

        <!-- History -->
        <button
          onclick={() => (activeTab = 'history')}
          class="group relative flex w-full items-center gap-4 overflow-hidden rounded-xl px-4 py-4 text-left transition-all duration-300 {activeTab ===
          'history'
            ? 'scale-[1.02] bg-gradient-to-r from-[#1db954] to-[#1ed760] text-white shadow-xl shadow-[#1db954]/20'
            : 'text-gray-400 hover:scale-[1.01] hover:bg-white/5 hover:text-white'}"
        >
          <div
            class="rounded-lg p-2 {activeTab === 'history'
              ? 'bg-white/20'
              : 'bg-white/5 group-hover:bg-white/10'}"
          >
            <svg
              class="h-5 w-5 transition-transform group-hover:rotate-12"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="flex-1">
            <div class="text-sm font-bold">History</div>
            <div class="text-xs opacity-70">All time plays</div>
          </div>
          {#if activeTab === 'history'}
            <div class="h-2 w-2 animate-pulse rounded-full bg-white"></div>
          {/if}
        </button>

        <!-- Divider -->
        <div class="my-3 border-t border-white/10"></div>

        <!-- Insights -->
        <button
          onclick={() => (activeTab = 'insights')}
          class="group relative flex w-full items-center gap-4 overflow-hidden rounded-xl px-4 py-4 text-left transition-all duration-300 {activeTab ===
          'insights'
            ? 'scale-[1.02] bg-gradient-to-r from-[#1db954] to-[#1ed760] text-white shadow-xl shadow-[#1db954]/20'
            : 'text-gray-400 hover:scale-[1.01] hover:bg-white/5 hover:text-white'}"
        >
          <div
            class="rounded-lg p-2 {activeTab === 'insights'
              ? 'bg-white/20'
              : 'bg-white/5 group-hover:bg-white/10'}"
          >
            <TrendingUp class="h-5 w-5 transition-transform group-hover:rotate-12" />
          </div>
          <div class="flex-1">
            <div class="text-sm font-bold">Insights</div>
            <div class="text-xs opacity-70">Analytics & stats</div>
          </div>
          {#if activeTab === 'insights'}
            <div class="h-2 w-2 animate-pulse rounded-full bg-white"></div>
          {/if}
        </button>

        <!-- Achievements -->
        <button
          onclick={() => (activeTab = 'achievements')}
          class="group relative flex w-full items-center gap-4 overflow-hidden rounded-xl px-4 py-4 text-left transition-all duration-300 {activeTab ===
          'achievements'
            ? 'scale-[1.02] bg-gradient-to-r from-[#1db954] to-[#1ed760] text-white shadow-xl shadow-[#1db954]/20'
            : 'text-gray-400 hover:scale-[1.01] hover:bg-white/5 hover:text-white'}"
        >
          <div
            class="rounded-lg p-2 {activeTab === 'achievements'
              ? 'bg-white/20'
              : 'bg-white/5 group-hover:bg-white/10'}"
          >
            <Award class="h-5 w-5 transition-transform group-hover:rotate-12" />
          </div>
          <div class="flex-1">
            <div class="text-sm font-bold">Achievements</div>
            <div class="text-xs opacity-70">Goals & badges</div>
          </div>
          {#if activeTab === 'achievements'}
            <div class="h-2 w-2 animate-pulse rounded-full bg-white"></div>
          {/if}
        </button>

        <!-- Calendar -->
        <button
          onclick={() => (activeTab = 'calendar')}
          class="group relative flex w-full items-center gap-4 overflow-hidden rounded-xl px-4 py-4 text-left transition-all duration-300 {activeTab ===
          'calendar'
            ? 'scale-[1.02] bg-gradient-to-r from-[#1db954] to-[#1ed760] text-white shadow-xl shadow-[#1db954]/20'
            : 'text-gray-400 hover:scale-[1.01] hover:bg-white/5 hover:text-white'}"
        >
          <div
            class="rounded-lg p-2 {activeTab === 'calendar'
              ? 'bg-white/20'
              : 'bg-white/5 group-hover:bg-white/10'}"
          >
            <Calendar class="h-5 w-5 transition-transform group-hover:rotate-12" />
          </div>
          <div class="flex-1">
            <div class="text-sm font-bold">Calendar</div>
            <div class="text-xs opacity-70">Activity view</div>
          </div>
          {#if activeTab === 'calendar'}
            <div class="h-2 w-2 animate-pulse rounded-full bg-white"></div>
          {/if}
        </button>
      </nav>
    </div>
  </aside>

  <!-- Main Content Area -->
  <div
    class="flex flex-1 flex-col overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a]"
  >
    <!-- Modern Header -->
    <header
      class="relative overflow-hidden border-b border-white/5 bg-gradient-to-r from-[#1a1a1a] via-[#1f1f1f] to-[#1a1a1a] px-6 py-6 backdrop-blur-xl"
    >
      <!-- Animated background gradient -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-[#1db954]/5 via-transparent to-[#1db954]/5 opacity-50"
      ></div>

      <div class="relative flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- Spotify Logo with glow effect -->
          <div class="relative">
            <div class="absolute inset-0 rounded-xl bg-[#1db954]/20 blur-xl"></div>
            <div
              class="relative rounded-xl bg-gradient-to-br from-[#1db954] to-[#1ed760] p-3 shadow-lg"
            >
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="white">
                <path
                  d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
                />
              </svg>
            </div>
          </div>

          <!-- Title with subtitle -->
          <div>
            <h1 class="text-2xl font-bold text-white sm:text-3xl">
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
            <p class="mt-0.5 text-sm text-gray-400">
              {#if activeTab === 'home'}
                Your music dashboard
              {:else if activeTab === 'recent'}
                Tracks played today
              {:else if activeTab === 'history'}
                All your listening history
              {:else if activeTab === 'insights'}
                Discover your music patterns
              {:else if activeTab === 'achievements'}
                Track your progress
              {:else if activeTab === 'calendar'}
                Your listening calendar
              {/if}
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content with better spacing -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
      {#if activeTab === 'home'}
        <div class="mx-auto max-w-7xl space-y-10">
          <!-- Now Playing Section -->
          <section>
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-white sm:text-3xl">Now Playing</h2>
                <p class="mt-1 text-sm text-gray-400">See what your friends are listening to</p>
              </div>
              {#if nowPlaying.length > 0}
                <div class="rounded-full border border-[#1db954]/30 bg-[#1db954]/20 px-4 py-2">
                  <span class="text-sm font-medium text-[#1db954]">{nowPlaying.length} active</span>
                </div>
              {/if}
            </div>

            {#if nowPlaying.length === 0}
              <div
                class="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-12"
              >
                <EmptyState />
              </div>
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
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-white sm:text-3xl">Recent Plays</h2>
                <p class="mt-1 text-sm text-gray-400">Your latest tracks</p>
              </div>
              <button
                onclick={() => (activeTab = 'recent')}
                class="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <span>Show all</span>
                <ChevronRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {#if allHistory.length > 0}
              <div
                class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              >
                {#each allHistory.slice(0, 12) as item, index (item.uri + ':' + item.timestamp)}
                  <HistoryCard {item} {index} currentPage={1} itemsPerPage={12} viewMode="grid" />
                {/each}
              </div>
            {:else}
              <div
                class="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-16 text-center"
              >
                <div class="mb-4 text-6xl">🎵</div>
                <p class="mb-2 text-lg font-medium text-gray-300">No recent plays</p>
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
            <div class="space-y-8">
              <!-- === OVERVIEW SECTION === -->
              <!-- Quick Stats -->
              <QuickStats history={combinedHistory} />

              <!-- Main Insights -->
              <InsightsCard {insights} />

              <!-- === TIME-BASED ANALYSIS === -->
              <!-- Weekly Summary & Diversity Score (1 col on mobile, 2 cols on desktop) -->
              <div class="grid gap-6 sm:gap-8 md:grid-cols-2">
                <WeeklySummary history={combinedHistory} />
                <DiversityScore {insights} />
              </div>

              <!-- Period Comparison -->
              <PeriodComparison history={combinedHistory} />

              <!-- === TOP CONTENT === -->
              <!-- Top Tracks & Top Artists (1 col on mobile, 2 cols on desktop) -->
              <div class="grid gap-6 sm:gap-8 md:grid-cols-2">
                <TopTracksChart history={combinedHistory} />
                <TopArtistsChart history={combinedHistory} />
              </div>

              <!-- === LISTENING PATTERNS === -->
              <!-- Hourly Distribution -->
              <HourlyChart history={combinedHistory} />

              <!-- Activity Heatmap -->
              <ListeningHeatmap history={combinedHistory} />

              <!-- Time of Day Distribution -->
              <TimeOfDayChart history={combinedHistory} />

              <!-- === ADVANCED ANALYSIS === -->
              <!-- Mood Analysis -->
              <MoodAnalysis history={combinedHistory} />

              <!-- Compare View -->
              <CompareView history={combinedHistory} />
            </div>
          {/if}
        </div>
      {:else if activeTab === 'achievements'}
        <div class="space-y-6">
          <!-- Goals Section -->
          <GoalsCard />

          <!-- Achievements Section -->
          <AchievementsCard />
        </div>
      {:else if activeTab === 'calendar'}
        <div class="space-y-6">
          <CalendarView history={combinedHistory} />
        </div>
      {/if}
    </div>
  </div>

  <!-- Bottom Navigation - Mobile Only -->
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-gradient-to-t from-[#0a0a0a] to-[#121212] backdrop-blur-xl lg:hidden"
  >
    <div class="safe-area-inset-bottom flex items-center justify-around px-1 py-2">
      <button
        onclick={() => (activeTab = 'home')}
        class="group relative flex flex-col items-center gap-1 px-3 py-2 transition-all {activeTab ===
        'home'
          ? 'text-white'
          : 'text-gray-400'}"
      >
        {#if activeTab === 'home'}
          <div class="absolute inset-0 rounded-xl bg-[#1db954]/10"></div>
        {/if}
        <div
          class="relative rounded-lg p-1.5 transition-all {activeTab === 'home'
            ? 'bg-[#1db954]/20'
            : 'group-hover:bg-white/5'}"
        >
          <svg
            class="h-5 w-5 transition-transform group-active:scale-90"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
            />
          </svg>
        </div>
        <span class="relative text-[10px] font-medium">{activeTab === 'home' ? 'Home' : ''}</span>
        {#if activeTab === 'home'}
          <div
            class="absolute -bottom-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[#1db954]"
          ></div>
        {/if}
      </button>

      <button
        onclick={() => (activeTab = 'recent')}
        class="group relative flex flex-col items-center gap-1 px-3 py-2 transition-all {activeTab ===
        'recent'
          ? 'text-white'
          : 'text-gray-400'}"
      >
        {#if activeTab === 'recent'}
          <div class="absolute inset-0 rounded-xl bg-[#1db954]/10"></div>
        {/if}
        <div
          class="relative rounded-lg p-1.5 transition-all {activeTab === 'recent'
            ? 'bg-[#1db954]/20'
            : 'group-hover:bg-white/5'}"
        >
          <svg
            class="h-5 w-5 transition-transform group-active:scale-90"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <span class="relative text-[10px] font-medium"
          >{activeTab === 'recent' ? 'Recent' : ''}</span
        >
        {#if activeTab === 'recent'}
          <div
            class="absolute -bottom-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[#1db954]"
          ></div>
        {/if}
      </button>

      <button
        onclick={() => (activeTab = 'history')}
        class="group relative flex flex-col items-center gap-1 px-3 py-2 transition-all {activeTab ===
        'history'
          ? 'text-white'
          : 'text-gray-400'}"
      >
        {#if activeTab === 'history'}
          <div class="absolute inset-0 rounded-xl bg-[#1db954]/10"></div>
        {/if}
        <div
          class="relative rounded-lg p-1.5 transition-all {activeTab === 'history'
            ? 'bg-[#1db954]/20'
            : 'group-hover:bg-white/5'}"
        >
          <svg
            class="h-5 w-5 transition-transform group-active:scale-90"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <span class="relative text-[10px] font-medium"
          >{activeTab === 'history' ? 'History' : ''}</span
        >
        {#if activeTab === 'history'}
          <div
            class="absolute -bottom-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[#1db954]"
          ></div>
        {/if}
      </button>

      <button
        onclick={() => (activeTab = 'insights')}
        class="group relative flex flex-col items-center gap-1 px-3 py-2 transition-all {activeTab ===
        'insights'
          ? 'text-white'
          : 'text-gray-400'}"
      >
        {#if activeTab === 'insights'}
          <div class="absolute inset-0 rounded-xl bg-[#1db954]/10"></div>
        {/if}
        <div
          class="relative rounded-lg p-1.5 transition-all {activeTab === 'insights'
            ? 'bg-[#1db954]/20'
            : 'group-hover:bg-white/5'}"
        >
          <TrendingUp class="h-5 w-5 transition-transform group-active:scale-90" />
        </div>
        <span class="relative text-[10px] font-medium"
          >{activeTab === 'insights' ? 'Insights' : ''}</span
        >
        {#if activeTab === 'insights'}
          <div
            class="absolute -bottom-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[#1db954]"
          ></div>
        {/if}
      </button>

      <button
        onclick={() => (activeTab = 'achievements')}
        class="group relative flex flex-col items-center gap-1 px-3 py-2 transition-all {activeTab ===
        'achievements'
          ? 'text-white'
          : 'text-gray-400'}"
      >
        {#if activeTab === 'achievements'}
          <div class="absolute inset-0 rounded-xl bg-[#1db954]/10"></div>
        {/if}
        <div
          class="relative rounded-lg p-1.5 transition-all {activeTab === 'achievements'
            ? 'bg-[#1db954]/20'
            : 'group-hover:bg-white/5'}"
        >
          <Award class="h-5 w-5 transition-transform group-active:scale-90" />
        </div>
        <span class="relative text-[10px] font-medium"
          >{activeTab === 'achievements' ? 'Awards' : ''}</span
        >
        {#if activeTab === 'achievements'}
          <div
            class="absolute -bottom-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[#1db954]"
          ></div>
        {/if}
      </button>

      <button
        onclick={() => (activeTab = 'calendar')}
        class="group relative flex flex-col items-center gap-1 px-3 py-2 transition-all {activeTab ===
        'calendar'
          ? 'text-white'
          : 'text-gray-400'}"
      >
        {#if activeTab === 'calendar'}
          <div class="absolute inset-0 rounded-xl bg-[#1db954]/10"></div>
        {/if}
        <div
          class="relative rounded-lg p-1.5 transition-all {activeTab === 'calendar'
            ? 'bg-[#1db954]/20'
            : 'group-hover:bg-white/5'}"
        >
          <Calendar class="h-5 w-5 transition-transform group-active:scale-90" />
        </div>
        <span class="relative text-[10px] font-medium"
          >{activeTab === 'calendar' ? 'Calendar' : ''}</span
        >
        {#if activeTab === 'calendar'}
          <div
            class="absolute -bottom-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[#1db954]"
          ></div>
        {/if}
      </button>
    </div>
  </nav>
</div>
