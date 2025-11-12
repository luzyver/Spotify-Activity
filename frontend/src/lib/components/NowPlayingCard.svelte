<script lang="ts">
  import type { NowPlayingBuddy } from '$lib/types';
  import { getUserName, timeAgo, spotifyUrl } from '$lib/utils';
  import { Motion } from 'svelte-motion';
  import { Play, Sparkles, Music, Heart } from 'lucide-svelte';

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

  import { COLOR_PALETTES } from '$lib/palettes';

  const palette = $derived(COLOR_PALETTES[index % COLOR_PALETTES.length]);
</script>

<Motion
  initial={{ opacity: 0, y: 30, scale: 0.9 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{
    type: 'spring',
    stiffness: 100,
    damping: 15,
    mass: 1,
    delay: index * 0.1,
  }}
  let:motion
>
  <div
    use:motion
    class="group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-700 ease-out hover:scale-[1.02]"
    style="background: linear-gradient(135deg, {palette.primary}15, {palette.secondary}15)"
  >
    <!-- Playful Background Effects -->
    <div class="absolute inset-0 bg-gradient-to-br {palette.gradient} opacity-60"></div>
    <div
      class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
    ></div>

    <!-- Floating Sparkles -->
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

    <div class="relative z-10 p-4">
      <!-- Album Art with Playful Tilt -->
      <div class="group/album relative mb-4">
        <a
          href={spotifyUrl(buddy.track?.uri)}
          target="_blank"
          rel="noopener noreferrer"
          class="block"
        >
          <div
            class="relative overflow-hidden rounded-xl shadow-2xl transition-all duration-700 ease-out group-hover/album:rotate-2 group-hover/album:scale-105"
            style="box-shadow: 0 20px 40px {palette.primary}40"
          >
            <img
              src={buddy.track?.imageUrl || ''}
              class="aspect-square w-full object-cover"
              alt={buddy.track?.name || 'Album art'}
            />

            <!-- Gradient Overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover/album:opacity-100"
            ></div>

            <!-- Play Button - Centered & Bouncy -->
            <div
              class="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 ease-out group-hover/album:opacity-100"
            >
              <div
                class="animate-bounce-slow rounded-full p-5 transition-transform duration-300 ease-out hover:scale-125"
                style="background: linear-gradient(135deg, {palette.primary}, {palette.secondary}); box-shadow: 0 0 30px {palette.primary}80"
              >
                <Play class="h-8 w-8 fill-white text-white drop-shadow-lg" />
              </div>
            </div>
          </div>

          <!-- Live Music Badge - Floating -->
          <div
            class="animate-bounce-gentle absolute -right-2 -top-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black shadow-lg"
            style="background: linear-gradient(135deg, {palette.primary}, {palette.secondary})"
          >
            <Music class="h-3 w-3 animate-pulse" />
            <span>LIVE</span>
          </div>
        </a>
      </div>

      <!-- Track Info - Bold & Colorful -->
      <div class="space-y-2">
        <a
          href={spotifyUrl(buddy.track?.uri)}
          target="_blank"
          rel="noopener noreferrer"
          class="block"
        >
          <h3
            class="mb-1 line-clamp-2 text-base font-black leading-tight transition-transform duration-500 ease-out group-hover:scale-105"
            style="color: {palette.primary}; text-shadow: 0 0 20px {palette.primary}40"
          >
            {buddy.track?.name || ''}
          </h3>
        </a>

        <a
          href={spotifyUrl(buddy.track?.artist?.uri)}
          target="_blank"
          rel="noopener noreferrer"
          class="line-clamp-1 block text-sm font-semibold text-gray-300 transition-colors duration-300 ease-out hover:text-white"
        >
          {buddy.track?.artist?.name || ''}
        </a>

        <a
          href={spotifyUrl(buddy.track?.album?.uri)}
          target="_blank"
          rel="noopener noreferrer"
          class="line-clamp-1 block text-xs italic text-gray-500 transition-colors duration-300 ease-out hover:text-gray-400"
        >
          {buddy.track?.album?.name || ''}
        </a>

        <!-- User Info - Fun Card -->
        <div class="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
          <div class="relative">
            <img
              src={avatarUrl}
              class="h-9 w-9 rounded-full ring-2 transition-all duration-500 ease-out"
              style="ring-color: {palette.primary}"
              alt={userName}
              onerror={(e) => ((e.currentTarget as HTMLImageElement).src = avatarUrl)}
            />
            <div
              class="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-black"
              style="background: {palette.primary}; box-shadow: 0 0 10px {palette.primary}"
            ></div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-xs font-bold text-white">{userName}</div>
            <div class="flex items-center gap-1 text-[10px] text-gray-400">
              <Heart class="h-2.5 w-2.5 fill-current" style="color: {palette.secondary}" />
              <span>{timeAgo(buddy.timestamp)}</span>
            </div>
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
