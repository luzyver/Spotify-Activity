<script lang="ts">
  import NowPlayingCard from '$lib/components/NowPlayingCard.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import HistoryCard from '$lib/components/HistoryCard.svelte';
  import Button from '$lib/components/Button.svelte';

  import { ITEMS_PER_PAGE } from '$lib/config';
  import type { NowPlayingBuddy, HistoryItem } from '$lib/types';
  import { onMount } from 'svelte';
  import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-svelte';

  let { data } = $props();

  let nowPlaying = $state<NowPlayingBuddy[]>(data?.nowPlaying ?? []);
  let allHistory = $state<HistoryItem[]>(data?.history ?? []); // Data dari API (hari ini)
  let combinedHistory = $state<HistoryItem[]>(data?.allHistory ?? []); // All history from API
  let currentPage = $state(1);
  let activeTab = $state<'home' | 'recent' | 'history'>('home');
  let isLoadingHistorical = $state(false); // Already loaded from API
  let showCompactHeader = $state(false);

  const TABS = [
    { id: 'home', label: 'Home' },
    { id: 'recent', label: 'Recent' },
    { id: 'history', label: 'History' },
  ] as const;
  const TAB_META = {
    home: {
      title: 'Spotify Activity',
      subtitle: 'Your music dashboard',
      compact: 'Home · Now playing',
    },
    recent: {
      title: 'Recent Plays',
      subtitle: 'Tracks played today',
      compact: 'Recent · Today',
    },
    history: {
      title: 'History',
      subtitle: 'All your listening history',
      compact: 'History · All time',
    },
  } as const;

  onMount(() => {
    const handleScroll = () => {
      showCompactHeader = window.scrollY > 80;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
  }
</script>

<div class="min-h-screen bg-black text-white">
  <!-- Main Content Area -->
  <div class="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 sm:px-6 lg:px-8">
    <!-- Modern Header -->
    <header class="border-b border-white/10 bg-black px-6 py-4">
      <div class="relative flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <!-- Spotify Logo with glow effect -->
          <div class="relative">
            <div class="absolute inset-0 rounded-xl bg-[#1db954]/10 blur-lg"></div>
            <div class="relative rounded-xl bg-[#1db954] p-2.5 shadow-md">
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
              {TAB_META[activeTab].title}
            </h1>
            <p class="mt-0.5 text-sm text-gray-400">
              {TAB_META[activeTab].subtitle}
            </p>
          </div>
        </div>

        <div
          class="mt-4 hidden items-center gap-2 rounded-full bg-white/5 p-1 text-xs font-medium sm:mt-0 sm:flex sm:text-sm"
        >
          {#each TABS as tab (tab.id)}
            <button
              onclick={() => (activeTab = tab.id)}
              class="rounded-full px-3 py-1.5 transition-colors {activeTab === tab.id
                ? 'bg-white text-black'
                : 'text-gray-200 hover:bg-white/10'}"
            >
              {tab.label}
            </button>
          {/each}
        </div>
      </div>
    </header>
    {#if showCompactHeader}
      <div
        class="sticky top-0 z-20 border-b border-white/10 bg-black/90 px-4 py-2 backdrop-blur-md sm:hidden"
      >
        <div class="flex items-center justify-between text-xs">
          <div class="font-semibold">
            {TAB_META[activeTab].compact}
          </div>
          <div class="flex gap-1">
            {#each TABS as tab (tab.id)}
              <button
                onclick={() => (activeTab = tab.id)}
                class="rounded-full px-2 py-1 {activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'text-gray-200 hover:bg-white/10'}"
              >
                {tab.label}
              </button>
            {/each}
          </div>
        </div>
      </div>
    {/if}

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
      {/if}
    </div>
  </div>
  <!-- Bottom Navigation - Mobile Only -->
  <nav
    class="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/90 backdrop-blur-md sm:hidden"
  >
    <div class="flex items-center justify-around px-4 py-2 text-xs">
      {#each TABS as tab (tab.id)}
        <button
          onclick={() => (activeTab = tab.id)}
          class="flex flex-col items-center gap-1 {activeTab === tab.id
            ? 'text-white'
            : 'text-gray-400'}"
        >
          <span
            class="h-1 w-6 rounded-full {activeTab === tab.id ? 'bg-[#1db954]' : 'bg-transparent'}"
          ></span>
          <span>{tab.label}</span>
        </button>
      {/each}
    </div>
  </nav>
</div>
