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
	const globalIndex = $derived(((currentPage - 1) * itemsPerPage) + index + 1);

	// Hand-picked color palettes - same as NowPlayingCard
	const colorPalettes = [
		{
			gradient: 'from-[#1ed760]/20 via-[#1db954]/15 to-[#169c46]/20',
			primary: '#1ed760',
			secondary: '#1db954',
			name: 'spotify'
		},
		{
			gradient: 'from-[#ff6b6b]/20 via-[#ee5a6f]/15 to-[#c44569]/20',
			primary: '#ff6b6b',
			secondary: '#ee5a6f',
			name: 'sunset'
		},
		{
			gradient: 'from-[#4facfe]/20 via-[#00f2fe]/15 to-[#43e97b]/20',
			primary: '#4facfe',
			secondary: '#00f2fe',
			name: 'ocean'
		},
		{
			gradient: 'from-[#b06ab3]/20 via-[#4568dc]/15 to-[#6a3093]/20',
			primary: '#b06ab3',
			secondary: '#4568dc',
			name: 'purple'
		},
		{
			gradient: 'from-[#ffa751]/20 via-[#ffe259]/15 to-[#ffa751]/20',
			primary: '#ffa751',
			secondary: '#ffe259',
			name: 'peach'
		},
		{
			gradient: 'from-[#667eea]/20 via-[#764ba2]/15 to-[#f093fb]/20',
			primary: '#667eea',
			secondary: '#764ba2',
			name: 'midnight'
		}
	];

	const palette = $derived(colorPalettes[globalIndex % colorPalettes.length]);
</script>

<Motion
	initial={{ opacity: 0, y: 30, scale: 0.9 }}
	animate={{ opacity: 1, y: 0, scale: 1 }}
	transition={{
		type: 'spring',
		stiffness: 100,
		damping: 15,
		mass: 1,
		delay: (index % itemsPerPage) * 0.08
	}}
	let:motion
>
	<div
		use:motion
		class="relative group overflow-hidden rounded-2xl transition-all duration-700 ease-out hover:scale-[1.03] cursor-pointer"
		style="background: linear-gradient(135deg, {palette.primary}15, {palette.secondary}15)"
	>
		<!-- Playful Background Effects -->
		<div class="absolute inset-0 bg-gradient-to-br {palette.gradient} opacity-60"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

		<!-- Floating Sparkles on hover -->
		<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
			<Sparkles class="w-4 h-4 text-yellow-300 animate-pulse" style="filter: drop-shadow(0 0 8px {palette.primary})" />
		</div>

		<!-- Animated Border Glow -->
		<div class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out"
			style="box-shadow: inset 0 0 20px {palette.primary}40, 0 0 30px {palette.primary}20">
		</div>

		<div class="relative z-10 p-3 sm:p-4">
			<!-- Album Art with Playful Effects -->
			<div class="relative mb-3 group/album">
				<a
					href={spotifyUrl(item.uri)}
					target="_blank"
					rel="noopener noreferrer"
					class="block"
				>
					<div class="relative overflow-hidden rounded-xl shadow-2xl transition-all duration-700 ease-out group-hover/album:rotate-1 group-hover/album:scale-105"
						style="box-shadow: 0 20px 40px {palette.primary}40">
						<img
							src={item.imageUrl}
							class="w-full aspect-square object-cover"
							alt={item.track}
						/>

						<!-- Gradient Overlay -->
						<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/album:opacity-100 transition-opacity duration-500 ease-out"></div>

						<!-- Play Button - Centered & Bouncy -->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/album:opacity-100 transition-all duration-500 ease-out">
							<div class="rounded-full p-4 animate-bounce-slow transition-transform duration-300 ease-out hover:scale-125"
								style="background: linear-gradient(135deg, {palette.primary}, {palette.secondary}); box-shadow: 0 0 30px {palette.primary}80">
								<Play class="w-6 h-6 text-white fill-white drop-shadow-lg" />
							</div>
						</div>
					</div>

					<!-- Rank Badge - Top Left -->
					<div class="absolute -top-2 -left-2 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-lg animate-bounce-gentle"
						style="background: linear-gradient(135deg, {palette.primary}, {palette.secondary}); box-shadow: 0 0 20px {palette.primary}60">
						#{globalIndex}
					</div>
				</a>
			</div>

			<!-- Track Info - Colorful -->
			<div class="space-y-1.5 sm:space-y-2">
				<a
					href={spotifyUrl(item.uri)}
					target="_blank"
					rel="noopener noreferrer"
					class="block"
				>
					<h3 class="font-black text-sm sm:text-base leading-tight line-clamp-2 group-hover:scale-105 transition-transform duration-500 ease-out"
						style="color: {palette.primary}; text-shadow: 0 0 20px {palette.primary}40">
						{item.track}
					</h3>
				</a>

				<p class="text-xs sm:text-sm text-gray-300 truncate font-semibold transition-colors duration-300 ease-out" title={item.artist}>
					{item.artist}
				</p>

				<!-- Meta Info - Compact -->
				<div class="flex items-center justify-between text-xs pt-2 border-t border-white/10">
					<div class="flex items-center gap-1.5 text-gray-400">
						<Clock class="w-3 h-3" />
						<span>{timeAgo(item.timestamp)}</span>
					</div>

					<div class="flex items-center gap-1.5 px-2 py-1 rounded-full transition-all duration-500 ease-out hover:scale-105"
						style="background: linear-gradient(135deg, {palette.primary}30, {palette.secondary}30); color: {palette.primary}">
						<User class="w-3 h-3" />
						<span class="font-bold truncate max-w-[60px]">{item.user}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Bottom Accent Line -->
		<div class="h-1 w-full absolute bottom-0 left-0 transition-all duration-700 ease-out group-hover:h-2"
			style="background: linear-gradient(90deg, {palette.primary}, {palette.secondary})">
		</div>
	</div>
</Motion>

<style>
	@keyframes bounce-slow {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	@keyframes bounce-gentle {
		0%, 100% {
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

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
