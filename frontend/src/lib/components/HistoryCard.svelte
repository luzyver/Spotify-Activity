<script lang="ts">
  import type { HistoryItem } from '$lib/types';
  import type { ViewMode } from '$lib/types';
  import { timeAgo, spotifyUrl, getUserName } from '$lib/utils';
  import { fly } from 'svelte/transition';
  import { Play } from 'lucide-svelte';

  interface Props {
    item: HistoryItem;
    index: number;
    currentPage: number;
    itemsPerPage: number;
    viewMode?: ViewMode;
  }

  let { item, index, currentPage, itemsPerPage, viewMode = 'grid' }: Props = $props();

  const globalIndex = $derived((currentPage - 1) * itemsPerPage + index + 1);
  const userName = $derived(item.user || getUserName(item.userId));
</script>

{#if viewMode === 'list'}
  <!-- List View -->
  <div
    class="group flex items-center gap-4 rounded-md p-2 transition-all duration-200 hover:bg-white/10"
    in:fly={{ x: -20, duration: 400, delay: index * 30 }}
  >
    <!-- Number -->
    <div class="w-8 text-center text-sm text-gray-400">{globalIndex}</div>

    <!-- Album Art -->
    <a
      href={spotifyUrl(item.uri)}
      target="_blank"
      rel="noopener noreferrer"
      class="relative flex-shrink-0"
    >
      <div class="relative h-10 w-10 overflow-hidden rounded">
        <img
          src={item.imageUrl}
          class="h-full w-full object-cover"
          alt={item.track}
          loading="lazy"
        />
      </div>
    </a>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <a href={spotifyUrl(item.uri)} target="_blank" rel="noopener noreferrer" class="block">
        <h4 class="truncate text-base text-white hover:underline">
          {item.track}
        </h4>
      </a>
      <p class="truncate text-sm text-gray-400">{item.artist || 'Unknown Artist'}</p>
    </div>

    <!-- User Info -->
    <div class="text-sm text-gray-400">{userName}</div>

    <!-- Time -->
    <div class="text-sm text-gray-400">{timeAgo(item.timestamp)}</div>
  </div>
{:else if viewMode === 'compact'}
  <!-- Compact View -->
  <a
    href={spotifyUrl(item.uri)}
    target="_blank"
    rel="noopener noreferrer"
    class="spotify-card group block overflow-hidden p-3"
    in:fly={{ y: 10, duration: 300, delay: index * 20 }}
  >
    <div class="relative mb-3 aspect-square overflow-hidden rounded-md">
      <img src={item.imageUrl} alt={item.track} class="h-full w-full object-cover" loading="lazy" />
      <div
        class="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      ></div>
      <div
        class="absolute bottom-2 right-2 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-[#1db954] opacity-0 shadow-xl transition-all duration-200 hover:scale-110 hover:bg-[#1ed760] group-hover:translate-y-0 group-hover:opacity-100"
      >
        <Play class="h-4 w-4 translate-x-0.5 fill-black text-black" />
      </div>
    </div>
    <p class="mb-1 truncate text-sm font-semibold text-white">{item.track}</p>
    <p class="truncate text-xs text-gray-400">{item.artist || 'Unknown Artist'}</p>
    <!-- User Info -->
    <div class="mt-1">
      <span class="truncate text-xs text-gray-500">{userName}</span>
    </div>
  </a>
{:else}
  <!-- Grid View (Default) -->
  <div
    class="card-interactive group relative overflow-hidden p-4"
    in:fly={{ y: 20, duration: 400, delay: index * 40 }}
  >
    <!-- Animated gradient overlay on hover -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-[#1db954]/0 to-[#1db954]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    ></div>

    <!-- Album Art -->
    <a
      href={spotifyUrl(item.uri)}
      target="_blank"
      rel="noopener noreferrer"
      class="relative z-10 mb-4 block"
    >
      <div
        class="relative aspect-square overflow-hidden rounded-xl shadow-lg transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-[#1db954]/20"
      >
        <img
          src={item.imageUrl}
          alt={item.track}
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        ></div>

        <!-- Play Button -->
        <div
          class="absolute bottom-3 right-3 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-gradient-to-br from-[#1db954] to-[#1ed760] opacity-0 shadow-xl shadow-[#1db954]/50 transition-all duration-300 hover:scale-110 active:scale-95 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Play class="h-5 w-5 translate-x-0.5 fill-black text-black" />
        </div>
      </div>
    </a>

    <!-- Info -->
    <div class="relative z-10 space-y-2">
      <a href={spotifyUrl(item.uri)} target="_blank" rel="noopener noreferrer" class="block">
        <h4
          class="line-clamp-1 text-base font-bold text-white transition-colors hover:text-[#1db954]"
        >
          {item.track}
        </h4>
      </a>

      <p class="line-clamp-2 text-sm text-gray-400">
        {item.artist || 'Unknown Artist'}
      </p>

      <!-- User Info -->
      <div class="flex items-center gap-2 pt-1 text-xs text-gray-500">
        <span class="truncate">{userName}</span>
        <span class="text-gray-700">•</span>
        <span>{timeAgo(item.timestamp)}</span>
      </div>
    </div>
  </div>
{/if}
