<script lang="ts">
	import type { HistoryItem } from '$lib/types';
	import { getUserColor } from '$lib/utils';
	import { Trophy, Music, Clock, Disc3 } from 'lucide-svelte';
	import { Motion } from 'svelte-motion';

	interface Props {
		history: HistoryItem[];
	}

	let { history }: Props = $props();

	// User stats data
	const userStatsData = $derived.by(() => {
		const stats: Record<string, { user: string; count: number; color: string }> = {};

		history.forEach(item => {
			if (!stats[item.userId]) {
				stats[item.userId] = {
					user: item.user,
					count: 0,
					color: getUserColor(item.userId)
				};
			}
			stats[item.userId].count++;
		});

		return Object.values(stats).sort((a, b) => b.count - a.count);
	});

	// Top artists
	const topArtists = $derived.by(() => {
		const artistCount: Record<string, number> = {};

		history.forEach(item => {
			artistCount[item.artist] = (artistCount[item.artist] || 0) + 1;
		});

		return Object.entries(artistCount)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([artist, count]) => ({ artist, count }));
	});

	// Total unique artists count
	const totalArtists = $derived.by(() => {
		const uniqueArtists = new Set(history.map(item => item.artist));
		return uniqueArtists.size;
	});

	// Most played tracks (all tracks with highest count)
	const topTracks = $derived.by(() => {
		const trackCount: Record<string, { track: string; artist: string; count: number; imageUrl: string }> = {};

		history.forEach(item => {
			const key = `${item.track}-${item.artist}`;
			if (!trackCount[key]) {
				trackCount[key] = {
					track: item.track,
					artist: item.artist,
					count: 1,
					imageUrl: item.imageUrl
				};
			} else {
				trackCount[key].count++;
			}
		});

		const sorted = Object.values(trackCount).sort((a, b) => b.count - a.count);
		if (sorted.length === 0) return [];

		// Get all tracks with the highest count
		const maxCount = sorted[0].count;
		return sorted.filter(track => track.count === maxCount);
	});

	// Total listening time estimate (avg 3.5 min per track)
	const totalMinutes = $derived(Math.round(history.length * 3.5));
	const hours = $derived(Math.floor(totalMinutes / 60));
	const minutes = $derived(totalMinutes % 60);
</script>

{#if history.length > 0}
	<Motion
		initial={{ opacity: 0, scale: 0.95 }}
		animate={{ opacity: 1, scale: 1 }}
		transition={{ duration: 0.6, ease: "backOut" }}
		let:motion
	>
		<div use:motion class="blur-card gradient-bg-1 rounded-xl sm:rounded-2xl p-3 sm:p-5 relative overflow-hidden group">
			<!-- Header -->
			<div class="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-white/10">
				<Trophy class="w-4 h-4 sm:w-5 sm:h-5 text-[#1db954]" />
				<h3 class="text-sm sm:text-base lg:text-lg font-bold">Today's Stats</h3>
			</div>

			<!-- Quick Stats Grid - Enhanced -->
			<div class="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-5">
				<Motion
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.1, duration: 0.4 }}
					whileHover={{ scale: 1.05 }}
					let:motion
				>
					<div use:motion class="bg-gradient-to-br from-[#1db954]/20 to-transparent rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#1db954]/30 flex flex-col items-center justify-center gap-1 sm:gap-2 backdrop-blur-sm">
						<Music class="w-4 h-4 sm:w-5 sm:h-5 text-[#1db954]" />
						<div class="text-xl sm:text-2xl font-bold text-white">{history.length}</div>
						<span class="text-[10px] sm:text-xs text-gray-400 font-medium">Tracks</span>
					</div>
				</Motion>

				<Motion
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.2, duration: 0.4 }}
					whileHover={{ scale: 1.05 }}
					let:motion
				>
					<div use:motion class="bg-gradient-to-br from-blue-500/20 to-transparent rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-500/30 flex flex-col items-center justify-center gap-1 sm:gap-2 backdrop-blur-sm">
						<Clock class="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
						<div class="text-xl sm:text-2xl font-bold text-white">{hours}h {minutes}m</div>
						<span class="text-[10px] sm:text-xs text-gray-400 font-medium">Time</span>
					</div>
				</Motion>

				<Motion
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.3, duration: 0.4 }}
					whileHover={{ scale: 1.05 }}
					let:motion
				>
					<div use:motion class="bg-gradient-to-br from-purple-500/20 to-transparent rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-500/30 flex flex-col items-center justify-center gap-1 sm:gap-2 backdrop-blur-sm">
						<Disc3 class="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
						<div class="text-xl sm:text-2xl font-bold text-white">{totalArtists}</div>
						<span class="text-[10px] sm:text-xs text-gray-400 font-medium">Artists</span>
					</div>
				</Motion>

				<Motion
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.4, duration: 0.4 }}
					whileHover={{ scale: 1.05 }}
					let:motion
				>
					<div use:motion class="bg-gradient-to-br from-yellow-500/20 to-transparent rounded-lg sm:rounded-xl p-3 sm:p-4 border border-yellow-500/30 flex flex-col items-center justify-center gap-1 sm:gap-2 backdrop-blur-sm">
						<Trophy class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
						<div class="text-xl sm:text-2xl font-bold text-white">{userStatsData.length}</div>
						<span class="text-[10px] sm:text-xs text-gray-400 font-medium">Listeners</span>
					</div>
				</Motion>
			</div>

			<!-- Most Played Tracks - Compact -->
			{#if topTracks.length > 0}
				<div class="bg-gradient-to-r from-[#1db954]/10 to-transparent rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-5 border border-[#1db954]/20">
					<div class="flex items-center gap-1.5 sm:gap-2 mb-2">
						<Trophy class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#1db954]" />
						<span class="text-[10px] sm:text-xs text-gray-400 font-medium">Most Played</span>
						<span class="ml-auto text-[10px] sm:text-xs text-[#1db954] font-bold">{topTracks[0].count}x</span>
					</div>
					<div class="space-y-2">
						{#each topTracks as track}
							<div class="flex items-center gap-2 sm:gap-3">
								<img src={track.imageUrl} class="w-10 h-10 sm:w-12 sm:h-12 rounded-md shadow-md flex-shrink-0" alt={track.track} />
								<div class="flex-1 min-w-0">
									<div class="font-semibold text-xs sm:text-sm text-white truncate">{track.track}</div>
									<div class="text-[10px] sm:text-xs text-gray-400 truncate">{track.artist}</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Top Listeners - Compact -->
			<div>
				<div class="flex items-center gap-2 mb-2 sm:mb-3">
					<span class="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide">Top Listeners</span>
				</div>
				<div class="space-y-1.5 sm:space-y-2">
					{#each userStatsData as stat, index}
						<div class="flex items-center gap-1.5 sm:gap-2 group">
							<div class="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
								<!-- Rank -->
								<div class="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0">
									{#if index === 0}
										<Trophy class="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
									{:else if index === 1}
										<Trophy class="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
									{:else if index === 2}
										<Trophy class="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
									{:else}
										<span class="text-[10px] sm:text-xs text-gray-600 font-medium">{index + 1}</span>
									{/if}
								</div>
								<!-- Name -->
								<span class="text-xs sm:text-sm font-medium truncate" style="color: {stat.color}">
									{stat.user}
								</span>
							</div>
							<!-- Progress -->
							<div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
								<div class="w-12 sm:w-16 md:w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
									<div
										class="h-full rounded-full transition-all duration-500"
										style="width: {(stat.count / userStatsData[0].count) * 100}%; background-color: {stat.color}"
									></div>
								</div>
								<span class="text-[10px] sm:text-xs font-bold text-gray-400 w-5 sm:w-6 text-right">{stat.count}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</Motion>
{/if}
