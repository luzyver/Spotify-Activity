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

	function getPageNumbers() {
		const maxVisible = 3;
		let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		let end = Math.min(totalPages, start + maxVisible - 1);

		if (end - start < maxVisible - 1) {
			start = Math.max(1, end - maxVisible + 1);
		}

		return { start, end };
	}

	onMount(() => {
		loadNowPlaying();
		loadHistory();
	});
</script>

<Particles />

<div class="container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
	<!-- Header -->
	<div class="text-center mb-10 sm:mb-16 scale-in">
		<div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
			<svg class="spotify-logo w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" viewBox="0 0 24 24" fill="#1db954">
				<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
			</svg>
			<h1 class="text-3xl sm:text-5xl md:text-7xl font-black gradient-text">Spotify Activity</h1>
		</div>
		<p class="text-gray-400 text-base sm:text-lg mb-4">Real-time music listening activity</p>
		<div class="flex flex-wrap justify-center gap-3 sm:gap-4">
			<div class="stat-badge">
				<span class="text-[#1db954] font-bold">{totalTracks}</span>
				<span class="text-gray-400 text-sm ml-2">total tracks</span>
			</div>
			{#each userStats as stat}
				<div class="stat-badge">
					<span class="font-bold" style="color: {stat.color}">{stat.count}</span>
					<span class="text-gray-400 text-sm ml-2">{stat.name}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Now Playing Section -->
	<div class="mb-16 sm:mb-20">
		<div class="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
			<Equalizer />
			<h2 class="text-2xl sm:text-3xl font-bold">Now Playing</h2>
		</div>
		<div class="flex flex-wrap justify-center gap-6 sm:gap-10">
			{#if nowPlaying.length === 0}
				<EmptyState />
			{:else}
				{#each nowPlaying as buddy}
					<NowPlayingCard {buddy} />
				{/each}
			{/if}
		</div>
	</div>

	<!-- History Section -->
	<div class="mb-8" id="history-section">
		<div class="text-center mb-8 sm:mb-10">
			<h2 class="text-2xl sm:text-3xl font-bold mb-2">Recent Plays</h2>
			<p class="text-gray-400 text-sm sm:text-base">Your latest music journey</p>
		</div>

		<!-- Page Info -->
		<div class="text-center mb-4 sm:mb-6">
			<span class="text-gray-400 text-sm font-medium">Page {currentPage} of {totalPages}</span>
		</div>

		<!-- History Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-7xl mx-auto mb-6 sm:mb-8">
			{#each paginatedHistory as item, index}
				<HistoryCard {item} {index} {currentPage} itemsPerPage={ITEMS_PER_PAGE} />
			{/each}
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex gap-2 items-center justify-center flex-wrap mt-6 sm:mt-8">
				<!-- Previous Button -->
				<button
					class="page-btn"
					disabled={currentPage === 1}
					onclick={() => goToPage(currentPage - 1)}
				>
					← Prev
				</button>

				<!-- First Page + Ellipsis -->
				{#if getPageNumbers().start > 1}
					<button class="page-btn" onclick={() => goToPage(1)}>1</button>
					{#if getPageNumbers().start > 2}
						<span class="text-gray-400 text-sm px-2">...</span>
					{/if}
				{/if}

				<!-- Page Numbers -->
				{#each Array.from({ length: getPageNumbers().end - getPageNumbers().start + 1 }, (_, i) => getPageNumbers().start + i) as pageNum}
					<button
						class="page-btn {pageNum === currentPage ? 'active' : ''}"
						onclick={() => goToPage(pageNum)}
					>
						{pageNum}
					</button>
				{/each}

				<!-- Ellipsis + Last Page -->
				{#if getPageNumbers().end < totalPages}
					{#if getPageNumbers().end < totalPages - 1}
						<span class="text-gray-400 text-sm px-2">...</span>
					{/if}
					<button class="page-btn" onclick={() => goToPage(totalPages)}>{totalPages}</button>
				{/if}

				<!-- Next Button -->
				<button
					class="page-btn"
					disabled={currentPage === totalPages}
					onclick={() => goToPage(currentPage + 1)}
				>
					Next →
				</button>
			</div>
		{/if}
	</div>

	<!-- Footer -->
	<div class="text-center text-gray-500 text-xs sm:text-sm mt-16 sm:mt-20 pb-8">
		<p class="mb-2">Powered by Spotify Web API</p>
		<p class="text-xs text-gray-600">Fetches data every 10 minutes</p>
	</div>
</div>
