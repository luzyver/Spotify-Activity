<script lang="ts">
  import NowPlayingCard from '$lib/components/NowPlayingCard.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import HistoryCard from '$lib/components/HistoryCard.svelte';
  import Button from '$lib/components/Button.svelte';

  import { ITEMS_PER_PAGE } from '$lib/config';
  import type { NowPlayingBuddy, HistoryItem } from '$lib/types';
  import { onMount } from 'svelte';
  import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, LayoutGrid, List, Music } from 'lucide-svelte';
  import { loadHistoryBatch } from '$lib/utils/historyLoader';
  import { fade, fly } from 'svelte/transition';

  let { data } = $props();

  let nowPlaying = $state<NowPlayingBuddy[]>(data?.nowPlaying ?? []);
  let allHistory = $state<HistoryItem[]>(data?.history ?? []);
  let combinedHistory = $state<HistoryItem[]>(data?.allHistory ?? []);
  let currentPage = $state(1);
  let activeTab = $state<'home' | 'recent' | 'history'>('home');
  let isLoadingHistorical = $state(false);
  let archiveLoaded = $state(false);
  let loadingProgress = $state({ loaded: 0, total: 0 });
  let viewMode = $state<'grid' | 'list'>('grid');

  // Dynamic meta tags
  let pageTitle = $derived.by(() => {
    if (nowPlaying.length > 0) {
      const first = nowPlaying[0];
      return `Listening to ${first.track.name} • ${first.track.artist?.name || 'Unknown Artist'}`;
    }
    return "Rezz's Activity";
  });

  let pageDescription = $derived.by(() => {
    if (nowPlaying.length > 0) {
      const first = nowPlaying[0];
      return `Rezz is listening to ${first.track.name} by ${first.track.artist?.name || 'Unknown Artist'}.`;
    }
    return 'Check out my Spotify listening history.';
  });

  let pageImage = $derived.by(() => {
    if (nowPlaying.length > 0 && nowPlaying[0].track.imageUrl) {
      return nowPlaying[0].track.imageUrl;
    }
    return 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg';
  });

  async function loadArchiveHistory() {
    if (archiveLoaded || isLoadingHistorical) return;
    
    isLoadingHistorical = true;
    try {
      const archiveData = await loadHistoryBatch(5, (items, batchIndex) => {
        loadingProgress = { loaded: batchIndex + 1, total: Math.ceil(items.length / 5) };
      });
      
      const allData = [...combinedHistory, ...archiveData];
      const uniqueData = Array.from(
        new Map(allData.map(item => [`${item.userId}|${item.uri}|${item.timestamp}`, item])).values()
      );
      
      combinedHistory = uniqueData.sort((a, b) => b.timestamp - a.timestamp);
      archiveLoaded = true;
    } catch (error) {
      console.error('Failed to load archive history:', error);
    } finally {
      isLoadingHistorical = false;
    }
  }

  $effect(() => {
    if (activeTab === 'history' && !archiveLoaded) {
      loadArchiveHistory();
    }
  });

  const TABS = [
    { id: 'home', label: 'Home' },
    { id: 'recent', label: 'Recent' },
    { id: 'history', label: 'History' },
  ] as const;

  let filteredCombinedHistory = $derived(
    [...combinedHistory].sort((a, b) => b.timestamp - a.timestamp)
  );

  $effect(() => {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:image" content={pageImage} />
</svelte:head>

<div class="min-h-screen pb-20 sm:pb-0">
  <!-- Header / Navigation -->
  <header class="sticky top-0 z-40 border-b border-white/5 bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/60">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3">
        <div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#1db954] text-black shadow-lg shadow-[#1db954]/20">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
        <span class="hidden font-bold tracking-tight text-white sm:block">Spotify Activity</span>
      </div>

      <!-- Desktop Tabs -->
      <nav class="hidden gap-1 rounded-full bg-white/5 p-1 sm:flex">
        {#each TABS as tab}
          <button
            onclick={() => (activeTab = tab.id)}
            class="relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 {activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-white'}"
          >
            {#if activeTab === tab.id}
              <div
                class="absolute inset-0 rounded-full bg-white shadow-sm"
                transition:fade={{ duration: 200 }}
              ></div>
            {/if}
            <span class="relative z-10">{tab.label}</span>
          </button>
        {/each}
      </nav>

      <!-- View Toggle (Desktop) -->
      <div class="hidden items-center gap-2 sm:flex">
        <button 
          onclick={() => viewMode = 'grid'}
          class="p-2 rounded-lg transition-colors {viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}"
        >
          <LayoutGrid class="h-4 w-4" />
        </button>
        <button 
          onclick={() => viewMode = 'list'}
          class="p-2 rounded-lg transition-colors {viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}"
        >
          <List class="h-4 w-4" />
        </button>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    {#if activeTab === 'home'}
      <div in:fade={{ duration: 300 }} class="space-y-12">
        <!-- Hero Section -->
        <section>
          <div class="mb-6 flex items-end justify-between">
            <div>
              <h2 class="text-3xl font-bold text-white tracking-tight">Now Playing</h2>
              <p class="mt-1 text-gray-400">Live activity from connected accounts</p>
            </div>
          </div>

          {#if nowPlaying.length === 0}
            <div class="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
              <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <Music class="h-8 w-8 text-gray-500" />
              </div>
              <h3 class="text-lg font-medium text-white">Nothing playing right now</h3>
              <p class="mt-1 text-gray-400">Check back later to see live activity</p>
            </div>
          {:else}
            <div class="grid gap-6 lg:grid-cols-2">
              {#each nowPlaying as buddy, index}
                <NowPlayingCard {buddy} {index} />
              {/each}
            </div>
          {/if}
        </section>

        <!-- Recent Section -->
        <section>
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-white">Recently Played</h2>
              <p class="text-sm text-gray-400">Latest tracks from today</p>
            </div>
            <button
              onclick={() => activeTab = 'recent'}
              class="text-sm font-medium text-[#1db954] hover:text-[#1ed760] hover:underline"
            >
              View all
            </button>
          </div>

          {#if allHistory.length > 0}
            <div class="grid gap-4 {viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1'}">
              {#each allHistory.slice(0, 10) as item, index}
                <HistoryCard 
                  {item} 
                  {index} 
                  currentPage={1} 
                  itemsPerPage={10} 
                  viewMode={viewMode} 
                />
              {/each}
            </div>
          {:else}
            <EmptyState />
          {/if}
        </section>
      </div>

    {:else if activeTab === 'recent'}
      <div in:fade={{ duration: 300 }} class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-white">Today's History</h2>
          <div class="text-sm text-gray-400">{allHistory.length} tracks</div>
        </div>

        {#if allHistory.length > 0}
          <div class="grid gap-4 {viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1'}">
            {#each allHistory as item, index}
              <HistoryCard 
                {item} 
                {index} 
                currentPage={1} 
                itemsPerPage={allHistory.length} 
                viewMode={viewMode} 
              />
            {/each}
          </div>
        {:else}
          <div class="py-20 text-center">
            <p class="text-gray-400">No tracks played today.</p>
          </div>
        {/if}
      </div>

    {:else if activeTab === 'history'}
      <div in:fade={{ duration: 300 }} class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-white">Full History</h2>
          <div class="text-sm text-gray-400">{filteredCombinedHistory.length} tracks</div>
        </div>

        {#if isLoadingHistorical && filteredCombinedHistory.length === 0}
          <div class="flex flex-col items-center justify-center py-20 space-y-4">
            <div class="h-10 w-10 animate-spin rounded-full border-4 border-[#1db954] border-t-transparent"></div>
            <p class="text-gray-400">Loading full history...</p>
          </div>
        {:else if filteredCombinedHistory.length > 0}
          <div class="grid gap-4 {viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1'}">
            {#each paginatedHistory as item, index}
              <HistoryCard 
                {item} 
                {index} 
                {currentPage} 
                itemsPerPage={ITEMS_PER_PAGE} 
                viewMode={viewMode} 
              />
            {/each}
          </div>
          
          <!-- Pagination -->
          {#if totalPages > 1}
            <div class="mt-12 flex items-center justify-center gap-2">
              <button
                class="rounded-lg p-2 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent"
                disabled={currentPage === 1}
                onclick={() => goToPage(1)}
              >
                <ChevronsLeft class="h-5 w-5" />
              </button>
              
              <button
                class="rounded-lg p-2 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent"
                disabled={currentPage === 1}
                onclick={() => goToPage(currentPage - 1)}
              >
                <ChevronLeft class="h-5 w-5" />
              </button>

              <span class="px-4 text-sm font-medium text-gray-400">
                Page <span class="text-white">{currentPage}</span> of {totalPages}
              </span>

              <button
                class="rounded-lg p-2 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent"
                disabled={currentPage === totalPages}
                onclick={() => goToPage(currentPage + 1)}
              >
                <ChevronRight class="h-5 w-5" />
              </button>
              
              <button
                class="rounded-lg p-2 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent"
                disabled={currentPage === totalPages}
                onclick={() => goToPage(totalPages)}
              >
                <ChevronsRight class="h-5 w-5" />
              </button>
            </div>
          {/if}
        {:else}
           <div class="py-20 text-center">
            <p class="text-gray-400">No history found.</p>
          </div>
        {/if}
      </div>
    {/if}
  </main>

  <!-- Mobile Navigation -->
  <nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/95 backdrop-blur-xl sm:hidden pb-safe">
    <div class="flex items-center justify-around px-2 py-3">
      {#each TABS as tab}
        <button
          onclick={() => (activeTab = tab.id)}
          class="flex flex-col items-center gap-1 rounded-lg px-4 py-1 transition-colors {activeTab === tab.id ? 'text-white' : 'text-gray-500'}"
        >
          <div class="relative">
            {#if activeTab === tab.id}
              <span class="absolute -inset-2 rounded-full bg-white/5 blur-sm" transition:fade></span>
            {/if}
            <span class="relative text-sm font-medium">{tab.label}</span>
          </div>
          {#if activeTab === tab.id}
            <div class="h-1 w-1 rounded-full bg-[#1db954]" transition:fade></div>
          {/if}
        </button>
      {/each}
    </div>
  </nav>
</div>

<style>
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 20px);
  }
</style>
