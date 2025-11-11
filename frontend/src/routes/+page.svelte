<script lang="ts">
	import { onMount } from 'svelte';
	import Particles from '$lib/components/Particles.svelte';
	import Equalizer from '$lib/components/Equalizer.svelte';
	import NowPlayingCard from '$lib/components/NowPlayingCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import HistoryCard from '$lib/components/HistoryCard.svelte';
	import { ITEMS_PER_PAGE, API_ENDPOINTS } from '$lib/config';
	import { getUserColor } from '$lib/utils';
	import type { NowPlayingBuddy, HistoryItem } from '$lib/types';

	let nowPlaying = $state<NowPlayingBuddy[]>([]);
	let history = $state<HistoryItem[]>([]);
	let totalTracks = $state(0);
	let currentPage = $state(1);
	let totalPages = $derived(Math.ceil(history.length / ITEMS_PER_PAGE));
	let paginatedHistory = $derived(
		history.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
	);

	// User stats
	let userStats = $derived.by(() => {
		const stats: Record<string, { count: number; name: string; color: string }> = {};
		history.forEach((item) => {
			if (!stats[item.userId]) {
				stats[item.userId] = {
					count: 0,
					name: item.user,
					color: getUserColor(item.userId)
				};
			}
			stats[item.userId].count++;
		});
		return Object.values(stats);
	});

	async function loadNowPlaying() {
		try {
			const response = await fetch(API_ENDPOINTS.LIVE, {
				cache: 'no-cache',
				mode: 'cors'
			});
			const data = await response.json();
			nowPlaying = data.friends || [];
		} catch (error) {
			console.error('Error loading now playing:', error);
		}
	}

	async function loadHistory() {
		try {
			const response = await fetch(API_ENDPOINTS.HISTORY, {
				cache: 'no-cache',
				mode: 'cors'
			});
			const data = await response.json();
			history = data.sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp);
			totalTracks = history.length;
		} catch (error) {
			console.error('Error loading history:', error);
		}
	}

	function goToPage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		// Scroll to history section
		document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	onMount(() => {
		loadNowPlaying();
		loadHistory();
	});
</script>

<Particles />

<div class="container mx-auto px-4 sm:px-6 py-4 sm:py-6 relative z-10 max-w-[1400px]">
	<!-- Header - More Compact -->
	<header class="text-center mb-8 sm:mb-12 scale-in sticky top-0 z-30 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent py-4 sm:py-6 backdrop-blur-sm">
		<div class="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
			<svg class="spotify-logo w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" viewBox="0 0 24 24" fill="#1db954">
				<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
			</svg>
			<h1 class="text-2xl sm:text-4xl md:text-5xl font-black gradient-text">Spotify Activity</h1>
		</div>
		<p class="text-gray-400 text-sm sm:text-base mb-3">Real-time music listening activity</p>
		<div class="flex flex-wrap justify-center gap-2 sm:gap-3">
			<div class="stat-badge-modern">
				<span class="text-[#1db954] font-bold text-sm sm:text-base">{totalTracks}</span>
				<span class="text-gray-400 text-xs sm:text-sm ml-1.5">tracks</span>
			</div>
			{#each userStats as stat}
				<div class="stat-badge-modern">
					<span class="font-bold text-sm sm:text-base" style="color: {stat.color}">{stat.count}</span>
					<span class="text-gray-400 text-xs sm:text-sm ml-1.5">{stat.name}</span>
				</div>
			{/each}
		</div>
	</header>

	<!-- Now Playing Section -->
	<section class="mb-12 sm:mb-16">
		<div class="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
			<Equalizer />
			<h2 class="text-xl sm:text-2xl font-bold">Now Playing</h2>
		</div>

		<!-- Mobile: Horizontal Scroll, Desktop: Flex Wrap -->
		<div class="md:flex md:flex-wrap md:justify-center md:gap-6">
			{#if nowPlaying.length === 0}
				<div class="w-full">
					<EmptyState />
				</div>
			{:else}
				<!-- Mobile Horizontal Scroll -->
				<div class="md:hidden overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-4">
					<div class="flex gap-4 w-max">
						{#each nowPlaying as buddy}
							<div class="snap-center w-[85vw] max-w-[340px]">
								<NowPlayingCard {buddy} />
							</div>
						{/each}
					</div>
				</div>

				<!-- Desktop Grid -->
				<div class="hidden md:contents">
					{#each nowPlaying as buddy}
						<NowPlayingCard {buddy} />
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- History Section -->
	<section class="mb-8" id="history-section">
		<div class="text-center mb-6 sm:mb-8">
			<h2 class="text-xl sm:text-2xl font-bold mb-1.5">Recent Plays</h2>
			<p class="text-gray-400 text-xs sm:text-sm">Your latest music journey</p>
		</div>

		{#if history.length > 0}
			<!-- History Grid - Improved Responsive -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
				{#each paginatedHistory as item, index}
					<HistoryCard {item} {index} {currentPage} itemsPerPage={ITEMS_PER_PAGE} />
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<div class="text-center py-16">
				<div class="text-6xl mb-4">🎵</div>
				<p class="text-gray-400 text-lg mb-2">No listening history yet</p>
				<p class="text-gray-600 text-sm">Start playing some music on Spotify!</p>
			</div>
		{/if}

		<!-- Pagination - Minimalist -->
		{#if totalPages > 1}
			<div class="flex gap-2 items-center justify-center mt-6 sm:mt-8">
				<!-- First Page Button -->
				<button
					class="page-btn-minimal"
					disabled={currentPage === 1}
					onclick={() => goToPage(1)}
					aria-label="First page"
					title="First page"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
					</svg>
				</button>

				<!-- Previous Button -->
				<button
					class="page-btn-minimal"
					disabled={currentPage === 1}
					onclick={() => goToPage(currentPage - 1)}
					aria-label="Previous page"
					title="Previous page"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
					</svg>
				</button>

				<!-- Page Info -->
				<div class="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
					<span class="text-sm font-medium text-gray-300">{currentPage}</span>
					<span class="text-xs text-gray-500 mx-1.5">/</span>
					<span class="text-sm font-medium text-gray-400">{totalPages}</span>
				</div>

				<!-- Next Button -->
				<button
					class="page-btn-minimal"
					disabled={currentPage === totalPages}
					onclick={() => goToPage(currentPage + 1)}
					aria-label="Next page"
					title="Next page"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
					</svg>
				</button>

				<!-- Last Page Button -->
				<button
					class="page-btn-minimal"
					disabled={currentPage === totalPages}
					onclick={() => goToPage(totalPages)}
					aria-label="Last page"
					title="Last page"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
					</svg>
				</button>
			</div>
		{/if}
	</section>

	<!-- Footer -->
	<footer class="text-center text-gray-500 text-xs sm:text-sm mt-16 sm:mt-20 pb-8">
		<p class="mb-2">Powered by Spotify Web API</p>
		<p class="text-xs text-gray-600">Fetches data every 10 minutes</p>
	</footer>
</div>
