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
  import BrandMark from '$lib/components/BrandMark.svelte';
  import { decode } from '$lib/actions/decode';
  import { Music, Search, X, LoaderCircle, RefreshCw, House, Clock, Archive, Flame, ArrowRight } from 'lucide-svelte';
  import { loadAllHistory } from '$lib/utils/historyLoader';
  import NumberFlow from '@number-flow/svelte';
  import { fly, slide } from 'svelte/transition';
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
  let toast = $state<{ id: number; message: string; type: 'info' | 'success'; visible: boolean }>({ id: 0, message: '', type: 'info', visible: false });
  const TOAST_DURATION = 4000;
  // The visor grows while a transmission is open; sticky day headers follow its real height
  let headerHeight = $state(0);
  let toastTimeout: ReturnType<typeof setTimeout> | null = null;

  function showToast(message: string, type: 'info' | 'success' = 'info') {
    if (toastTimeout) clearTimeout(toastTimeout);
    // Without this, scroll anchoring holds a scrolled page still while the sticky visor grows, so the strip
    // would cover the row under it. With anchoring off the page moves down with the visor instead.
    document.documentElement.style.overflowAnchor = 'none';
    toast = { id: toast.id + 1, message, type, visible: true };
    toastTimeout = setTimeout(() => { toast.visible = false; }, TOAST_DURATION);
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
    // An open transmission never plays its outro when the page is torn down, so give anchoring back here
    // (onDestroy also runs during SSR, where there is no document)
    if (typeof document !== 'undefined') document.documentElement.style.overflowAnchor = '';
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

  let tabTitle = $derived(activeTab === 'history' ? 'Riwayat lengkap' : 'Hari ini');

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

<div class="relative min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-12" style:--sticky-top={headerHeight ? `${headerHeight}px` : null}>
  <!-- Header as a helmet visor: red-and-gold paint line on top, cyan HUD line below -->
  <header class="visor glass" bind:clientHeight={headerHeight}>
    <div class="flex h-[var(--header-h)] items-center justify-between px-4 sm:px-6 lg:px-10">
      <div class="flex items-center gap-3">
        <BrandMark class="h-8 w-8 shrink-0" />
        <div class="leading-none">
          <span class="block font-display text-sm font-bold uppercase tracking-[0.12em]" aria-label="Spotify" use:decode={'Spotify'}>Spotify</span>
          <span class="mt-1 block font-mono text-[10px] text-hud-text">// activity log</span>
        </div>
      </div>

      <!-- Desktop Tabs -->
      <nav class="hidden gap-1 sm:flex">
        {#each TABS as tab}
          <button
            onclick={() => selectTab(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            class="hud-text relative px-4 py-1.5 text-sm transition-colors {activeTab === tab.id ? 'text-hud-text' : 'text-muted hover:text-fg'}"
          >
            {#if activeTab === tab.id}
              <div class="nav-pill plate absolute inset-0 [--cut:5px] [--edge:var(--color-hud)] [view-transition-name:tab-pill]"></div>
            {/if}
            <span class="relative z-10">{tab.label}</span>
          </button>
        {/each}
      </nav>

      <div class="flex items-center gap-2">
        <button
          onclick={refreshData}
          disabled={isRefreshing}
          class="plate icon-btn p-2.5 disabled:opacity-50 sm:p-2"
          title="Muat ulang"
        >
          <RefreshCw class="h-4 w-4 {isRefreshing ? 'animate-spin' : ''}" />
        </button>
        <a href="https://github.com/luzyver/Rezz-Spotify" target="_blank" rel="noopener noreferrer" class="plate icon-btn p-2.5 sm:p-2" title="GitHub">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
      </div>
    </div>
    <!-- Transmission: notifications open as a strip under the visor. It is part of the header's flow,
         so it pushes the page down instead of covering the tabs or any content. -->
    {#if toast.visible}
      <div
        class="transmission"
        role="status"
        transition:slide={{ duration: prefersReducedMotion.current ? 0 : 320 }}
        onoutroend={() => (document.documentElement.style.overflowAnchor = '')}
      >
        {#key toast.id}
          <div class="relative flex items-center gap-3 px-4 py-2 sm:px-6 lg:px-10">
            <span class="led {toast.type === 'success' ? 'led-live' : ''}" aria-hidden="true"></span>
            <span class="hud-text shrink-0 text-[11px] text-hud-text" aria-hidden="true">Incoming <span class="text-dim">//</span></span>
            <!-- Screen readers get the plain text; the visible copy decodes out of glyphs -->
            <span class="sr-only">{toast.message}</span>
            <span class="line-clamp-2 min-w-0 flex-1 font-mono text-xs text-fg" aria-hidden="true" use:decode={toast.message}>{toast.message}</span>
            <button onclick={() => (toast.visible = false)} class="shrink-0 p-1 text-dim hover:text-hud-text" title="Tutup">
              <X class="h-4 w-4" />
            </button>
            <span class="transmission-sweep" aria-hidden="true"></span>
            <span class="transmission-timer" style="animation-duration: {TOAST_DURATION}ms" aria-hidden="true"></span>
          </div>
        {/key}
      </div>
    {/if}
    <!-- Uplink: charges along the visor until the next sync, restarts after every refresh -->
    {#key now}
      <span class="uplink" style="animation-duration: {REFRESH_INTERVAL}ms" aria-hidden="true"></span>
    {/key}
  </header>

  <main class="px-4 py-6 sm:px-6 lg:px-10">
    {#if activeTab === 'home'}
      <div class="space-y-10">
        <!-- Bento grid (tiles rise in one by one, see .bento in app.css).
             Spans add up to whole rows at 2, 4 and 6 columns; dense flow packs them without holes. -->
        <div class="bento grid auto-rows-[minmax(9rem,auto)] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[minmax(10.5rem,auto)] md:grid-cols-4 md:gap-4 xl:grid-cols-6">
          <NowPlayingTile {buddy} last={lastPlayed} />

          <StatTile index="02" label="Hari ini" value={stats.today}
            hint={stats.yesterday || stats.today
              ? `${todayDelta >= 0 ? '+' : ''}${todayDelta} dari kemarin`
              : 'lagu diputar'}
          />

          <StatTile index="03" label="Streak" value={stats.streak} hint={stats.streak === 1 ? 'hari' : 'hari berturut-turut'}>
            {#snippet icon()}<Flame class="flame h-6 w-6 text-gold sm:h-7 sm:w-7" />{/snippet}
          </StatTile>

          <!-- Last 14 days, current week highlighted -->
          <div class="tile col-span-2 flex flex-col p-4 sm:p-5">
            <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
              <span class="tile-label whitespace-nowrap"><span class="tag-index">04 //</span>7 hari terakhir</span>
              {#if weekDelta !== null}
                <span class="whitespace-nowrap font-mono text-[11px] {weekDelta >= 0 ? 'text-accent' : 'text-hot-text'}">
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
                      class="grow-y segmented-y w-full transition-[height] duration-700"
                      style="animation-delay: {300 + i * 40}ms; height: {Math.max(2, (day.count / weekMax) * 52)}px; background-color: rgb(var(--accent) / {i >= 7 ? 0.9 : 0.28});"
                    ></div>
                    <span class="font-mono text-[9px] leading-none text-dim">{dayInitial.format(day.time)}</span>
                  </div>
                {/each}
              </div>
            </div>
          </div>

          <TopArtists artists={stats.topArtists} />

          <!-- Top track of the week -->
          <div class="tile col-span-2 flex flex-col p-4 sm:p-5">
            <span class="tile-label"><span class="tag-index">06 //</span>Lagu terfavorit · 7 hari</span>
            {#if stats.topTrack}
              <a href={spotifyUrl(stats.topTrack.uri)} target="_blank" rel="noopener noreferrer" class="group mt-auto flex items-center gap-3 pt-4 sm:gap-4">
                {#if stats.topTrack.imageUrl}
                  <img src={stats.topTrack.imageUrl} alt="" class="h-16 w-16 shrink-0 object-cover ring-1 ring-line-strong sm:h-20 sm:w-20" />
                {:else}
                  <div class="flex h-16 w-16 shrink-0 items-center justify-center bg-surface-2 sm:h-20 sm:w-20">
                    <Music class="h-6 w-6 text-dim" />
                  </div>
                {/if}
                <div class="min-w-0 flex-1">
                  <p class="truncate text-lg font-semibold text-fg group-hover:text-hud-text sm:text-xl">{stats.topTrack.track}</p>
                  <p class="truncate text-sm text-muted">{stats.topTrack.artist}</p>
                </div>
                <div class="shrink-0 text-right">
                  <span class="stat-number text-4xl text-hud-text sm:text-5xl"><NumberFlow value={stats.topTrack.count} suffix="×" /></span>
                  <p class="hud-text text-[10px] text-dim">diputar</p>
                </div>
              </a>
            {:else}
              <p class="m-auto text-sm text-muted">Belum ada data minggu ini.</p>
            {/if}
          </div>

          <ListeningClock heatmap={stats.heatmap} max={stats.heatmapMax} peakHour={stats.peakHour} />

          <StatTile
            index="08"
            label="Total lagu"
            value={archiveLoaded ? stats.total : null}
            hint={archiveLoaded
              ? 'sepanjang waktu'
              : archiveProgress
                ? `memuat ${formatNumber(archiveProgress.loaded)} / ${formatNumber(archiveProgress.total)}`
                : 'memuat arsip…'}
          >
            {#if !archiveLoaded || archiveBar.current < 1}
              <div class="absolute inset-x-0 bottom-0 z-[3] h-0.5 bg-hud/10" out:fly={{ y: 4, duration: prefersReducedMotion.current ? 0 : 400 }}>
                <div class="bg-accent h-full" style="width: {archiveBar.current * 100}%"></div>
              </div>
            {/if}
          </StatTile>

          <StatTile
            index="09"
            label="Artis berbeda"
            value={archiveLoaded ? stats.uniqueArtists : null}
            hint="sudah didengar"
          />
        </div>

        <!-- Recent preview -->
        <section>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="section-title min-w-0 flex-1 whitespace-nowrap text-[13px] min-[380px]:text-base sm:text-lg" aria-label="Baru saja diputar" use:decode={'Baru saja diputar'}>Baru saja diputar</h2>
            <button onclick={() => selectTab('recent')} class="hud-text text-accent ml-3 flex shrink-0 items-center gap-1 text-xs hover:text-fg min-[380px]:text-sm sm:ml-4">
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
            <p class="hud-text mb-2 text-xs text-hud-text">{activeTab === 'history' ? 'Archive // all time' : 'Log // today'}</p>
            <h2 class="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl" aria-label={tabTitle} use:decode={tabTitle}>{tabTitle}</h2>
            <p class="mt-2 font-mono text-xs text-muted">
              {formatNumber(currentItems.length)} {searchQuery ? 'hasil' : 'lagu'}
              {#if activeTab === 'history' && isLoadingHistorical && archiveProgress}
                · memuat arsip {formatNumber(archiveProgress.loaded)} / {formatNumber(archiveProgress.total)}
              {/if}
            </p>
          </div>
          <div class="field-wrap relative w-full sm:w-72">
            <Search class="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-dim" />
            <input
              type="text"
              placeholder="Cari lagu atau artis…"
              bind:value={searchQuery}
              class="plate field w-full py-2.5 pl-10 pr-10 text-base text-fg placeholder-dim sm:text-sm"
            />
            {#if searchQuery}
              <button onclick={() => (searchQuery = '')} class="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-dim hover:text-hud-text" title="Hapus pencarian">
                <X class="h-4 w-4" />
              </button>
            {/if}
          </div>
        </div>

        {#if activeTab === 'history' && isLoadingHistorical && combinedHistory.length === 0}
          <div class="flex flex-col items-center justify-center space-y-4 py-20">
            <LoaderCircle class="text-accent h-8 w-8 animate-spin" />
            <p class="hud-text text-sm text-muted">Memuat riwayat…</p>
          </div>
        {:else if displayedItems.length > 0}
          <Timeline items={displayedItems} showUser={multiUser} />

          {#if hasMore}
            <div bind:this={scrollSentinel} class="flex justify-center py-8">
              {#if isLoadingMore}
                <LoaderCircle class="text-accent h-6 w-6 animate-spin" />
              {:else}
                <button onclick={loadMore} class="hud-text text-sm text-muted hover:text-hud-text">
                  Muat lagi ({formatNumber(currentItems.length - displayedCount)} tersisa)
                </button>
              {/if}
            </div>
          {/if}
        {:else}
          <div class="py-20 text-center">
            <p class="hud-text text-xs text-hud-text">{searchQuery ? 'No match' : 'No signal'}</p>
            <p class="mt-2 text-muted">{searchQuery ? 'Lagu tidak ditemukan.' : 'Belum ada riwayat.'}</p>
          </div>
        {/if}
      </div>
    {/if}
  </main>

  <!-- Mobile Nav: cyan HUD line on top, the current tab lit with a bar -->
  <nav class="glass pb-safe fixed bottom-0 left-0 right-0 z-50 border-t border-hud/30 sm:hidden">
    <div class="flex items-stretch px-2 pt-1.5">
      {#each TABS as tab}
        <button
          onclick={() => selectTab(tab.id)}
          aria-current={activeTab === tab.id ? 'page' : undefined}
          class="relative flex flex-1 flex-col items-center gap-1 py-1.5 transition-colors {activeTab === tab.id ? 'text-hud-text' : 'text-dim'}"
        >
          {#if activeTab === tab.id}
            <span class="absolute -top-1.5 h-0.5 w-8 bg-hud shadow-[0_0_8px_var(--color-hud)]" aria-hidden="true"></span>
          {/if}
          <tab.icon class="h-5 w-5" />
          <span class="hud-text text-[10px]">{tab.label}</span>
        </button>
      {/each}
    </div>
  </nav>
</div>

<style>
  .pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 0.5rem); }
</style>
