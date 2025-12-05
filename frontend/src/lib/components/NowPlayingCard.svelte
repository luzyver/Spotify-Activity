<script lang="ts">
  import type { NowPlayingBuddy } from '$lib/types';
  import { getUserName, timeAgo, spotifyUrl } from '$lib/utils';
  import { fly, fade } from 'svelte/transition';
  import { Play, Music, User, Clock } from 'lucide-svelte';

  interface Props {
    buddy: NowPlayingBuddy;
    index: number;
  }

  let { buddy, index }: Props = $props();

  const userName = $derived(buddy.user?.name || getUserName(buddy.user?.uri));
  const avatarUrl = $derived(
    buddy.user?.imageUrl ||
      `https://ui-avatars.com/api/?name=${userName}&background=1db954&color=fff`
  );
</script>

<div
  class="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#121212] transition-all duration-500 hover:scale-[1.02] hover:border-white/20 hover:shadow-2xl hover:shadow-[#1db954]/10"
  in:fly={{ y: 20, duration: 500, delay: index * 100 }}
>
  <!-- Dynamic Background Blur -->
  <div class="absolute inset-0 z-0 overflow-hidden">
    <img
      src={buddy.track?.imageUrl}
      alt=""
      class="h-full w-full scale-150 object-cover opacity-20 blur-3xl transition-transform duration-700 group-hover:scale-125"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent"></div>
  </div>

  <div class="relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
    <!-- Album Art -->
    <div class="relative shrink-0">
      <div class="relative aspect-square w-full overflow-hidden rounded-xl shadow-2xl shadow-black/50 sm:w-32">
        <img
          src={buddy.track?.imageUrl || ''}
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          alt={buddy.track?.name || 'Album art'}
          loading="lazy"
        />
        
        <!-- Play Overlay -->
        <a
          href={spotifyUrl(buddy.track?.uri)}
          target="_blank"
          rel="noopener noreferrer"
          class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <div class="rounded-full bg-[#1db954] p-3 text-black shadow-lg shadow-[#1db954]/20 transition-transform duration-300 hover:scale-110">
            <Play class="h-6 w-6 fill-current pl-1" />
          </div>
        </a>
      </div>
      
      <!-- Live Badge -->
      <div class="absolute -right-2 -top-2 flex items-center gap-1.5 rounded-full bg-[#1db954] px-2.5 py-1 shadow-lg shadow-black/20">
        <div class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
        </div>
        <span class="text-[10px] font-bold uppercase tracking-wider text-black">Now</span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex min-w-0 flex-1 flex-col justify-center space-y-3">
      <!-- Track Info -->
      <div>
        <a 
          href={spotifyUrl(buddy.track?.uri)} 
          target="_blank" 
          rel="noopener noreferrer"
          class="group/link block"
        >
          <h3 class="truncate text-xl font-bold text-white transition-colors group-hover/link:text-[#1db954] sm:text-2xl">
            {buddy.track?.name || 'Unknown Track'}
          </h3>
        </a>
        
        <div class="mt-1 flex items-center gap-2 text-sm text-gray-300 sm:text-base">
          <a 
            href={spotifyUrl(buddy.track?.artist?.uri)}
            target="_blank" 
            rel="noopener noreferrer" 
            class="hover:text-white hover:underline"
          >
            {buddy.track?.artist?.name || 'Unknown Artist'}
          </a>
          {#if buddy.track?.album?.name}
            <span class="text-gray-600">•</span>
            <a 
              href={spotifyUrl(buddy.track?.album?.uri)}
              target="_blank" 
              rel="noopener noreferrer"
              class="truncate text-gray-400 hover:text-white hover:underline"
            >
              {buddy.track?.album?.name}
            </a>
          {/if}
        </div>
      </div>

      <!-- User Context -->
      <div class="flex items-center justify-between gap-4 rounded-lg bg-white/5 p-3 backdrop-blur-sm sm:justify-start sm:pr-6">
        <div class="flex items-center gap-3">
          <img
            src={avatarUrl}
            class="h-8 w-8 rounded-full ring-2 ring-white/10"
            alt={userName}
            loading="lazy"
          />
          <div class="flex flex-col">
            <span class="text-xs font-medium text-gray-400">Listening now</span>
            <span class="text-sm font-semibold text-white">{userName}</span>
          </div>
        </div>
        
        <div class="flex items-center gap-1.5 text-xs font-medium text-[#1db954]">
          <Clock class="h-3.5 w-3.5" />
          <span>{timeAgo(buddy.timestamp)}</span>
        </div>
      </div>
    </div>
  </div>
</div>
