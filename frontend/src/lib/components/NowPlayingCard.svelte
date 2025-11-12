<script lang="ts">
	import type { NowPlayingBuddy } from '$lib/types';
	import { getUserName, timeAgo, spotifyUrl } from '$lib/utils';
	import { Motion } from 'svelte-motion';
	import { Play, ExternalLink, Radio } from 'lucide-svelte';
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

	let soundWaves = $state([0, 0, 0, 0]);

	// Animate sound waves
	onMount(() => {
		const interval = setInterval(() => {
			soundWaves = soundWaves.map(() => Math.random() * 100);
		}, 150);

		return () => clearInterval(interval);
	});

	// Random gradient
	const gradients = ['gradient-bg-1', 'gradient-bg-2', 'gradient-bg-3', 'gradient-bg-4', 'gradient-bg-5'];
	const randomGradient = $derived(gradients[index % gradients.length]);
</script>

<Motion
	initial={{ opacity: 0, scale: 0.9 }}
	animate={{ opacity: 1, scale: 1 }}
	transition={{ delay: index * 0.1, duration: 0.5, ease: "backOut" }}
	let:motion
>
	<div
		use:motion
		class="blur-card {randomGradient} rounded-lg sm:rounded-xl p-2.5 sm:p-3 transition-all duration-300 group relative overflow-hidden"
	>
		<!-- Animated Background -->
		<div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
			<div class="absolute inset-0 bg-gradient-to-br from-[#1db954]/10 via-transparent to-transparent"></div>
		</div>

		<div class="relative z-10">
			<!-- User Header -->
			<div class="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
				<div class="relative">
					<img
						src={avatarUrl}
						class="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-[#1db954]/50"
						alt={userName}
						onerror={(e) => (e.currentTarget as HTMLImageElement).src = avatarUrl}
					/>
					<div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#1db954] rounded-full border-2 border-[#0a0a0a] flex items-center justify-center">
						<Radio class="w-1.5 h-1.5 text-black animate-pulse" />
					</div>
				</div>
				<div class="flex-1 min-w-0">
					<div class="text-[11px] sm:text-xs font-semibold truncate">{userName}</div>
					<div class="text-[9px] sm:text-[10px] text-gray-400 flex items-center gap-1">
						<span class="w-1 h-1 bg-[#1db954] rounded-full animate-pulse"></span>
						<span>{timeAgo(buddy.timestamp)}</span>
					</div>
				</div>
				<div class="badge-live text-[7px] sm:text-[8px] px-1.5 sm:px-2 py-0.5">LIVE</div>
			</div>

			<!-- Album Art - Larger -->
			<div class="relative group/img mb-2 sm:mb-3">
				<img
					src={buddy.track?.imageUrl || ''}
					class="w-full aspect-square rounded-md sm:rounded-lg object-cover shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
					alt={buddy.track?.name || 'Album art'}
				/>

				<!-- Play Overlay -->
				<a
					href={spotifyUrl(buddy.track?.uri)}
					target="_blank"
					rel="noopener noreferrer"
					class="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-md sm:rounded-lg flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300"
				>
					<div class="bg-[#1db954] rounded-full p-3 sm:p-4 shadow-2xl hover:scale-110 transition-transform">
						<Play class="w-5 h-5 sm:w-6 sm:h-6 text-black fill-black" />
					</div>
				</a>

				<!-- Sound Wave Overlay -->
				<div class="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/80 backdrop-blur-md rounded-md sm:rounded-lg px-1.5 sm:px-2 py-1 sm:py-1.5 flex items-end gap-0.5 sm:gap-1 h-5 sm:h-6">
					{#each soundWaves as wave}
						<div
							class="w-1 bg-[#1db954] rounded-full transition-all duration-150"
							style="height: {30 + wave * 0.5}%"
						></div>
					{/each}
				</div>
			</div>

			<!-- Track Info -->
			<div class="space-y-1 sm:space-y-1.5">
				<a
					href={spotifyUrl(buddy.track?.uri)}
					target="_blank"
					rel="noopener noreferrer"
					class="block font-bold text-xs sm:text-sm leading-tight hover:text-[#1db954] transition truncate group-hover:underline"
					title={buddy.track?.name || ''}
				>
					{buddy.track?.name || ''}
				</a>

				<div class="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-gray-400">
					<a
						href={spotifyUrl(buddy.track?.artist?.uri)}
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-white hover:underline truncate flex-1"
						title={buddy.track?.artist?.name || ''}
					>
						{buddy.track?.artist?.name || ''}
					</a>
					<ExternalLink class="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
				</div>

				<p class="text-[9px] sm:text-[10px] text-gray-500 truncate italic" title={buddy.track?.album?.name || ''}>
					{buddy.track?.album?.name || ''}
				</p>
			</div>
		</div>
	</div>
</Motion>
