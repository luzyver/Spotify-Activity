<script lang="ts">

  import Particles from '$lib/components/Particles.svelte';
  import Equalizer from '$lib/components/Equalizer.svelte';
  import NowPlayingCard from '$lib/components/NowPlayingCard.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import HistoryCard from '$lib/components/HistoryCard.svelte';
  import StatsChart from '$lib/components/StatsChart.svelte';
  import Button from '$lib/components/Button.svelte';
  import { ITEMS_PER_PAGE } from '$lib/config';
  import type { NowPlayingBuddy, HistoryItem } from '$lib/types';
  import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Music2 } from 'lucide-svelte';

  // Prefetched data from +page.ts load
  let { data } = $props();

  let nowPlaying = $state<NowPlayingBuddy[]>(data?.nowPlaying ?? []);
  let history = $state<HistoryItem[]>(data?.history ?? []);
  let currentPage = $state(1);
  let totalPages = $derived(Math.ceil(history.length / ITEMS_PER_PAGE));
  let paginatedHistory = $derived(
    history.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  );

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    // Scroll to history section
    document
      .getElementById('history-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<Particles />

<div class="relative z-10 min-h-screen">
  <!-- Compact Header -->
  <header class="sticky top-0 z-30 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-md">
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
      </div>
    </div>
  </header>

  <!-- Main Layout: Sidebar + Content -->
  <div class="w-full px-3 py-4 sm:px-6 sm:py-6">
    <div class="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:gap-8">
      <!-- Sidebar - Left (Now Playing) -->
      <aside class="space-y-4 sm:space-y-6 lg:col-span-4 xl:col-span-3">
        <!-- Now Playing Section -->
        <section class="space-y-4 sm:space-y-6 lg:sticky lg:top-24">
          <div class="mb-3 flex items-center gap-2 sm:mb-4">
            <Equalizer />
            <h2 class="text-base font-bold sm:text-lg lg:text-xl">Now Playing</h2>
            {#if nowPlaying.length > 0}
              <span
                class="ml-auto rounded-full bg-[#1db954]/20 px-2 py-1 text-[10px] text-[#1db954] sm:text-xs"
                >{nowPlaying.length}</span
              >
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

      <!-- Main Content - Right (Stats + History) -->
      <main class="lg:col-span-8 xl:col-span-9">
        <!-- Stats -->
        {#if history.length > 0}
          <section class="mb-4 sm:mb-6">
            <StatsChart {history} />
          </section>
        {/if}

        <!-- History Section -->
        <section id="history-section">
          <div class="mb-4 flex items-center justify-between sm:mb-6">
            <div class="flex items-center gap-2">
              <Music2 class="h-4 w-4 text-[#1db954] sm:h-5 sm:w-5" />
              <h2 class="text-base font-bold sm:text-lg lg:text-xl">Recent Plays</h2>
            </div>
            <p class="text-[10px] text-gray-400 sm:text-xs lg:text-sm">{history.length} tracks</p>
          </div>

          {#if history.length > 0}
            <!-- Masonry Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-4 sm:mb-6">
              {#each paginatedHistory as item, index (item.uri + ':' + item.timestamp)}
                <HistoryCard {item} {index} {currentPage} itemsPerPage={ITEMS_PER_PAGE} />
              {/each}
            </div>
          {:else}
            <!-- Empty State -->
            <div class="py-16 text-center">
              <div class="mb-4 text-6xl">🎵</div>
              <p class="mb-2 text-lg text-gray-400">No listening history yet</p>
              <p class="text-sm text-gray-600">Start playing some music on Spotify!</p>
            </div>
          {/if}

          <!-- Pagination - Modern -->
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

              <div class="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2">
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
      </main>
    </div>
  </div>

  <!-- Footer -->
  <footer class="mt-12 border-t border-white/5 py-8 text-center text-xs text-gray-500">
    <p class="mb-1">Powered by Spotify Web API</p>
    <p class="text-[10px] text-gray-600">Updates every 10 minutes</p>
  </footer>
</div>
