<script lang="ts">
  import NowPlayingTile from '$lib/components/NowPlayingTile.svelte';
  import StatTile from '$lib/components/StatTile.svelte';
  import TopArtists from '$lib/components/TopArtists.svelte';
  import ListeningClock from '$lib/components/ListeningClock.svelte';
  import Timeline from '$lib/components/Timeline.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import type { NowPlayingBuddy, HistoryItem } from '$lib/types';
  import { API_ENDPOINTS } from '$lib/config';
  import { spotifyUrl } from '$lib/utils';
  import { computeStats, formatNumber } from '$lib/utils/stats';
  import { extractAccent, DEFAULT_ACCENT, type RGB } from '$lib/utils/color';
  import { Music, Search, X, LoaderCircle, RefreshCw, House, Clock, Archive, Flame, ArrowRight } from 'lucide-svelte';
  import { loadAllHistory } from '$lib/utils/historyLoader';
  import NumberFlow from '@number-flow/svelte';
  import { fly } from 'svelte/transition';
  import { Tween, prefersReducedMotion } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { onMount, onDestroy, untrack, tick } from 'svelte';

  let { data } = $props();

  // Constants
  const ITEMS_PER_LOAD = 50;
  const REFRESH_INTERVAL = 30000;
  const historyKey = (item: HistoryItem) => `${item.userId}|${item.uri}|${item.timestamp}`;

  // Core state
  let nowPlaying = $state<NowPlayingBuddy[]>([]);
  let allHistory = $state<HistoryItem[]>([]);
  let combinedHistory = $state<HistoryItem[]>([]);

  // Sync from props on data change
  $effect(() => {
    if (data?.nowPlaying) nowPlaying = data.nowPlaying;
    if (data?.history) {
      allHistory = data.history;
      const fresh = data.history;
      untrack(() => { combinedHistory = mergeHistory(combinedHistory, fresh); });
    }
  });

  // UI state
  let activeTab = $state<'home' | 'recent' | 'history'>('home');
  let searchQuery = $state('');

  // Loading state
  let isLoadingHistorical = $state(false);
  let archiveLoaded = $state(false);
  let archiveProgress = $state<{ loaded: number; total: number } | null>(null);
  let isRefreshing = $state(false);
  let isLoadingMore = $state(false);

  // Pagination
  let displayedCount = $state(ITEMS_PER_LOAD);
  let scrollSentinel = $state<HTMLDivElement | null>(null);

  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  // Clock tick so "today" boundaries and relative times stay fresh
  let now = $state(Date.now());

  // Toast state
  let toast = $state<{ message: string; type: 'info' | 'success'; visible: boolean }>({ message: '', type: 'info', visible: false });
  let toastTimeout: ReturnType<typeof setTimeout> | null = null;

  function showToast(message: string, type: 'info' | 'success' = 'info') {
    if (toastTimeout) clearTimeout(toastTimeout);
    toast = { message, type, visible: true };
    toastTimeout = setTimeout(() => { toast.visible = false; }, 4000);
  }

  function mergeHistory(base: HistoryItem[], extra: HistoryItem[]): HistoryItem[] {
    const unique = new Map([...base, ...extra].map((item) => [historyKey(item), item]));
    return [...unique.values()].sort((a, b) => b.timestamp - a.timestamp);
  }

  // Refresh now playing and history
  async function refreshData() {
    if (isRefreshing) return;
    const prevKeys = new Set(nowPlaying.map((p) => `${p.user.uri}:${p.track.uri}`));
    const prevHistoryCount = allHistory.length;

    isRefreshing = true;
    try {
      const [liveRes, historyRes] = await Promise.all([
        fetch(API_ENDPOINTS.LIVE, { cache: 'no-store' }),
        fetch(API_ENDPOINTS.HISTORY, { cache: 'no-store' }),
      ]);

      if (liveRes.ok) {
        const json = await liveRes.json();
        const newPlaying: NowPlayingBuddy[] = json?.friends ?? [];

        for (const buddy of newPlaying) {
          if (!prevKeys.has(`${buddy.user.uri}:${buddy.track.uri}`)) {
            showToast(`${buddy.user.name ?? 'Rezz'} lagi dengerin ${buddy.track.name}`, 'success');
            break;
          }
        }

        if (prevKeys.size > 0 && newPlaying.length === 0) {
          showToast('Lagi nggak ada yang dengerin musik', 'info');
        }

        nowPlaying = newPlaying;
      }

      if (historyRes.ok) {
        const historyData: HistoryItem[] = await historyRes.json();
        if (Array.isArray(historyData)) {
          allHistory = historyData.sort((a, b) => b.timestamp - a.timestamp);
          combinedHistory = mergeHistory(combinedHistory, historyData);

          const newTracks = allHistory.length - prevHistoryCount;
          if (newTracks > 0 && prevHistoryCount > 0) {
            showToast(`${newTracks} lagu baru tercatat`, 'success');
          }
        }
      }
    } catch (e) {
      console.error('Refresh failed:', e);
    } finally {
      isRefreshing = false;
      now = Date.now();
    }
  }

  // Load archive history (Supabase) and merge it with today's list
  async function loadArchiveHistory() {
    if (archiveLoaded || isLoadingHistorical) return;

    isLoadingHistorical = true;
    try {
      const archiveData = await loadAllHistory((loaded, total) => {
        archiveProgress = { loaded, total };
      });
      combinedHistory = mergeHistory(combinedHistory, archiveData);
      archiveLoaded = true;
    } catch (e) {
      console.error('Failed to load archive:', e);
    } finally {
      isLoadingHistorical = false;
    }
  }

  function loadMore() {
    if (isLoadingMore) return;
    isLoadingMore = true;
    requestAnimationFrame(() => {
      displayedCount += ITEMS_PER_LOAD;
      isLoadingMore = false;
    });
  }

  function filterItems(items: HistoryItem[], query: string): HistoryItem[] {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.track.toLowerCase().includes(q) ||
        item.artist.toLowerCase().includes(q) ||
        item.user.toLowerCase().includes(q)
    );
  }

  // Derived data
  let currentItems = $derived(filterItems(activeTab === 'history' ? combinedHistory : allHistory, searchQuery));
  let displayedItems = $derived(currentItems.slice(0, displayedCount));
  let hasMore = $derived(displayedCount < currentItems.length);

  let stats = $derived(computeStats(combinedHistory.length > 0 ? combinedHistory : allHistory, now));
  let weekMax = $derived(Math.max(1, ...stats.daily.map((d) => d.count)));
  let weekDelta = $derived(
    stats.prevWeek > 0 ? Math.round(((stats.week - stats.prevWeek) / stats.prevWeek) * 100) : null
  );
  let todayDelta = $derived(stats.today - stats.yesterday);

  // Archive download progress, eased so the bar glides between batches
  const archiveBar = new Tween(0, { duration: 500, easing: cubicOut });
  $effect(() => {
    const target = archiveLoaded ? 1 : archiveProgress ? archiveProgress.loaded / Math.max(archiveProgress.total, 1) : 0;
    archiveBar.set(target, prefersReducedMotion.current ? { duration: 0 } : undefined);
  });

  let buddy = $derived(nowPlaying[0] ?? null);
  let lastPlayed = $derived(allHistory[0] ?? combinedHistory[0] ?? null);
  let multiUser = $derived(new Set(allHistory.map((i) => i.userId)).size > 1);

  // Accent color follows the album art currently on screen
  let accentSource = $derived(buddy?.track.imageUrl ?? lastPlayed?.imageUrl ?? null);
  let accent = $state<RGB>(DEFAULT_ACCENT);

  $effect(() => {
    const src = accentSource;
    if (!src) {
      accent = DEFAULT_ACCENT;
      return;
    }
    let cancelled = false;
    extractAccent(src).then((rgb) => {
      if (!cancelled) accent = rgb;
    });
    return () => { cancelled = true; };
  });

  // Meta tags
  let pageTitle = $derived(
    buddy ? `Listening to ${buddy.track.name} • ${buddy.track.artist?.name || 'Unknown'}` : "Rezz's Activity"
  );
  let pageImage = $derived(
    buddy?.track.imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg'
  );

  const dayInitial = new Intl.DateTimeFormat('id-ID', { weekday: 'narrow' });

  function startRefresh() {
    stopRefresh();
    refreshInterval = setInterval(refreshData, REFRESH_INTERVAL);
  }

  function stopRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = null;
  }

  // Pause polling while the tab is hidden, catch up when it comes back
  function onVisibilityChange() {
    if (document.hidden) {
      stopRefresh();
    } else {
      refreshData();
      startRefresh();
    }
  }

  onMount(() => {
    startRefresh();
    loadArchiveHistory();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  });

  $effect(() => {
    // Reset on tab/search change
    activeTab; searchQuery;
    displayedCount = ITEMS_PER_LOAD;
  });

  $effect(() => {
    if (!scrollSentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(scrollSentinel);
    return () => observer.disconnect();
  });

  onDestroy(() => {
    stopRefresh();
    if (toastTimeout) clearTimeout(toastTimeout);
  });

  function selectTab(id: typeof activeTab) {
    if (id === activeTab) return;
    const apply = () => {
      activeTab = id;
      window.scrollTo({ top: 0 });
    };
    // View Transitions API: the browser morphs old → new tab; plain swap where unsupported
    if (!document.startViewTransition || prefersReducedMotion.current) {
      apply();
      return;
    }
    document.startViewTransition(async () => {
      apply();
      await tick();
    });
  }

  const TABS = [
    { id: 'home', label: 'Beranda', icon: House },
    { id: 'recent', label: 'Hari ini', icon: Clock },
    { id: 'history', label: 'Riwayat', icon: Archive },
  ] as const;
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content="Check out my Spotify listening history." />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:image" content={pageImage} />
</svelte:head>

<div class="accent-root relative min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-12"
  style="--accent-r: {accent[0]}; --accent-g: {accent[1]}; --accent-b: {accent[2]}"
>
  <!-- Ambient glow tinted by the current album art (fades with the accent via @property) -->
  <div class="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[70vh]"
    style="background: radial-gradient(60% 60% at 30% 0%, rgb(var(--accent) / 0.16), transparent 70%);"
  ></div>

  <!-- Header -->
  <header class="glass sticky top-0 z-40 border-b border-white/5">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#1db954] text-black">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
        <span class="font-semibold tracking-tight">Spotify Activity</span>
      </div>

      <!-- Desktop Tabs -->
      <nav class="hidden gap-1 rounded-full bg-white/5 p-1 sm:flex">
        {#each TABS as tab}
          <button
            onclick={() => selectTab(tab.id)}
            class="relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors {activeTab === tab.id ? 'text-black' : 'text-zinc-400 hover:text-white'}"
          >
            {#if activeTab === tab.id}
              <div class="absolute inset-0 rounded-full bg-white [view-transition-name:tab-pill]"></div>
            {/if}
            <span class="relative z-10">{tab.label}</span>
          </button>
        {/each}
      </nav>

      <div class="flex items-center gap-1">
        <button
          onclick={refreshData}
          disabled={isRefreshing}
          class="rounded-lg p-2.5 text-zinc-500 transition-colors sm:p-2 hover:bg-white/10 hover:text-white disabled:opacity-50"
          title="Muat ulang"
        >
          <RefreshCw class="h-4 w-4 {isRefreshing ? 'animate-spin' : ''}" />
        </button>
        <a href="https://github.com/luzyver/Rezz-Spotify" target="_blank" rel="noopener noreferrer" class="rounded-lg p-2.5 text-zinc-500 hover:bg-white/10 sm:p-2 hover:text-white" title="GitHub">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6">
    {#if activeTab === 'home'}
      <div class="space-y-10">
        <!-- Bento grid (tiles rise in one by one, see .bento in app.css) -->
        <div class="bento grid auto-rows-[minmax(9rem,auto)] grid-cols-2 gap-3 sm:auto-rows-[minmax(10.5rem,auto)] md:grid-cols-4 md:gap-4">
          <NowPlayingTile {buddy} last={lastPlayed} />

          <StatTile label="Hari ini" value={stats.today}
            hint={stats.yesterday || stats.today
              ? `${todayDelta >= 0 ? '+' : ''}${todayDelta} dari kemarin`
              : 'lagu diputar'}
          />

          <StatTile label="Streak" value={stats.streak} hint={stats.streak === 1 ? 'hari' : 'hari berturut-turut'}>
            <Flame class="text-accent absolute right-5 top-5 h-5 w-5" />
          </StatTile>

          <!-- Last 14 days, current week highlighted -->
          <div class="tile col-span-2 flex flex-col p-4 sm:p-5">
            <div class="flex items-baseline justify-between gap-2">
              <span class="tile-label">7 hari terakhir</span>
              {#if weekDelta !== null}
                <span class="text-xs font-medium {weekDelta >= 0 ? 'text-accent' : 'text-zinc-400'}">
                  {weekDelta >= 0 ? '▲' : '▼'} {Math.abs(weekDelta)}% vs minggu lalu
                </span>
              {/if}
            </div>
            <div class="mt-auto flex items-end justify-between gap-4 pt-4">
              <span class="stat-number text-5xl sm:text-6xl"><NumberFlow value={stats.week} locales="id-ID" /></span>
              <div class="flex h-16 flex-1 items-end justify-end gap-1 sm:max-w-[60%]">
                {#each stats.daily as day, i (day.time)}
                  <div class="flex flex-1 flex-col items-center gap-1" title="{new Date(day.time).toLocaleDateString('id-ID')} · {day.count} lagu">
                    <div
                      class="grow-y w-full rounded-sm transition-[height] duration-700"
                      style="animation-delay: {300 + i * 40}ms; height: {Math.max(2, (day.count / weekMax) * 52)}px; background-color: rgb(var(--accent) / {i >= 7 ? 0.9 : 0.25});"
                    ></div>
                    <span class="text-[9px] leading-none text-zinc-600">{dayInitial.format(day.time)}</span>
                  </div>
                {/each}
              </div>
            </div>
          </div>

          <TopArtists artists={stats.topArtists} />

          <!-- Top track of the week -->
          <div class="tile col-span-2 flex flex-col p-4 sm:p-5">
            <span class="tile-label">Lagu terfavorit · 7 hari</span>
            {#if stats.topTrack}
              <a href={spotifyUrl(stats.topTrack.uri)} target="_blank" rel="noopener noreferrer" class="group mt-auto flex items-center gap-3 pt-4 sm:gap-4">
                {#if stats.topTrack.imageUrl}
                  <img src={stats.topTrack.imageUrl} alt="" class="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-white/10 sm:h-20 sm:w-20" />
                {:else}
                  <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-800 sm:h-20 sm:w-20">
                    <Music class="h-6 w-6 text-zinc-500" />
                  </div>
                {/if}
                <div class="min-w-0 flex-1">
                  <p class="truncate text-lg font-bold tracking-tight group-hover:underline sm:text-xl">{stats.topTrack.track}</p>
                  <p class="truncate text-sm text-zinc-400">{stats.topTrack.artist}</p>
                </div>
                <div class="shrink-0 text-right">
                  <span class="stat-number text-accent text-3xl sm:text-4xl"><NumberFlow value={stats.topTrack.count} suffix="×" /></span>
                  <p class="text-xs text-zinc-500">diputar</p>
                </div>
              </a>
            {:else}
              <p class="m-auto text-sm text-zinc-500">Belum ada data minggu ini.</p>
            {/if}
          </div>

          <ListeningClock heatmap={stats.heatmap} max={stats.heatmapMax} peakHour={stats.peakHour} />

          <StatTile
            label="Total lagu"
            value={archiveLoaded ? stats.total : null}
            hint={archiveLoaded
              ? 'sepanjang waktu'
              : archiveProgress
                ? `memuat ${formatNumber(archiveProgress.loaded)} / ${formatNumber(archiveProgress.total)}`
                : 'memuat arsip…'}
          >
            {#if !archiveLoaded || archiveBar.current < 1}
              <div class="absolute inset-x-0 bottom-0 h-0.5 bg-white/5" out:fly={{ y: 4, duration: prefersReducedMotion.current ? 0 : 400 }}>
                <div class="bg-accent h-full" style="width: {archiveBar.current * 100}%"></div>
              </div>
            {/if}
          </StatTile>

          <StatTile
            label="Artis berbeda"
            value={archiveLoaded ? stats.uniqueArtists : null}
            hint="sudah didengar"
          />
        </div>

        <!-- Recent preview -->
        <section>
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-xl font-bold tracking-tight">Baru saja diputar</h2>
            <button onclick={() => selectTab('recent')} class="text-accent flex items-center gap-1 text-sm font-medium hover:underline">
              Lihat semua <ArrowRight class="h-4 w-4" />
            </button>
          </div>
          {#if allHistory.length > 0}
            <Timeline items={allHistory.slice(0, 8)} showUser={multiUser} />
          {:else}
            <EmptyState />
          {/if}
        </section>
      </div>
    {:else}
      <!-- Today / History tab -->
      <div class="space-y-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-3xl font-extrabold tracking-tight">{activeTab === 'history' ? 'Riwayat lengkap' : 'Hari ini'}</h2>
            <p class="mt-1 text-sm text-zinc-400">
              {formatNumber(currentItems.length)} {searchQuery ? 'hasil' : 'lagu'}
              {#if activeTab === 'history' && isLoadingHistorical && archiveProgress}
                · memuat arsip {formatNumber(archiveProgress.loaded)} / {formatNumber(archiveProgress.total)}
              {/if}
            </p>
          </div>
          <div class="relative w-full sm:w-72">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari lagu atau artis…"
              bind:value={searchQuery}
              class="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-base text-white placeholder-zinc-500 sm:text-sm focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent))]"
            />
            {#if searchQuery}
              <button onclick={() => (searchQuery = '')} class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white" title="Hapus pencarian">
                <X class="h-4 w-4" />
              </button>
            {/if}
          </div>
        </div>

        {#if activeTab === 'history' && isLoadingHistorical && combinedHistory.length === 0}
          <div class="flex flex-col items-center justify-center space-y-4 py-20">
            <LoaderCircle class="text-accent h-8 w-8 animate-spin" />
            <p class="text-zinc-400">Memuat riwayat…</p>
          </div>
        {:else if displayedItems.length > 0}
          <Timeline items={displayedItems} showUser={multiUser} />

          {#if hasMore}
            <div bind:this={scrollSentinel} class="flex justify-center py-8">
              {#if isLoadingMore}
                <LoaderCircle class="text-accent h-6 w-6 animate-spin" />
              {:else}
                <button onclick={loadMore} class="text-sm text-zinc-500 hover:text-white">
                  Muat lagi ({formatNumber(currentItems.length - displayedCount)} tersisa)
                </button>
              {/if}
            </div>
          {/if}
        {:else}
          <div class="py-20 text-center">
            <p class="text-zinc-400">{searchQuery ? 'Lagu tidak ditemukan.' : 'Belum ada riwayat.'}</p>
          </div>
        {/if}
      </div>
    {/if}
  </main>

  <!-- Mobile Nav -->
  <nav class="glass bg-[#09090b]/90 pb-safe fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 sm:hidden">
    <div class="flex items-stretch px-2 pt-1.5">
      {#each TABS as tab}
        <button
          onclick={() => selectTab(tab.id)}
          aria-current={activeTab === tab.id ? 'page' : undefined}
          class="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition-colors {activeTab === tab.id ? 'text-accent' : 'text-zinc-500'}"
        >
          <tab.icon class="h-5 w-5" />
          <span class="text-[10px] font-medium">{tab.label}</span>
        </button>
      {/each}
    </div>
  </nav>
</div>

<!-- Toast -->
{#if toast.visible}
  <div class="fixed left-4 right-4 top-[calc(1rem+env(safe-area-inset-top))] z-50 sm:left-1/2 sm:right-auto sm:-translate-x-1/2" transition:fly={{ y: -20, duration: 300 }}>
    <div class="flex max-w-full items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/95 px-4 py-3 shadow-xl backdrop-blur sm:max-w-md">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full {toast.type === 'success' ? 'bg-[#1db954]/20' : 'bg-white/10'}">
        <Music class="h-4 w-4 {toast.type === 'success' ? 'text-[#1db954]' : 'text-zinc-400'}" />
      </div>
      <span class="line-clamp-2 flex-1 text-sm text-white">{toast.message}</span>
      <button onclick={() => (toast.visible = false)} class="ml-2 shrink-0 text-zinc-500 hover:text-white" title="Tutup">
        <X class="h-4 w-4" />
      </button>
    </div>
  </div>
{/if}

<style>
  .pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 0.5rem); }
</style>
