<script lang="ts">
  import type { NowPlayingBuddy, HistoryItem } from '$lib/types';
  import { spotifyUrl, timeAgo } from '$lib/utils';
  import { toMs } from '$lib/utils/stats';
  import { Music } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

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

<div class="tile col-span-2 row-span-2 flex min-h-[20rem] flex-col p-4 sm:min-h-[22rem] sm:p-6">
  {#if view}
    <!-- Accent wash from the album art -->
    {#key view.image}
      <div class="pointer-events-none absolute inset-0" in:fade={{ duration: 800 }}>
        {#if view.image}
          <img src={view.image} alt="" class="absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-3xl saturate-150" />
        {/if}
        <div class="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent)/0.22)] via-transparent to-zinc-950/80"></div>
      </div>
    {/key}

    <div class="relative flex items-center justify-between gap-3">
      <div class="flex shrink-0 items-center gap-2 text-sm font-medium">
        {#if view.live}
          <span class="flex h-4 items-end gap-[3px]" aria-hidden="true">
            {#each [0, 0.2, 0.4, 0.1] as delay}
              <span class="eq-bar bg-accent h-full w-[3px] rounded-full" style="animation-delay: {delay}s"></span>
            {/each}
          </span>
          <span class="text-accent">Sedang diputar</span>
        {:else}
          <span class="h-2 w-2 rounded-full bg-zinc-500"></span>
          <span class="text-zinc-400">Terakhir diputar</span>
        {/if}
      </div>
      <div class="flex min-w-0 items-center gap-2 text-xs text-zinc-400">
        {#if view.userImage}
          <img src={view.userImage} alt={view.user} class="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/10" />
        {/if}
        <span class="truncate">{view.user} · {timeAgo(view.timestamp)}</span>
      </div>
    </div>

    <div class="relative mt-auto flex flex-col gap-5 pt-6 lg:flex-row lg:items-end">
      <a href={view.trackUrl} target="_blank" rel="noopener noreferrer" class="group shrink-0">
        {#if view.image}
          <img
            src={view.image}
            alt={view.track}
            class="aspect-square w-36 rounded-2xl object-cover shadow-2xl shadow-black/60 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-[1.03] sm:w-44"
          />
        {:else}
          <div class="flex aspect-square w-36 items-center justify-center rounded-2xl bg-zinc-800 sm:w-44">
            <Music class="h-10 w-10 text-zinc-500" />
          </div>
        {/if}
      </a>

      <div class="min-w-0 flex-1">
        <a
          href={view.trackUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="line-clamp-2 break-words text-2xl font-extrabold leading-[1.05] tracking-tight text-balance hover:underline sm:text-3xl lg:text-4xl"
        >
          {view.track}
        </a>
        <div class="mt-2 line-clamp-2 text-sm text-zinc-300 sm:truncate sm:text-base">
          {#if view.artistUrl}
            <a href={view.artistUrl} target="_blank" rel="noopener noreferrer" class="hover:text-white hover:underline">{view.artist}</a>
          {:else}
            {view.artist}
          {/if}
          {#if view.album}
            <span class="text-zinc-500"> · </span>
            <a href={view.albumUrl} target="_blank" rel="noopener noreferrer" class="text-zinc-400 hover:text-white hover:underline">{view.album}</a>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="m-auto flex flex-col items-center text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <Music class="h-7 w-7 text-zinc-500" />
      </div>
      <p class="text-lg font-semibold">Lagi sepi nih</p>
      <p class="mt-1 text-sm text-zinc-400">Belum ada lagu yang diputar.</p>
    </div>
  {/if}
</div>
