<script lang="ts">
  import type { HistoryItem } from '$lib/types';

  import { Trophy, Music, Clock, Disc3, Sparkles, Flame } from 'lucide-svelte';
  import { Motion } from 'svelte-motion';

  interface Props {
    history: HistoryItem[];
  }

  let { history }: Props = $props();

  // Hand-picked color palette for stats
  const statColors = {
    tracks: {
      primary: '#1ed760',
      secondary: '#1db954',
      gradient: 'from-[#1ed760]/20 to-[#1db954]/10',
    },
    time: {
      primary: '#4facfe',
      secondary: '#00f2fe',
      gradient: 'from-[#4facfe]/20 to-[#00f2fe]/10',
    },
    artists: {
      primary: '#b06ab3',
      secondary: '#4568dc',
      gradient: 'from-[#b06ab3]/20 to-[#4568dc]/10',
    },
    listeners: {
      primary: '#ffa751',
      secondary: '#ffe259',
      gradient: 'from-[#ffa751]/20 to-[#ffe259]/10',
    },
  };

  // User stats data
  const userStatsData = $derived.by(() => {
    const stats: Record<string, { user: string; count: number }> = {};

    history.forEach((item) => {
      if (!stats[item.userId]) {
        stats[item.userId] = {
          user: item.user,
          count: 0,
        };
      }
      stats[item.userId].count++;
    });

    return Object.values(stats).sort((a, b) => b.count - a.count);
  });

  // Top artists
  const topArtists = $derived.by(() => {
    const artistCount: Record<string, number> = {};

    history.forEach((item) => {
      artistCount[item.artist] = (artistCount[item.artist] || 0) + 1;
    });

    return Object.entries(artistCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([artist, count]) => ({ artist, count }));
  });

  // Total unique artists count
  const totalArtists = $derived.by(() => {
    const uniqueArtists = new Set(history.map((item) => item.artist));
    return uniqueArtists.size;
  });

  // Most played tracks (all tracks with highest count)
  const topTracks = $derived.by(() => {
    const trackCount: Record<
      string,
      { track: string; artist: string; count: number; imageUrl: string }
    > = {};

    history.forEach((item) => {
      const key = `${item.track}-${item.artist}`;
      if (!trackCount[key]) {
        trackCount[key] = {
          track: item.track,
          artist: item.artist,
          count: 1,
          imageUrl: item.imageUrl,
        };
      } else {
        trackCount[key].count++;
      }
    });

    const sorted = Object.values(trackCount).sort((a, b) => b.count - a.count);
    if (sorted.length === 0) return [];

    // Get all tracks with the highest count
    const maxCount = sorted[0].count;
    return sorted.filter((track) => track.count === maxCount);
  });

  // Total listening time estimate (avg 3.5 min per track)
  const totalMinutes = $derived(Math.round(history.length * 3.5));
  const hours = $derived(Math.floor(totalMinutes / 60));
  const minutes = $derived(totalMinutes % 60);
</script>

{#if history.length > 0}
  <Motion
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      type: 'spring',
      stiffness: 100,
      damping: 15,
      mass: 1,
    }}
    let:motion
  >
    <div
      use:motion
      class="group relative overflow-hidden rounded-2xl p-5"
      style="background: linear-gradient(135deg, {statColors.tracks.primary}10, {statColors.artists
        .primary}10)"
    >
      <!-- Playful Background -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-[#1ed760]/10 via-[#b06ab3]/10 to-[#4facfe]/10 opacity-60"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
      ></div>

      <!-- Sparkles decoration -->
      <div class="absolute right-4 top-4 opacity-70">
        <Sparkles class="h-6 w-6 animate-pulse text-yellow-300" />
      </div>

      <!-- Animated Border Glow -->
      <div
        class="absolute inset-0 rounded-2xl opacity-0 transition-all duration-700 ease-out group-hover:opacity-100"
        style="box-shadow: inset 0 0 30px {statColors.tracks.primary}30, 0 0 40px {statColors.tracks
          .primary}20"
      ></div>

      <div class="relative z-10">
        <!-- Header -->
        <div class="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl"
            style="background: linear-gradient(135deg, {statColors.tracks.primary}, {statColors
              .tracks.secondary})"
          >
            <Trophy class="h-5 w-5 text-white" />
          </div>
          <h3
            class="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-lg font-black text-transparent"
          >
            Today's Stats
          </h3>
          <Flame class="ml-auto h-5 w-5 animate-pulse text-orange-500" />
        </div>

        <!-- Quick Stats Grid - Colorful & Playful -->
        <div class="mb-5 grid grid-cols-2 gap-3">
          <Motion
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 120,
              damping: 12,
              mass: 0.8,
              delay: 0.1,
            }}
            whileHover={{ scale: 1.08, rotate: 2 }}
            let:motion
          >
            <div
              use:motion
              class="group/stat relative overflow-hidden rounded-xl p-4 transition-all duration-500 ease-out"
              style="background: linear-gradient(135deg, {statColors.tracks.primary}20, {statColors
                .tracks.secondary}20)"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br {statColors.tracks.gradient} opacity-60"
              ></div>
              <div
                class="absolute bottom-0 right-0 h-20 w-20 rounded-full opacity-50 blur-2xl"
                style="background: {statColors.tracks.primary}"
              ></div>
              <div class="relative z-10 flex flex-col items-center justify-center gap-2">
                <Music
                  class="h-6 w-6 transition-transform duration-500 ease-out group-hover/stat:scale-125"
                  style="color: {statColors.tracks.primary}"
                />
                <div
                  class="text-3xl font-black"
                  style="color: {statColors.tracks.primary}; text-shadow: 0 0 20px {statColors
                    .tracks.primary}40"
                >
                  {history.length}
                </div>
                <span class="text-xs font-bold uppercase tracking-wide text-gray-300">Tracks</span>
              </div>
            </div>
          </Motion>

          <Motion
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 120,
              damping: 12,
              mass: 0.8,
              delay: 0.2,
            }}
            whileHover={{ scale: 1.08, rotate: -2 }}
            let:motion
          >
            <div
              use:motion
              class="group/stat relative overflow-hidden rounded-xl p-4 transition-all duration-500 ease-out"
              style="background: linear-gradient(135deg, {statColors.time.primary}20, {statColors
                .time.secondary}20)"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br {statColors.time.gradient} opacity-60"
              ></div>
              <div
                class="absolute bottom-0 right-0 h-20 w-20 rounded-full opacity-50 blur-2xl"
                style="background: {statColors.time.primary}"
              ></div>
              <div class="relative z-10 flex flex-col items-center justify-center gap-2">
                <Clock
                  class="h-6 w-6 transition-transform duration-500 ease-out group-hover/stat:scale-125"
                  style="color: {statColors.time.primary}"
                />
                <div
                  class="text-3xl font-black"
                  style="color: {statColors.time.primary}; text-shadow: 0 0 20px {statColors.time
                    .primary}40"
                >
                  {hours}h {minutes}m
                </div>
                <span class="text-xs font-bold uppercase tracking-wide text-gray-300">Time</span>
              </div>
            </div>
          </Motion>

          <Motion
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 120,
              damping: 12,
              mass: 0.8,
              delay: 0.3,
            }}
            whileHover={{ scale: 1.08, rotate: 2 }}
            let:motion
          >
            <div
              use:motion
              class="group/stat relative overflow-hidden rounded-xl p-4 transition-all duration-500 ease-out"
              style="background: linear-gradient(135deg, {statColors.artists.primary}20, {statColors
                .artists.secondary}20)"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br {statColors.artists.gradient} opacity-60"
              ></div>
              <div
                class="absolute bottom-0 right-0 h-20 w-20 rounded-full opacity-50 blur-2xl"
                style="background: {statColors.artists.primary}"
              ></div>
              <div class="relative z-10 flex flex-col items-center justify-center gap-2">
                <Disc3
                  class="h-6 w-6 transition-transform duration-500 ease-out group-hover/stat:scale-125"
                  style="color: {statColors.artists.primary}"
                />
                <div
                  class="text-3xl font-black"
                  style="color: {statColors.artists.primary}; text-shadow: 0 0 20px {statColors
                    .artists.primary}40"
                >
                  {totalArtists}
                </div>
                <span class="text-xs font-bold uppercase tracking-wide text-gray-300">Artists</span>
              </div>
            </div>
          </Motion>

          <Motion
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 120,
              damping: 12,
              mass: 0.8,
              delay: 0.4,
            }}
            whileHover={{ scale: 1.08, rotate: -2 }}
            let:motion
          >
            <div
              use:motion
              class="group/stat relative overflow-hidden rounded-xl p-4 transition-all duration-500 ease-out"
              style="background: linear-gradient(135deg, {statColors.listeners
                .primary}20, {statColors.listeners.secondary}20)"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br {statColors.listeners
                  .gradient} opacity-60"
              ></div>
              <div
                class="absolute bottom-0 right-0 h-20 w-20 rounded-full opacity-50 blur-2xl"
                style="background: {statColors.listeners.primary}"
              ></div>
              <div class="relative z-10 flex flex-col items-center justify-center gap-2">
                <Trophy
                  class="h-6 w-6 transition-transform duration-500 ease-out group-hover/stat:scale-125"
                  style="color: {statColors.listeners.primary}"
                />
                <div
                  class="text-3xl font-black"
                  style="color: {statColors.listeners.primary}; text-shadow: 0 0 20px {statColors
                    .listeners.primary}40"
                >
                  {userStatsData.length}
                </div>
                <span class="text-xs font-bold uppercase tracking-wide text-gray-300"
                  >Listeners</span
                >
              </div>
            </div>
          </Motion>
        </div>

        <!-- Most Played Tracks - Colorful -->
        {#if topTracks.length > 0}
          <div
            class="relative mb-5 overflow-hidden rounded-xl p-4"
            style="background: linear-gradient(135deg, {statColors.tracks.primary}15, {statColors
              .tracks.secondary}15)"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r {statColors.tracks.gradient} opacity-60"
            ></div>
            <div
              class="absolute right-0 top-0 h-32 w-32 rounded-full opacity-30 blur-3xl"
              style="background: {statColors.tracks.primary}"
            ></div>

            <div class="relative z-10">
              <div class="mb-3 flex items-center gap-2">
                <Flame class="h-5 w-5" style="color: {statColors.tracks.primary}" />
                <span class="text-sm font-black uppercase tracking-wide text-gray-300"
                  >Most Played</span
                >
                <span
                  class="ml-auto rounded-full px-3 py-1 text-sm font-black"
                  style="background: {statColors.tracks.primary}30; color: {statColors.tracks
                    .primary}"
                >
                  {topTracks[0].count}x
                </span>
              </div>
              <div class="space-y-2">
                {#each topTracks as track (track.track + ':' + track.artist)}
                  <div
                    class="flex items-center gap-3 rounded-lg p-2 transition-all duration-500 ease-out hover:scale-105"
                    style="background: {statColors.tracks.primary}10"
                  >
                    <img
                      src={track.imageUrl}
                      class="h-12 w-12 flex-shrink-0 rounded-lg shadow-lg transition-transform duration-500 ease-out"
                      alt={track.track}
                      style="box-shadow: 0 4px 12px {statColors.tracks.primary}40"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="truncate text-sm font-bold text-white">{track.track}</div>
                      <div class="truncate text-xs text-gray-400">{track.artist}</div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <!-- Top Listeners - Colorful -->
        <div
          class="relative overflow-hidden rounded-xl p-4"
          style="background: linear-gradient(135deg, {statColors.listeners.primary}15, {statColors
            .listeners.secondary}15)"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r {statColors.listeners.gradient} opacity-60"
          ></div>
          <div
            class="absolute bottom-0 left-0 h-32 w-32 rounded-full opacity-30 blur-3xl"
            style="background: {statColors.listeners.primary}"
          ></div>

          <div class="relative z-10">
            <div class="mb-3 flex items-center gap-2">
              <Trophy class="h-5 w-5" style="color: {statColors.listeners.primary}" />
              <span class="text-sm font-black uppercase tracking-wide text-gray-300"
                >Top Listeners</span
              >
            </div>
            <div class="space-y-2">
              {#each userStatsData as stat, index (stat.user)}
                <div
                  class="flex items-center gap-3 rounded-lg p-2 transition-all duration-500 ease-out hover:scale-105"
                  style="background: {statColors.listeners.primary}10"
                >
                  <div class="flex min-w-0 flex-1 items-center gap-3">
                    <!-- Rank Badge -->
                    <div
                      class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-black transition-transform duration-500 ease-out"
                      style="background: linear-gradient(135deg, {statColors.listeners
                        .primary}, {statColors.listeners.secondary})"
                    >
                      {#if index === 0}
                        <Trophy class="h-4 w-4 text-white" />
                      {:else if index === 1}
                        <Trophy class="h-4 w-4 text-white" />
                      {:else if index === 2}
                        <Trophy class="h-4 w-4 text-white" />
                      {:else}
                        <span class="text-white">{index + 1}</span>
                      {/if}
                    </div>
                    <!-- Name -->
                    <span class="truncate text-sm font-bold text-white">
                      {stat.user}
                    </span>
                  </div>
                  <!-- Progress & Count -->
                  <div class="flex flex-shrink-0 items-center gap-2">
                    <div class="h-2 w-16 overflow-hidden rounded-full bg-white/10">
                      <div
                        class="h-full rounded-full transition-all duration-700 ease-out"
                        style="width: {(stat.count / userStatsData[0].count) *
                          100}%; background: linear-gradient(90deg, {statColors.listeners
                          .primary}, {statColors.listeners.secondary})"
                      ></div>
                    </div>
                    <span
                      class="w-6 text-right text-xs font-black"
                      style="color: {statColors.listeners.primary}">{stat.count}</span
                    >
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </Motion>
{/if}
