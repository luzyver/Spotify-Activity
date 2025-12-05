<script lang="ts">
  import type { HistoryItem } from '$lib/types';
  import type { ViewMode } from '$lib/types';
  import { timeAgo, spotifyUrl, getUserName } from '$lib/utils';
  import { fly } from 'svelte/transition';
  import { Play, Music } from 'lucide-svelte';

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
    class="group relative flex items-center gap-4 rounded-xl p-3 transition-all duration-300 hover:bg-white/5"
    in:fly={{ x: -10, duration: 300, delay: index * 20 }}
  >
    <!-- Number -->
    <div class="w-6 text-right text-sm font-medium text-gray-500 tabular-nums group-hover:text-white">
      {globalIndex}
    </div>

    <!-- Album Art -->
    <a
      href={spotifyUrl(item.uri)}
      target="_blank"
      rel="noopener noreferrer"
      class="relative shrink-0"
    >
      <div class="relative h-12 w-12 overflow-hidden rounded-md shadow-md sm:h-14 sm:w-14">
        <img
          src={item.imageUrl}
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          alt={item.track}
          loading="lazy"
        />
        <!-- Play overlay -->
        <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Play class="h-5 w-5 fill-white text-white" />
        </div>
      </div>
    </a>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <a 
        href={spotifyUrl(item.uri)} 
        target="_blank" 
        rel="noopener noreferrer" 
        class="block truncate text-base font-semibold text-white hover:text-[#1db954] hover:underline"
      >
        {item.track}
      </a>
      <div class="flex items-center gap-2 truncate text-sm text-gray-400">
        <span class="truncate hover:text-white">{item.artist || 'Unknown Artist'}</span>
      </div>
    </div>

    <!-- Meta (Hidden on very small screens) -->
    <div class="hidden shrink-0 flex-col items-end gap-0.5 text-xs text-gray-500 sm:flex">
      <span class="font-medium text-gray-400">{userName}</span>
      <span>{timeAgo(item.timestamp)}</span>
    </div>
    
    <!-- Mobile Meta (Icon only) -->
    <div class="flex shrink-0 flex-col items-end sm:hidden text-xs text-gray-500">
      <span>{timeAgo(item.timestamp)}</span>
    </div>
  </div>

{:else if viewMode === 'compact'}
  <!-- Compact View -->
  <a
    href={spotifyUrl(item.uri)}
    target="_blank"
    rel="noopener noreferrer"
    class="group block overflow-hidden rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
    in:fly={{ y: 10, duration: 300, delay: index * 20 }}
  >
    <div class="flex items-center gap-3">
      <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-white/10">
        <img src={item.imageUrl} alt={item.track} class="h-full w-full object-cover" loading="lazy" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-white group-hover:text-[#1db954]">{item.track}</p>
        <p class="truncate text-xs text-gray-400">{item.artist}</p>
      </div>
    </div>
  </a>

{:else}
  <!-- Grid View (Default) -->
  <div
    class="group relative flex flex-col gap-3 rounded-xl bg-[#181818] p-4 transition-all duration-300 hover:bg-[#282828] hover:shadow-xl"
    in:fly={{ y: 20, duration: 400, delay: index * 30 }}
  >
    <!-- Album Art -->
    <a
      href={spotifyUrl(item.uri)}
      target="_blank"
      rel="noopener noreferrer"
      class="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg"
    >
      <img
        src={item.imageUrl}
        alt={item.track}
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      <!-- Play Button -->
      <div
        class="absolute bottom-2 right-2 translate-y-2 translate-x-2 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#1db954] text-black transition-transform hover:scale-105 active:scale-95">
          <Play class="h-5 w-5 fill-current pl-0.5" />
        </div>
      </div>
    </a>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <a href={spotifyUrl(item.uri)} target="_blank" rel="noopener noreferrer" class="block">
        <h4 class="truncate text-base font-bold text-white transition-colors hover:text-[#1db954]">
          {item.track}
        </h4>
      </a>
      <p class="truncate text-sm text-gray-400 hover:text-white hover:underline cursor-pointer">
        {item.artist || 'Unknown Artist'}
      </p>
    </div>
    
    <!-- Footer -->
    <div class="flex items-center justify-between text-xs text-gray-500">
       <span class="truncate max-w-[60%]">{userName}</span>
       <span>{timeAgo(item.timestamp)}</span>
    </div>
  </div>
{/if}
