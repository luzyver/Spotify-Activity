<script lang="ts">
	import { onMount } from 'svelte';
	import Particles from '$lib/components/Particles.svelte';
	import Equalizer from '$lib/components/Equalizer.svelte';
	import NowPlayingCard from '$lib/components/NowPlayingCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import HistoryCard from '$lib/components/HistoryCard.svelte';
	import StatsChart from '$lib/components/StatsChart.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { ITEMS_PER_PAGE, API_ENDPOINTS } from '$lib/config';
	import type { NowPlayingBuddy, HistoryItem } from '$lib/types';
	import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Music2, Sun, Moon } from 'lucide-svelte';

	let nowPlaying = $state<NowPlayingBuddy[]>([]);
	let history = $state<HistoryItem[]>([]);
	let currentPage = $state(1);
	let isDarkMode = $state(true);
	let totalPages = $derived(Math.ceil(history.length / ITEMS_PER_PAGE));
	let paginatedHistory = $derived(
		history.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
	);

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

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		localStorage.setItem('darkMode', isDarkMode ? 'dark' : 'light');
		document.documentElement.classList.toggle('light-mode', !isDarkMode);
	}

	onMount(() => {
		// Load dark mode preference
		const savedMode = localStorage.getItem('darkMode');
		if (savedMode) {
			isDarkMode = savedMode === 'dark';
			document.documentElement.classList.toggle('light-mode', !isDarkMode);
		}

		loadNowPlaying();
		loadHistory();
	});
</script>

<Particles />

<div class="min-h-screen relative z-10">
	<!-- Compact Header -->
	<header class="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
		<div class="w-full px-3 sm:px-6 py-3 sm:py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2 sm:gap-3">
					<svg class="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" viewBox="0 0 24 24" fill="#1db954">
						<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
					</svg>
					<div>
						<h1 class="text-base sm:text-xl lg:text-2xl font-black gradient-text">Spotify Activity</h1>
						<p class="text-gray-500 text-[10px] sm:text-xs hidden sm:block">Real-time listening</p>
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onclick={toggleDarkMode}
					class="h-8 w-8 sm:h-10 sm:w-10"
					aria-label="Toggle dark mode"
				>
					{#if isDarkMode}
						<Sun class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
					{:else}
						<Moon class="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
					{/if}
				</Button>
			</div>
		</div>
	</header>

	<!-- Main Layout: Sidebar + Content -->
	<div class="w-full px-3 sm:px-6 py-4 sm:py-6">
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
			<!-- Sidebar - Left (Now Playing) -->
			<aside class="lg:col-span-4 xl:col-span-3 space-y-4 sm:space-y-6">
				<!-- Now Playing Section -->
				<section class="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
					<div class="flex items-center gap-2 mb-3 sm:mb-4">
						<Equalizer />
						<h2 class="text-base sm:text-lg lg:text-xl font-bold">Now Playing</h2>
						{#if nowPlaying.length > 0}
							<span class="ml-auto text-[10px] sm:text-xs bg-[#1db954]/20 text-[#1db954] px-2 py-1 rounded-full">{nowPlaying.length}</span>
						{/if}
					</div>

					{#if nowPlaying.length === 0}
						<EmptyState />
					{:else}
						<div class="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
							{#each nowPlaying as buddy, index}
								<NowPlayingCard {buddy} {index} />
							{/each}
						</div>
					{/if}
				</section>
			</aside>

			<!-- Main Content - Right (Stats + History) -->
			<main class="lg:col-span-8 xl:col-span-9">
				<!-- Stats -->
				{#if history.length > 0}
					<section class="mb-4 sm:mb-6">
						<StatsChart {history} />
					</section>
				{/if}

				<!-- History Section -->
				<section id="history-section">
					<div class="flex items-center justify-between mb-4 sm:mb-6">
						<div class="flex items-center gap-2">
							<Music2 class="w-4 h-4 sm:w-5 sm:h-5 text-[#1db954]" />
							<h2 class="text-base sm:text-lg lg:text-xl font-bold">Recent Plays</h2>
						</div>
						<p class="text-gray-400 text-[10px] sm:text-xs lg:text-sm">{history.length} tracks</p>
					</div>

					{#if history.length > 0}
						<!-- Masonry Grid -->
						<div class="masonry-grid mb-4 sm:mb-6">
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

					<!-- Pagination - Modern -->
					{#if totalPages > 1}
						<div class="flex gap-1.5 sm:gap-2 items-center justify-center mt-4 sm:mt-6">
							<Button
								variant="ghost"
								size="icon"
								disabled={currentPage === 1}
								onclick={() => goToPage(1)}
								class="h-8 w-8 sm:h-10 sm:w-10"
							>
								<ChevronsLeft class="w-3 h-3 sm:w-4 sm:h-4" />
							</Button>

							<Button
								variant="ghost"
								size="icon"
								disabled={currentPage === 1}
								onclick={() => goToPage(currentPage - 1)}
								class="h-8 w-8 sm:h-10 sm:w-10"
							>
								<ChevronLeft class="w-3 h-3 sm:w-4 sm:h-4" />
							</Button>

							<div class="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 rounded-lg border border-white/10">
								<span class="text-xs sm:text-sm font-medium text-gray-300">{currentPage}</span>
								<span class="text-[10px] sm:text-xs text-gray-500 mx-1 sm:mx-1.5">/</span>
								<span class="text-xs sm:text-sm font-medium text-gray-400">{totalPages}</span>
							</div>

							<Button
								variant="ghost"
								size="icon"
								disabled={currentPage === totalPages}
								onclick={() => goToPage(currentPage + 1)}
								class="h-8 w-8 sm:h-10 sm:w-10"
							>
								<ChevronRight class="w-3 h-3 sm:w-4 sm:h-4" />
							</Button>

							<Button
								variant="ghost"
								size="icon"
								disabled={currentPage === totalPages}
								onclick={() => goToPage(totalPages)}
								class="h-8 w-8 sm:h-10 sm:w-10"
							>
								<ChevronsRight class="w-3 h-3 sm:w-4 sm:h-4" />
							</Button>
						</div>
					{/if}
				</section>
			</main>
		</div>
	</div>

	<!-- Footer -->
	<footer class="text-center text-gray-500 text-xs py-8 border-t border-white/5 mt-12">
		<p class="mb-1">Powered by Spotify Web API</p>
		<p class="text-[10px] text-gray-600">Updates every 10 minutes</p>
	</footer>
</div>
