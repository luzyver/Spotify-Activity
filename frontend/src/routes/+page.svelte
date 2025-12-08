<script lang="ts">
  import NowPlayingCard from '$lib/components/NowPlayingCard.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import HistoryCard from '$lib/components/HistoryCard.svelte';
  import Button from '$lib/components/Button.svelte';

  import type { NowPlayingBuddy, HistoryItem } from '$lib/types';
  import { API_ENDPOINTS } from '$lib/config';

  import { LayoutGrid, List, Music, Search, X, Loader2, RefreshCw } from 'lucide-svelte';
  import { loadHistoryBatch } from '$lib/utils/historyLoader';
  import { fade, fly } from 'svelte/transition';
  import { onDestroy } from 'svelte';

  let { data } = $props();

  const ITEMS_PER_LOAD = 50;
  const REFRESH_INTERVAL = 30000; // 30 seconds

  let nowPlaying = $state<NowPlayingBuddy[]>(data?.nowPlaying ?? []);
  let allHistory = $state<HistoryItem[]>(data?.history ?? []);
  let combinedHistory = $state<HistoryItem[]>(data?.allHistory ?? []);
  let activeTab = $state<'home' | 'recent' | 'history'>('home');
  let isLoadingHistorical = $state(false);
  let archiveLoaded = $state(false);
  let loadingProgress = $state({ loaded: 0, total: 0 });
  let viewMode = $state<'grid' | 'list'>('grid');
  let searchQuery = $state('');
  
  // Auto-refresh state
  let isRefreshing = $state(false);
  let lastRefresh = $state<Date>(new Date());
  let refreshInterval: ReturnType<typeof setInterval> | null = null;
  
  // Toast notification state
  let toast = $state<{ message: string; type: 'info' | 'success'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });
  let toastTimeout: ReturnType<typeof setTimeout> | null = null;

  function showToast(message: string, type: 'info' | 'success' = 'info') {
    if (toastTimeout) clearTimeout(toastTimeout);
    toast = { message, type, visible: true };
    toastTimeout = setTimeout(() => {
      toast.visible = false;
    }, 4000);
  }

  // Auto-refresh Now Playing
  async function refreshNowPlaying() {
    if (isRefreshing) return;
    
    const previousPlaying = nowPlaying.map(p => `${p.user.uri}:${p.track.uri}`);
    
    isRefreshing = true;
    try {
      const res = await fetch(API_ENDPOINTS.LIVE, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const newPlaying: NowPlayingBuddy[] = data?.friends ?? [];
        
        // Check for new listeners or track changes
        for (const buddy of newPlaying) {
          const key = `${buddy.user.uri}:${buddy.track.uri}`;
          if (!previousPlaying.includes(key)) {
            // New track detected
            showToast(`🎵 ${buddy.user.name} is listening to ${buddy.track.name}`, 'success');
            break; // Only show one toast at a time
          }
        }
        
        // Check if someone stopped listening
        if (previousPlaying.length > 0 && newPlaying.length === 0) {
          showToast('No one is listening right now', 'info');
        }
        
        nowPlaying = newPlaying;
        lastRefresh = new Date();
      }
    } catch (error) {
      console.error('Failed to refresh now playing:', error);
    } finally {
      isRefreshing = false;
    }
  }

  // Start auto-refresh when on home tab
  $effect(() => {
    if (activeTab === 'home') {
      // Initial refresh after mount
      refreshInterval = setInterval(refreshNowPlaying, REFRESH_INTERVAL);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    }
  });

  // Cleanup on destroy
  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
  
  // Infinite scroll state
  let displayedRecentCount = $state(ITEMS_PER_LOAD);
  let displayedHistoryCount = $state(ITEMS_PER_LOAD);
  let isLoadingMore = $state(false);
  let scrollSentinel: HTMLDivElement;

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

  // Reset search and displayed count when switching tabs
  $effect(() => {
    activeTab;
    searchQuery = '';
    displayedRecentCount = ITEMS_PER_LOAD;
    displayedHistoryCount = ITEMS_PER_LOAD;
  });

  // Reset displayed count when search changes
  $effect(() => {
    searchQuery;
    displayedRecentCount = ITEMS_PER_LOAD;
    displayedHistoryCount = ITEMS_PER_LOAD;
  });

  function loadMore() {
    if (isLoadingMore) return;
    
    isLoadingMore = true;
    
    setTimeout(() => {
      if (activeTab === 'recent') {
        displayedRecentCount += ITEMS_PER_LOAD;
      } else if (activeTab === 'history') {
        displayedHistoryCount += ITEMS_PER_LOAD;
      }
      isLoadingMore = false;
    }, 100);
  }

  // Setup Intersection Observer when sentinel element changes
  $effect(() => {
    if (!scrollSentinel) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(scrollSentinel);
    
    return () => {
      observer.disconnect();
    };
  });

  const TABS = [
    { id: 'home', label: 'Home' },
    { id: 'recent', label: 'Recent' },
    { id: 'history', label: 'History' },
  ] as const;

  // Filter function for search
  function filterBySearch(items: HistoryItem[], query: string): HistoryItem[] {
    if (!query.trim()) return items;
    const lowerQuery = query.toLowerCase();
    return items.filter(item => 
      item.track.toLowerCase().includes(lowerQuery) ||
      item.artist.toLowerCase().includes(lowerQuery) ||
      item.user.toLowerCase().includes(lowerQuery)
    );
  }

  let filteredRecentHistory = $derived(
    filterBySearch([...allHistory].sort((a, b) => b.timestamp - a.timestamp), searchQuery)
  );

  let filteredCombinedHistory = $derived(
    filterBySearch([...combinedHistory].sort((a, b) => b.timestamp - a.timestamp), searchQuery)
  );

  // Displayed items (sliced for infinite scroll)
  let displayedRecentItems = $derived(
    filteredRecentHistory.slice(0, displayedRecentCount)
  );

  let displayedHistoryItems = $derived(
    filteredCombinedHistory.slice(0, displayedHistoryCount)
  );

  let hasMoreRecent = $derived(displayedRecentCount < filteredRecentHistory.length);
  let hasMoreHistory = $derived(displayedHistoryCount < filteredCombinedHistory.length);

  // Dynamic theme based on Now Playing album art
  let themeImageUrl = $derived(nowPlaying.length > 0 ? nowPlaying[0].track.imageUrl : null);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:image" content={pageImage} />
</svelte:head>

<div class="relative min-h-screen pb-20 sm:pb-0 overflow-hidden">
  <!-- Dynamic Theme Background -->
  {#key themeImageUrl}
    {#if themeImageUrl}
      <div 
        class="fixed inset-0 transition-opacity duration-1000"
        style="z-index: -1;"
        in:fade={{ duration: 1000 }}
      >
        <img
          src={themeImageUrl}
          alt=""
          class="absolute inset-0 h-full w-full object-cover scale-150 blur-2xl opacity-50 saturate-150"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90"></div>
      </div>
    {:else}
      <div class="fixed inset-0 bg-black" style="z-index: -1;"></div>
    {/if}
  {/key}

  <!-- Header / Navigation -->
  <header class="sticky top-0 z-40 border-b border-white/5 bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/60">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3">
        <div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#1db954] text-black shadow-lg shadow-[#1db954]/20">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
        <span class="font-bold tracking-tight text-white">Spotify Activity</span>
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

      <!-- View Toggle & GitHub -->
      <div class="flex items-center gap-2">
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
        <a
          href="https://github.com/luzyver/Rezz-Spotify"
          target="_blank"
          rel="noopener noreferrer"
          class="p-2 rounded-lg text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
          title="Fork on GitHub"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
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
            <button
              onclick={refreshNowPlaying}
              disabled={isRefreshing}
              class="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <RefreshCw class="h-4 w-4 {isRefreshing ? 'animate-spin' : ''}" />
              <span class="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
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
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-2xl font-bold text-white">Today's History</h2>
          <div class="flex w-full flex-col gap-1 sm:w-auto">
            <div class="relative w-full sm:w-64">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search tracks, artists..."
                bind:value={searchQuery}
                class="w-full rounded-lg bg-white/5 border border-white/10 py-2 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:border-[#1db954] focus:outline-none focus:ring-1 focus:ring-[#1db954]"
              />
              {#if searchQuery}
                <button
                  onclick={() => searchQuery = ''}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X class="h-4 w-4" />
                </button>
              {/if}
            </div>
            <div class="text-sm text-gray-400 text-right">
              {filteredRecentHistory.length} {searchQuery ? 'results' : 'tracks'}
            </div>
          </div>
        </div>

        {#if displayedRecentItems.length > 0}
          <div class="grid gap-4 {viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1'}">
            {#each displayedRecentItems as item, index}
              <HistoryCard 
                {item} 
                {index} 
                currentPage={1} 
                itemsPerPage={displayedRecentItems.length} 
                viewMode={viewMode} 
              />
            {/each}
          </div>
          
          <!-- Infinite scroll sentinel -->
          {#if hasMoreRecent}
            <div bind:this={scrollSentinel} class="flex justify-center py-8">
              {#if isLoadingMore}
                <Loader2 class="h-6 w-6 animate-spin text-[#1db954]" />
              {:else}
                <button onclick={loadMore} class="text-sm text-gray-500 hover:text-white">
                  Load more ({filteredRecentHistory.length - displayedRecentCount} remaining)
                </button>
              {/if}
            </div>
          {/if}
        {:else}
          <div class="py-20 text-center">
            <p class="text-gray-400">{searchQuery ? 'No tracks found.' : 'No tracks played today.'}</p>
          </div>
        {/if}
      </div>

    {:else if activeTab === 'history'}
      <div in:fade={{ duration: 300 }} class="space-y-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-2xl font-bold text-white">Full History</h2>
          <div class="flex w-full flex-col gap-1 sm:w-auto">
            <div class="relative w-full sm:w-64">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search tracks, artists..."
                bind:value={searchQuery}
                class="w-full rounded-lg bg-white/5 border border-white/10 py-2 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:border-[#1db954] focus:outline-none focus:ring-1 focus:ring-[#1db954]"
              />
              {#if searchQuery}
                <button
                  onclick={() => searchQuery = ''}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X class="h-4 w-4" />
                </button>
              {/if}
            </div>
            <div class="text-sm text-gray-400 text-right">
              {filteredCombinedHistory.length} {searchQuery ? 'results' : 'tracks'}
            </div>
          </div>
        </div>

        {#if isLoadingHistorical && combinedHistory.length === 0}
          <div class="flex flex-col items-center justify-center py-20 space-y-4">
            <div class="h-10 w-10 animate-spin rounded-full border-4 border-[#1db954] border-t-transparent"></div>
            <p class="text-gray-400">Loading full history...</p>
          </div>
        {:else if displayedHistoryItems.length > 0}
          <div class="grid gap-4 {viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1'}">
            {#each displayedHistoryItems as item, index}
              <HistoryCard 
                {item} 
                {index} 
                currentPage={1}
                itemsPerPage={displayedHistoryItems.length} 
                viewMode={viewMode} 
              />
            {/each}
          </div>
          
          <!-- Infinite scroll sentinel -->
          {#if hasMoreHistory}
            <div bind:this={scrollSentinel} class="flex justify-center py-8">
              {#if isLoadingMore}
                <Loader2 class="h-6 w-6 animate-spin text-[#1db954]" />
              {:else}
                <button onclick={loadMore} class="text-sm text-gray-500 hover:text-white">
                  Load more ({filteredCombinedHistory.length - displayedHistoryCount} remaining)
                </button>
              {/if}
            </div>
          {/if}
        {:else}
          <div class="py-20 text-center">
            <p class="text-gray-400">{searchQuery ? 'No tracks found.' : 'No history found.'}</p>
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

<!-- Toast Notification -->
{#if toast.visible}
  <div
    class="fixed top-4 left-4 right-4 z-50 sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
    transition:fly={{ y: -20, duration: 300 }}
  >
    <div class="flex items-center gap-3 rounded-lg bg-zinc-900 border border-white/10 px-4 py-3 shadow-xl max-w-full sm:max-w-md">
      {#if toast.type === 'success'}
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1db954]/20">
          <Music class="h-4 w-4 text-[#1db954]" />
        </div>
      {:else}
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
          <Music class="h-4 w-4 text-gray-400" />
        </div>
      {/if}
      <span class="text-sm text-white flex-1 line-clamp-2">{toast.message}</span>
      <button
        onclick={() => toast.visible = false}
        class="ml-2 shrink-0 text-gray-500 hover:text-white"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  </div>
{/if}

<style>
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 20px);
  }
</style>
