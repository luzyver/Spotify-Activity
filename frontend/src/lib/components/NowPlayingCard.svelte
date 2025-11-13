<script lang="ts">
  import type { NowPlayingBuddy } from '$lib/types';
  import { getUserName, timeAgo, spotifyUrl } from '$lib/utils';
  import { Motion } from 'svelte-motion';
  import { Play, ExternalLink, Clock, User } from 'lucide-svelte';
  import { theme } from '$lib/stores/theme';

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
  const isLight = $derived($theme === 'light');
</script>

<Motion
  initial={{ opacity: 0, y: 20, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{
    type: 'spring',
    stiffness: 120,
    damping: 20,
    delay: index * 0.08,
  }}
  let:motion
>
  <div
    use:motion
    class="premium-glass-card group relative overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1"
  >
    <!-- Glassmorphism Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl">
      <!-- Noise Texture -->
      <div
        class="absolute inset-0 opacity-[0.015]"
        style="background-image: url('data:image/svg+xml,%3Csvg viewBox=&quot;0 0 200 200&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cfilter id=&quot;noiseFilter&quot;%3E%3CfeTurbulence type=&quot;fractalNoise&quot; baseFrequency=&quot;3.5&quot; numOctaves=&quot;4&quot; stitchTiles=&quot;stitch&quot;/%3E%3C/filter%3E%3Crect width=&quot;100%25&quot; height=&quot;100%25&quot; filter=&quot;url(%23noiseFilter)&quot;/%3E%3C/svg%3E')"
      ></div>
    </div>

    <!-- Border Gradient -->
    <div
      class="absolute inset-0 rounded-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100"
      style="background: linear-gradient(135deg, rgba(29, 185, 84, 0.3), rgba(30, 215, 96, 0.1)); padding: 1px; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude;"
    ></div>

    <div class="relative z-10 p-5">
      <!-- Album Art with Premium Glass Effect -->
      <div class="group/album relative mb-5">
        <a
          href={spotifyUrl(buddy.track?.uri)}
          target="_blank"
          rel="noopener noreferrer"
          class="block"
        >
          <!-- Album Container with Layered Glass -->
          <div class="relative">
            <!-- Glow Effect Behind -->
            <div
              class="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#1db954]/30 to-[#1ed760]/10 opacity-0 blur-xl transition-opacity duration-500 group-hover/album:opacity-100"
            ></div>

            <!-- Album Image Container -->
            <div
              class="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 group-hover/album:scale-[1.02]"
              style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)"
            >
              <img
                src={buddy.track?.imageUrl || ''}
                class="aspect-square w-full object-cover"
                alt={buddy.track?.name || 'Album art'}
              />

              <!-- Glass Overlay on Hover -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 backdrop-blur-sm transition-all duration-500 group-hover/album:opacity-100"
              ></div>

              <!-- Play Button -->
              <div
                class="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover/album:opacity-100"
              >
                <div
                  class="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/30"
                  style="box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                >
                  <Play class="h-7 w-7 fill-white text-white drop-shadow-lg" />
                </div>
              </div>
            </div>

            <!-- Live Badge - Premium Glass -->
            <div
              class="absolute -right-2 -top-2 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1db954] to-[#1ed760] px-3 py-1.5 shadow-lg"
              style="box-shadow: 0 4px 16px rgba(29, 185, 84, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
            >
              <div class="h-2 w-2 animate-pulse rounded-full bg-white shadow-lg"></div>
              <span class="text-[10px] font-black uppercase tracking-wide text-white">Live</span>
            </div>
          </div>
        </a>
      </div>

      <!-- Track Info - Premium Typography -->
      <div class="space-y-3">
        <div class="space-y-1.5">
          <a
            href={spotifyUrl(buddy.track?.uri)}
            target="_blank"
            rel="noopener noreferrer"
            class="block"
          >
            <h3
              class="line-clamp-2 text-base font-bold leading-tight text-white transition-colors duration-300 hover:text-[#1db954]"
            >
              {buddy.track?.name || ''}
            </h3>
          </a>

          <a
            href={spotifyUrl(buddy.track?.artist?.uri)}
            target="_blank"
            rel="noopener noreferrer"
            class="block text-sm font-medium text-gray-300 transition-colors duration-300 hover:text-white"
          >
            {buddy.track?.artist?.name || ''}
          </a>

          {#if buddy.track?.album?.name}
            <a
              href={spotifyUrl(buddy.track?.album?.uri)}
              target="_blank"
              rel="noopener noreferrer"
              class="block text-xs text-gray-400 transition-colors duration-300 hover:text-gray-300"
            >
              {buddy.track?.album?.name}
            </a>
          {/if}
        </div>

        <!-- User Info with Glass Card -->
        <div
          class="flex items-center gap-3 rounded-xl bg-white/5 p-3 backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
          style="box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1)"
        >
          <div class="relative flex-shrink-0">
            <img
              src={avatarUrl}
              class="h-10 w-10 rounded-full ring-2 ring-white/20"
              alt={userName}
              onerror={(e) => ((e.currentTarget as HTMLImageElement).src = avatarUrl)}
            />
            <div
              class="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-black bg-[#1db954] shadow-lg"
            ></div>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <User class="h-3 w-3 text-gray-400" />
              <p class="truncate text-sm font-semibold text-white">{userName}</p>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-400">
              <Clock class="h-3 w-3" />
              <span>{timeAgo(buddy.timestamp)}</span>
            </div>
          </div>

          <a
            href={spotifyUrl(buddy.track?.uri)}
            target="_blank"
            rel="noopener noreferrer"
            class="flex-shrink-0 rounded-lg bg-white/10 p-2 transition-all duration-300 hover:scale-110 hover:bg-[#1db954]"
          >
            <ExternalLink class="h-4 w-4 text-white" />
          </a>
        </div>
      </div>
    </div>
  </div>
</Motion>

<style>
  .premium-glass-card {
    position: relative;
    background: rgba(17, 25, 40, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 8px 32px 0 rgba(0, 0, 0, 0.37),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
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
