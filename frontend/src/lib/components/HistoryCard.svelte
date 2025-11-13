<script lang="ts">
  import type { HistoryItem } from '$lib/types';
  import type { ViewMode } from '$lib/stores/filters';
  import { timeAgo, spotifyUrl } from '$lib/utils';
  import { Motion } from 'svelte-motion';
  import { Play, Clock, ExternalLink } from 'lucide-svelte';
  import { theme } from '$lib/stores/theme';

  interface Props {
    item: HistoryItem;
    index: number;
    currentPage: number;
    itemsPerPage: number;
    viewMode?: ViewMode;
  }

  let { item, index, currentPage, itemsPerPage, viewMode = 'grid' }: Props = $props();

  const globalIndex = $derived((currentPage - 1) * itemsPerPage + index + 1);
  const isLight = $derived($theme === 'light');
</script>

{#if viewMode === 'list'}
  <!-- List View - Premium Glass -->
  <Motion
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.03, duration: 0.4 }}
    let:motion
  >
    <div
      use:motion
      class="premium-glass-card group flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5"
    >
      <!-- Album Art -->
      <a
        href={spotifyUrl(item.uri)}
        target="_blank"
        rel="noopener noreferrer"
        class="relative flex-shrink-0"
      >
        <div
          class="relative h-16 w-16 overflow-hidden rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
        >
          <img src={item.imageUrl} class="h-full w-full object-cover" alt={item.track} />
          <div
            class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
          >
            <Play class="h-6 w-6 fill-white text-white" />
          </div>
        </div>
      </a>

      <!-- Info -->
      <div class="min-w-0 flex-1">
        <a href={spotifyUrl(item.uri)} target="_blank" rel="noopener noreferrer" class="block">
          <h4
            class="mb-1 truncate text-base font-bold text-white transition-colors hover:text-[#1db954]"
          >
            {item.track}
          </h4>
        </a>
        <p class="mb-1 truncate text-sm text-gray-400">{item.artist || 'Unknown Artist'}</p>
        <div class="flex items-center gap-2 text-xs text-gray-500">
          <Clock class="h-3 w-3" />
          <span>{timeAgo(item.timestamp)}</span>
        </div>
      </div>

      <!-- Action -->
      <a
        href={spotifyUrl(item.uri)}
        target="_blank"
        rel="noopener noreferrer"
        class="flex-shrink-0 rounded-lg bg-white/5 p-2 opacity-0 transition-all hover:scale-110 hover:bg-[#1db954] group-hover:opacity-100"
      >
        <ExternalLink class="h-4 w-4 text-white" />
      </a>
    </div>
  </Motion>
{:else if viewMode === 'compact'}
  <!-- Compact View - Premium Glass -->
  <Motion
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.02, duration: 0.3 }}
    let:motion
  >
    <a
      use:motion
      href={spotifyUrl(item.uri)}
      target="_blank"
      rel="noopener noreferrer"
      class="premium-glass-card group block overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
    >
      <div class="relative aspect-square">
        <img src={item.imageUrl} alt={item.track} class="h-full w-full object-cover" />
        <div
          class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md"
            style="box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
          >
            <Play class="h-5 w-5 fill-white text-white" />
          </div>
        </div>
        <!-- Time Badge -->
        <div
          class="absolute right-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm"
        >
          {timeAgo(item.timestamp)}
        </div>
      </div>
      <div class="p-3">
        <p class="mb-1 truncate text-sm font-bold text-white">{item.track}</p>
        <p class="truncate text-xs text-gray-400">{item.artist || 'Unknown Artist'}</p>
      </div>
    </a>
  </Motion>
{:else}
  <!-- Grid View (Default) - Premium Glass -->
  <Motion
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04, duration: 0.4 }}
    let:motion
  >
    <div
      use:motion
      class="premium-glass-card group overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1"
    >
      <!-- Album Art -->
      <a
        href={spotifyUrl(item.uri)}
        target="_blank"
        rel="noopener noreferrer"
        class="relative block aspect-square overflow-hidden"
      >
        <img
          src={item.imageUrl}
          alt={item.track}
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <!-- Glass Overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
        ></div>

        <!-- Play Button -->
        <div
          class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/30"
            style="box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
          >
            <Play class="h-7 w-7 fill-white text-white" />
          </div>
        </div>

        <!-- Time Badge -->
        <div
          class="absolute right-3 top-3 rounded-xl bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md"
          style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3)"
        >
          {timeAgo(item.timestamp)}
        </div>
      </a>

      <!-- Info Section with Glass Effect -->
      <div class="p-4">
        <div class="space-y-2">
          <a href={spotifyUrl(item.uri)} target="_blank" rel="noopener noreferrer" class="block">
            <h4
              class="line-clamp-2 text-base font-bold leading-tight text-white transition-colors hover:text-[#1db954]"
            >
              {item.track}
            </h4>
          </a>

          <p class="truncate text-sm font-medium text-gray-300">
            {item.artist || 'Unknown Artist'}
          </p>

          {#if item.user}
            <p class="truncate text-xs text-gray-400">Played by {item.user}</p>
          {/if}
        </div>

        <!-- Action Bar -->
        <div class="mt-3 flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock class="h-3 w-3" />
            <span>{timeAgo(item.timestamp)}</span>
          </div>

          <a
            href={spotifyUrl(item.uri)}
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-lg bg-white/5 p-1.5 opacity-0 transition-all hover:scale-110 hover:bg-[#1db954] group-hover:opacity-100"
          >
            <ExternalLink class="h-3.5 w-3.5 text-white" />
          </a>
        </div>
      </div>
    </div>
  </Motion>
{/if}

<style>
  .premium-glass-card {
    position: relative;
    background: rgba(17, 25, 40, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 8px 32px 0 rgba(0, 0, 0, 0.37),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
  }

  .premium-glass-card:hover {
    border-color: rgba(29, 185, 84, 0.3);
    box-shadow:
      0 16px 48px 0 rgba(29, 185, 84, 0.2),
      0 0 0 1px rgba(29, 185, 84, 0.1),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
  }

  :global(.light) .premium-glass-card {
    background: rgba(255, 255, 255, 0.7);
    border-color: rgba(0, 0, 0, 0.1);
    box-shadow:
      0 8px 32px 0 rgba(0, 0, 0, 0.1),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.8);
  }

  :global(.light) .premium-glass-card:hover {
    border-color: rgba(29, 185, 84, 0.4);
    box-shadow:
      0 16px 48px 0 rgba(29, 185, 84, 0.15),
      0 0 0 1px rgba(29, 185, 84, 0.2),
      inset 0 1px 0 0 rgba(255, 255, 255, 1);
  }
</style>
