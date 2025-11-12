<script lang="ts">
	import type { HistoryItem } from '$lib/types';
	import { getUserColor, timeAgo, spotifyUrl } from '$lib/utils';
	import { Motion } from 'svelte-motion';
	import { ExternalLink, Clock, User } from 'lucide-svelte';

	interface Props {
		item: HistoryItem;
		index: number;
		currentPage: number;
		itemsPerPage: number;
	}

	let { item, index, currentPage, itemsPerPage }: Props = $props();

	const userColor = $derived(getUserColor(item.userId));
	const globalIndex = $derived(((currentPage - 1) * itemsPerPage) + index + 1);

	// Random gradient for variety
	const gradients = ['gradient-bg-1', 'gradient-bg-2', 'gradient-bg-3', 'gradient-bg-4', 'gradient-bg-5'];
	const randomGradient = $derived(gradients[globalIndex % gradients.length]);
</script>

<Motion
	initial={{ opacity: 0, y: 20 }}
	animate={{ opacity: 1, y: 0 }}
	transition={{ delay: (index % itemsPerPage) * 0.05, duration: 0.5, ease: "easeOut" }}
	let:motion
>
	<div use:motion class="blur-card {randomGradient} rounded-xl sm:rounded-2xl p-3 sm:p-4 hover-glow group relative overflow-hidden">
		<!-- Animated Background Accent -->
		<div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
			<div class="absolute inset-0 bg-gradient-to-br from-[#1db954]/10 via-transparent to-transparent"></div>
		</div>

		<div class="relative z-10 space-y-2 sm:space-y-3">
			<!-- Album Art with Overlay -->
			<div class="relative group/img">
				<img
					src={item.imageUrl}
					class="w-full aspect-square rounded-lg sm:rounded-xl shadow-2xl object-cover transition-transform duration-300 group-hover:scale-105"
					alt={item.track}
				/>

				<!-- Hover Overlay -->
				<a
					href={spotifyUrl(item.uri)}
					target="_blank"
					rel="noopener noreferrer"
					class="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300"
				>
					<div class="bg-[#1db954] rounded-full p-2.5 sm:p-3 shadow-2xl transform hover:scale-110 transition-transform">
						<ExternalLink class="w-4 h-4 sm:w-5 sm:h-5 text-black" />
					</div>
				</a>

				<!-- Rank Badge -->
				<div
					class="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold shadow-xl backdrop-blur-md"
					style="background-color: {userColor}; color: white"
				>
					{globalIndex}
				</div>
			</div>

			<!-- Track Info -->
			<div class="space-y-1.5 sm:space-y-2">
				<a
					href={spotifyUrl(item.uri)}
					target="_blank"
					rel="noopener noreferrer"
					class="block font-bold text-base hover:text-[#1db954] transition truncate group-hover:underline"
					title={item.track}
				>
					{item.track}
				</a>

				<p class="text-sm text-gray-400 truncate font-medium" title={item.artist}>
					{item.artist}
				</p>

				<!-- Meta Info -->
				<div class="flex items-center justify-between text-xs pt-2 border-t border-white/10">
					<div class="flex items-center gap-1.5 text-gray-500">
						<Clock class="w-3 h-3" />
						<span>{timeAgo(item.timestamp)}</span>
					</div>

					<div class="flex items-center gap-1.5 px-2 py-1 rounded-full" style="background-color: {userColor}20; color: {userColor}">
						<User class="w-3 h-3" />
						<span class="font-medium truncate max-w-[80px]">{item.user}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</Motion>
