<script lang="ts">
	import type { HistoryItem } from '$lib/types';
	import { getUserColor, timeAgo, spotifyUrl } from '$lib/utils';

	interface Props {
		item: HistoryItem;
		index: number;
		currentPage: number;
		itemsPerPage: number;
	}

	let { item, index, currentPage, itemsPerPage }: Props = $props();

	const userColor = $derived(getUserColor(item.userId));
	const globalIndex = $derived(((currentPage - 1) * itemsPerPage) + index + 1);
</script>

<div
	class="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 track-card fade-in-up"
	style="animation-delay: {(index % itemsPerPage) * 0.03}s"
>
	<div class="flex items-center gap-3">
		<div class="relative flex-shrink-0">
			<img
				src={item.imageUrl}
				class="w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl shadow-2xl album-cover"
				alt={item.track}
			/>
			<div
				class="absolute -top-1.5 -left-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-lg"
				style="background-color: {userColor}"
			>
				{globalIndex}
			</div>
		</div>
		<div class="flex-1 min-w-0">
			<a
				href={spotifyUrl(item.uri)}
				target="_blank"
				rel="noopener noreferrer"
				class="font-bold text-sm sm:text-base hover:text-[#1db954] transition block truncate mb-0.5"
				title={item.track}
			>
				{item.track}
			</a>
			<p class="text-xs sm:text-sm text-gray-400 truncate mb-1.5" title={item.artist}>
				{item.artist}
			</p>
			<div class="flex items-center gap-2 text-[10px] sm:text-xs flex-wrap">
				<span class="text-gray-500 flex-shrink-0">{timeAgo(item.timestamp)}</span>
				<span
					class="px-2 py-0.5 rounded-full font-medium truncate max-w-[100px] sm:max-w-[120px]"
					style="background-color: {userColor}33; color: {userColor}"
					title={item.user}
				>
					{item.user}
				</span>
			</div>
		</div>
	</div>
</div>
