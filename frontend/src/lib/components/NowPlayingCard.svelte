<script lang="ts">
  import type { NowPlayingBuddy } from '$lib/types';
  import { getUserName, timeAgo, spotifyUrl } from '$lib/utils';
  import { fly } from 'svelte/transition';
  import { Play } from 'lucide-svelte';

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
  class="card-interactive group relative overflow-hidden p-4"
  in:fly={{ y: 20, duration: 400, delay: index * 80 }}
>
  <!-- Animated gradient overlay -->
  <div
    class="absolute inset-0 bg-gradient-to-br from-[#1db954]/0 via-[#1db954]/5 to-[#1db954]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
  ></div>

  <!-- Glow effect -->
  <div
    class="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#1db954]/20 to-[#1ed760]/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
  ></div>

  <!-- Album Art -->
  <div class="group/album relative z-10 mb-4">
    <a
      href={spotifyUrl(buddy.track?.uri)}
      target="_blank"
      rel="noopener noreferrer"
      class="relative block"
    >
      <div
        class="relative overflow-hidden rounded-xl shadow-2xl transition-shadow duration-300 group-hover:shadow-[#1db954]/30"
      >
        <img
          src={buddy.track?.imageUrl || ''}
          class="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
          alt={buddy.track?.name || 'Album art'}
          loading="lazy"
        />

        <!-- Overlay on Hover -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover/album:opacity-100"
        ></div>

        <!-- Play Button -->
        <div
          class="absolute bottom-3 right-3 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-gradient-to-br from-[#1db954] to-[#1ed760] opacity-0 shadow-xl shadow-[#1db954]/50 transition-all duration-300 hover:scale-110 active:scale-95 group-hover/album:translate-y-0 group-hover/album:opacity-100"
        >
          <Play class="h-5 w-5 translate-x-0.5 fill-black text-black" />
        </div>
      </div>

      <!-- Live Badge with pulse animation -->
      <div
        class="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#1db954] to-[#1ed760] px-3 py-1.5 shadow-lg shadow-[#1db954]/50"
      >
        <div class="relative">
          <div class="absolute h-2 w-2 animate-ping rounded-full bg-white"></div>
          <div class="h-2 w-2 animate-pulse rounded-full bg-white"></div>
        </div>
        <span class="text-[10px] font-bold uppercase tracking-wide text-white">Live</span>
      </div>
    </a>
  </div>

  <!-- Track Info -->
  <div class="relative z-10 space-y-2">
    <a href={spotifyUrl(buddy.track?.uri)} target="_blank" rel="noopener noreferrer" class="block">
      <h3
        class="line-clamp-1 text-base font-bold text-white transition-colors hover:text-[#1db954]"
      >
        {buddy.track?.name || ''}
      </h3>
    </a>

    <div class="space-y-1">
      <a
        href={spotifyUrl(buddy.track?.artist?.uri)}
        target="_blank"
        rel="noopener noreferrer"
        class="block truncate text-sm text-gray-400 transition-colors hover:text-white"
      >
        {buddy.track?.artist?.name || ''}
      </a>

      {#if buddy.track?.album?.name}
        <a
          href={spotifyUrl(buddy.track?.album?.uri)}
          target="_blank"
          rel="noopener noreferrer"
          class="block truncate text-xs text-gray-500 transition-colors hover:text-gray-300"
        >
          {buddy.track?.album?.name}
        </a>
      {/if}
    </div>

    <!-- User Info -->
    <div class="flex items-center gap-2 pt-2">
      <img
        src={avatarUrl}
        class="h-6 w-6 rounded-full ring-2 ring-white/10 transition-all group-hover:ring-[#1db954]/30"
        alt={userName}
        loading="lazy"
        onerror={(e) => ((e.currentTarget as HTMLImageElement).src = avatarUrl)}
      />
      <span class="truncate text-xs text-gray-400">{userName}</span>
      <span class="text-xs text-gray-700">•</span>
      <span class="text-xs text-gray-500">{timeAgo(buddy.timestamp)}</span>
    </div>
  </div>
</div>
