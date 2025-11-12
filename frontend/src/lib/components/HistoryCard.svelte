<script lang="ts">
  import type { HistoryItem } from '$lib/types';
  import { getUserColor, timeAgo, spotifyUrl } from '$lib/utils';
  import { Motion } from 'svelte-motion';
  import { Play, Clock, User, Sparkles } from 'lucide-svelte';

  interface Props {
    item: HistoryItem;
    index: number;
    currentPage: number;
    itemsPerPage: number;
  }

  let { item, index, currentPage, itemsPerPage }: Props = $props();

  const userColor = $derived(getUserColor(item.userId));
  const globalIndex = $derived((currentPage - 1) * itemsPerPage + index + 1);

  import { COLOR_PALETTES } from '$lib/palettes';

  const palette = $derived(COLOR_PALETTES[globalIndex % COLOR_PALETTES.length]);
</script>

<Motion
  initial={{ opacity: 0, y: 30, scale: 0.9 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{
    type: 'spring',
    stiffness: 100,
    damping: 15,
    mass: 1,
    delay: (index % itemsPerPage) * 0.08,
  }}
  let:motion
>
  <div
    use:motion
    class="group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-700 ease-out hover:scale-[1.03]"
    style="background: linear-gradient(135deg, {palette.primary}15, {palette.secondary}15)"
  >
    <!-- Playful Background Effects -->
    <div class="absolute inset-0 bg-gradient-to-br {palette.gradient} opacity-60"></div>
    <div
      class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
    ></div>

    <!-- Floating Sparkles on hover -->
    <div
      class="absolute right-2 top-2 opacity-0 transition-all duration-500 ease-out group-hover:opacity-100"
    >
      <Sparkles
        class="h-4 w-4 animate-pulse text-yellow-300"
        style="filter: drop-shadow(0 0 8px {palette.primary})"
      />
    </div>

    <!-- Animated Border Glow -->
    <div
      class="absolute inset-0 rounded-2xl opacity-0 transition-all duration-700 ease-out group-hover:opacity-100"
      style="box-shadow: inset 0 0 20px {palette.primary}40, 0 0 30px {palette.primary}20"
    ></div>

    <div class="relative z-10 p-3 sm:p-4">
      <!-- Album Art with Playful Effects -->
      <div class="group/album relative mb-3">
        <a href={spotifyUrl(item.uri)} target="_blank" rel="noopener noreferrer" class="block">
          <div
            class="relative overflow-hidden rounded-xl shadow-2xl transition-all duration-700 ease-out group-hover/album:rotate-1 group-hover/album:scale-105"
            style="box-shadow: 0 20px 40px {palette.primary}40"
          >
            <img src={item.imageUrl} class="aspect-square w-full object-cover" alt={item.track} />

            <!-- Gradient Overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover/album:opacity-100"
            ></div>

            <!-- Play Button - Centered & Bouncy -->
            <div
              class="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 ease-out group-hover/album:opacity-100"
            >
              <div
                class="animate-bounce-slow rounded-full p-4 transition-transform duration-300 ease-out hover:scale-125"
                style="background: linear-gradient(135deg, {palette.primary}, {palette.secondary}); box-shadow: 0 0 30px {palette.primary}80"
              >
                <Play class="h-6 w-6 fill-white text-white drop-shadow-lg" />
              </div>
            </div>
          </div>

          <!-- Rank Badge - Top Left -->
          <div
            class="animate-bounce-gentle absolute -left-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full text-sm font-black shadow-lg"
            style="background: linear-gradient(135deg, {palette.primary}, {palette.secondary}); box-shadow: 0 0 20px {palette.primary}60"
          >
            #{globalIndex}
          </div>
        </a>
      </div>

      <!-- Track Info - Colorful -->
      <div class="space-y-1.5 sm:space-y-2">
        <a href={spotifyUrl(item.uri)} target="_blank" rel="noopener noreferrer" class="block">
          <h3
            class="line-clamp-2 text-sm font-black leading-tight transition-transform duration-500 ease-out group-hover:scale-105 sm:text-base"
            style="color: {palette.primary}; text-shadow: 0 0 20px {palette.primary}40"
          >
            {item.track}
          </h3>
        </a>

        <p
          class="truncate text-xs font-semibold text-gray-300 transition-colors duration-300 ease-out sm:text-sm"
          title={item.artist}
        >
          {item.artist}
        </p>

        <!-- Meta Info - Compact -->
        <div class="flex items-center justify-between border-t border-white/10 pt-2 text-xs">
          <div class="flex items-center gap-1.5 text-gray-400">
            <Clock class="h-3 w-3" />
            <span>{timeAgo(item.timestamp)}</span>
          </div>

          <div
            class="flex items-center gap-1.5 rounded-full px-2 py-1 transition-all duration-500 ease-out hover:scale-105"
            style="background: linear-gradient(135deg, {palette.primary}30, {palette.secondary}30); color: {palette.primary}"
          >
            <User class="h-3 w-3" />
            <span class="max-w-[60px] truncate font-bold">{item.user}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Accent Line -->
    <div
      class="absolute bottom-0 left-0 h-1 w-full transition-all duration-700 ease-out group-hover:h-2"
      style="background: linear-gradient(90deg, {palette.primary}, {palette.secondary})"
    ></div>
  </div>
</Motion>

<style>
  @keyframes bounce-slow {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes bounce-gentle {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-5px) scale(1.05);
    }
  }

  .animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
  }

  .animate-bounce-gentle {
    animation: bounce-gentle 3s ease-in-out infinite;
  }
</style>
