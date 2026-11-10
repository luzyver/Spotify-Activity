<script lang="ts">
  import type { NowPlayingBuddy, HistoryItem } from '$lib/types';
  import { spotifyUrl, timeAgo } from '$lib/utils';
  import { toMs } from '$lib/utils/stats';
  import { Music } from 'lucide-svelte';
  import { fade } from 'svelte/transition';
  import HudRings from './HudRings.svelte';
  import { decode } from '$lib/actions/decode';

  let { buddy, last }: { buddy: NowPlayingBuddy | null; last: HistoryItem | null } = $props();

  // Spotify's buddy list keeps the last track for a while; treat it as live only if recent
  const LIVE_WINDOW = 20 * 60 * 1000;

  let view = $derived.by(() => {
    if (buddy) {
      return {
        live: Date.now() - toMs(buddy.timestamp) < LIVE_WINDOW,
        track: buddy.track.name,
        trackUrl: spotifyUrl(buddy.track.uri),
        artist: buddy.track.artist?.name ?? 'Unknown',
        artistUrl: spotifyUrl(buddy.track.artist?.uri),
        album: buddy.track.album?.name ?? null,
        albumUrl: spotifyUrl(buddy.track.album?.uri),
        image: buddy.track.imageUrl ?? null,
        user: buddy.user.name ?? 'Rezz',
        userImage: buddy.user.imageUrl ?? null,
        timestamp: buddy.timestamp,
      };
    }
    if (last) {
      return {
        live: false,
        track: last.track,
        trackUrl: spotifyUrl(last.uri),
        artist: last.artist,
        artistUrl: null,
        album: null,
        albumUrl: null,
        image: last.imageUrl || null,
        user: last.user,
        userImage: null,
        timestamp: last.timestamp,
      };
    }
    return null;
  });
</script>

<!-- Container query: cover and title sit side by side only when the tile itself is wide enough -->
<div class="tile @container col-span-2 row-span-2 flex min-h-[20rem] flex-col p-4 sm:min-h-[22rem] sm:p-6">
  {#if view}
    <!-- Album art as a dim projection behind the readout -->
    {#key view.image}
      <div class="pointer-events-none absolute inset-0" in:fade={{ duration: 800 }}>
        {#if view.image}
          <img src={view.image} alt="" class="absolute inset-0 h-full w-full scale-125 object-cover opacity-20 blur-3xl saturate-50" />
        {/if}
        <div class="absolute inset-0 bg-gradient-to-br from-hud/10 via-bg/40 to-bg/90"></div>
      </div>
    {/key}

    <!-- Reactor rings fill the empty side of the tile; they spin up while a track is live -->
    <HudRings
      live={view.live}
      class="pointer-events-none absolute -right-14 top-16 w-52 opacity-45 sm:-right-10 sm:top-14 sm:w-60 sm:opacity-60 @lg:right-3 @lg:top-12 @lg:w-52"
    />

    <!-- Wraps to two rows on narrow phones instead of squeezing the label against the user -->
    <div class="relative flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <span class="tile-label whitespace-nowrap">
        <span class="tag-index">01 //</span>
        {#if view.live}<span class="text-ok">Sedang diputar</span>{:else}Terakhir diputar{/if}
      </span>
      <div class="flex min-w-0 items-center gap-2 font-mono text-[11px] text-muted">
        <span class="led {view.live ? 'led-live' : ''}" aria-hidden="true"></span>
        {#if view.userImage}
          <img src={view.userImage} alt={view.user} class="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-line-strong" />
        {/if}
        <span class="truncate">{view.user} · {timeAgo(view.timestamp)}</span>
      </div>
    </div>

    <div class="relative mt-auto flex flex-col gap-5 pt-6 @lg:flex-row @lg:items-end">
      <a href={view.trackUrl} target="_blank" rel="noopener noreferrer" class="scanner group w-fit shrink-0">
        <!-- Target lock: brackets close in once whenever the track changes -->
        {#key view.trackUrl}
          <span class="lock-on" aria-hidden="true"></span>
        {/key}
        {#if view.image}
          <img
            src={view.image}
            alt={view.track}
            class="aspect-square w-36 object-cover shadow-2xl shadow-black/60 transition-[filter] duration-500 group-hover:brightness-110 sm:w-44"
          />
        {:else}
          <div class="flex aspect-square w-36 items-center justify-center bg-surface-2 sm:w-44">
            <Music class="h-10 w-10 text-dim" />
          </div>
        {/if}
        <span class="scanner-line [--scan-distance:8.75rem] sm:[--scan-distance:10.75rem]" aria-hidden="true"></span>
      </a>

      <div class="min-w-0 flex-1">
        {#if view.live}
          <!-- Live meter: green, because this is the one value fetched as it happens -->
          <span class="mb-3 flex h-4 items-end gap-[3px]" aria-hidden="true">
            {#each [0, 0.2, 0.4, 0.1, 0.3] as delay}
              <span class="eq-bar segmented-y h-full w-[4px] bg-ok" style="animation-delay: {delay}s"></span>
            {/each}
          </span>
        {/if}
        <a
          href={view.trackUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={view.track}
          use:decode={view.track}
          class="line-clamp-2 break-words font-display text-xl font-bold leading-[1.15] tracking-wide text-balance text-fg uppercase hover:text-hud-text sm:text-2xl @lg:text-[1.75rem]"
        >
          {view.track}
        </a>
        <div class="mt-2 line-clamp-2 text-sm text-muted sm:truncate sm:text-base">
          {#if view.artistUrl}
            <a href={view.artistUrl} target="_blank" rel="noopener noreferrer" class="text-fg/85 hover:text-hud-text">{view.artist}</a>
          {:else}
            <span class="text-fg/85">{view.artist}</span>
          {/if}
          {#if view.album}
            <span class="text-dim"> // </span>
            <a href={view.albumUrl} target="_blank" rel="noopener noreferrer" class="hover:text-hud-text">{view.album}</a>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="m-auto flex flex-col items-center text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-hud/40 bg-hud/5">
        <Music class="h-7 w-7 text-hud-text" />
      </div>
      <p class="hud-text text-xs text-hud-text">Signal idle</p>
      <p class="mt-1 font-display text-lg font-bold uppercase tracking-wide">Lagi sepi nih</p>
      <p class="mt-1 text-sm text-muted">Belum ada lagu yang diputar.</p>
    </div>
  {/if}
</div>
