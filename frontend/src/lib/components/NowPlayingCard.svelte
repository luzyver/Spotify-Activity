<script lang="ts">
	import type { NowPlayingBuddy } from '$lib/types';
	import { getUserName, timeAgo, spotifyUrl } from '$lib/utils';
	import { Motion } from 'svelte-motion';
	import { Play, Sparkles, Music, Heart } from 'lucide-svelte';
	import { onMount } from 'svelte';

	interface Props {
		buddy: NowPlayingBuddy;
		index: number;
	}

	let { buddy, index }: Props = $props();

	const userName = $derived(buddy.user?.name || getUserName(buddy.user?.uri));
	const avatarUrl = $derived(
		buddy.user?.imageUrl || `https://ui-avatars.com/api/?name=${userName}&background=1db954&color=fff`
	);

	// Hand-picked color palettes - inspired by real design systems
	const colorPalettes = [
		// Spotify OG - Classic green with dark accents
		{
			gradient: 'from-[#1ed760]/20 via-[#1db954]/15 to-[#169c46]/20',
			primary: '#1ed760',
			secondary: '#1db954',
			name: 'spotify'
		},
		// Sunset Vibes - Warm orange to pink
		{
			gradient: 'from-[#ff6b6b]/20 via-[#ee5a6f]/15 to-[#c44569]/20',
			primary: '#ff6b6b',
			secondary: '#ee5a6f',
			name: 'sunset'
		},
		// Ocean Breeze - Deep blue to teal
		{
			gradient: 'from-[#4facfe]/20 via-[#00f2fe]/15 to-[#43e97b]/20',
			primary: '#4facfe',
			secondary: '#00f2fe',
			name: 'ocean'
		},
		// Purple Haze - Deep purple vibes
		{
			gradient: 'from-[#b06ab3]/20 via-[#4568dc]/15 to-[#6a3093]/20',
			primary: '#b06ab3',
			secondary: '#4568dc',
			name: 'purple'
		},
		// Peach Dream - Soft coral to pink
		{
			gradient: 'from-[#ffa751]/20 via-[#ffe259]/15 to-[#ffa751]/20',
			primary: '#ffa751',
			secondary: '#ffe259',
			name: 'peach'
		},
		// Midnight - Dark blue with cyan
		{
			gradient: 'from-[#667eea]/20 via-[#764ba2]/15 to-[#f093fb]/20',
			primary: '#667eea',
			secondary: '#764ba2',
			name: 'midnight'
		}
	];

	const palette = $derived(colorPalettes[index % colorPalettes.length]);
</script>

<Motion
	initial={{ opacity: 0, y: 30, scale: 0.9 }}
	animate={{ opacity: 1, y: 0, scale: 1 }}
	transition={{
		type: 'spring',
		stiffness: 100,
		damping: 15,
		mass: 1,
		delay: index * 0.1
	}}
	let:motion
>
	<div
		use:motion
		class="relative group overflow-hidden rounded-2xl transition-all duration-700 ease-out hover:scale-[1.02] cursor-pointer"
		style="background: linear-gradient(135deg, {palette.primary}15, {palette.secondary}15)"
	>
		<!-- Playful Background Effects -->
		<div class="absolute inset-0 bg-gradient-to-br {palette.gradient} opacity-60"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

		<!-- Floating Sparkles -->
		<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
			<Sparkles class="w-4 h-4 text-yellow-300 animate-pulse" style="filter: drop-shadow(0 0 8px {palette.primary})" />
		</div>

		<!-- Animated Border Glow -->
		<div class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out"
			style="box-shadow: inset 0 0 20px {palette.primary}40, 0 0 30px {palette.primary}20">
		</div>

		<div class="relative z-10 p-4">
			<!-- Album Art with Playful Tilt -->
			<div class="relative mb-4 group/album">
				<a
					href={spotifyUrl(buddy.track?.uri)}
					target="_blank"
					rel="noopener noreferrer"
					class="block"
				>
					<div class="relative overflow-hidden rounded-xl shadow-2xl transition-all duration-700 ease-out group-hover/album:rotate-2 group-hover/album:scale-105"
						style="box-shadow: 0 20px 40px {palette.primary}40">
						<img
							src={buddy.track?.imageUrl || ''}
							class="w-full aspect-square object-cover"
							alt={buddy.track?.name || 'Album art'}
						/>

						<!-- Gradient Overlay -->
						<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/album:opacity-100 transition-opacity duration-500 ease-out"></div>

						<!-- Play Button - Centered & Bouncy -->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/album:opacity-100 transition-all duration-500 ease-out">
							<div class="rounded-full p-5 animate-bounce-slow transition-transform duration-300 ease-out hover:scale-125"
								style="background: linear-gradient(135deg, {palette.primary}, {palette.secondary}); box-shadow: 0 0 30px {palette.primary}80">
								<Play class="w-8 h-8 text-white fill-white drop-shadow-lg" />
							</div>
						</div>
					</div>

					<!-- Live Music Badge - Floating -->
					<div class="absolute -top-2 -right-2 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-lg animate-bounce-gentle"
						style="background: linear-gradient(135deg, {palette.primary}, {palette.secondary})">
						<Music class="w-3 h-3 animate-pulse" />
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
					<h3 class="font-black text-base leading-tight mb-1 line-clamp-2 group-hover:scale-105 transition-transform duration-500 ease-out"
						style="color: {palette.primary}; text-shadow: 0 0 20px {palette.primary}40">
						{buddy.track?.name || ''}
					</h3>
				</a>

				<a
					href={spotifyUrl(buddy.track?.artist?.uri)}
					target="_blank"
					rel="noopener noreferrer"
					class="block text-sm text-gray-300 hover:text-white transition-colors duration-300 ease-out line-clamp-1 font-semibold"
				>
					{buddy.track?.artist?.name || ''}
				</a>

				<a
					href={spotifyUrl(buddy.track?.album?.uri)}
					target="_blank"
					rel="noopener noreferrer"
					class="block text-xs text-gray-500 hover:text-gray-400 transition-colors duration-300 ease-out line-clamp-1 italic"
				>
					{buddy.track?.album?.name || ''}
				</a>

				<!-- User Info - Fun Card -->
				<div class="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
					<div class="relative">
						<img
							src={avatarUrl}
							class="w-9 h-9 rounded-full ring-2 transition-all duration-500 ease-out"
							style="ring-color: {palette.primary}"
							alt={userName}
							onerror={(e) => (e.currentTarget as HTMLImageElement).src = avatarUrl}
						/>
						<div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-black animate-pulse"
							style="background: {palette.primary}; box-shadow: 0 0 10px {palette.primary}">
						</div>
					</div>
					<div class="flex-1 min-w-0">
						<div class="text-xs font-bold truncate text-white">{userName}</div>
						<div class="text-[10px] text-gray-400 flex items-center gap-1">
							<Heart class="w-2.5 h-2.5 fill-current" style="color: {palette.secondary}" />
							<span>{timeAgo(buddy.timestamp)}</span>
						</div>
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

	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
