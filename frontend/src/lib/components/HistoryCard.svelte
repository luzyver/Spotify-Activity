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
	class="glass-card rounded-2xl p-4 sm:p-5 track-card fade-in-up"
	style="animation-delay: {(index % itemsPerPage) * 0.03}s"
>
	<div class="flex items-center gap-3 sm:gap-4">
		<div class="relative flex-shrink-0">
			<img
				src={item.imageUrl}
				class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shadow-2xl album-cover"
				alt={item.track}
			/>
			<div
				class="absolute -top-2 -left-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
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
				class="font-bold text-base sm:text-lg hover:text-[#1db954] transition block truncate mb-1"
				title={item.track}
			>
				{item.track}
			</a>
			<p class="text-sm text-gray-400 truncate mb-2" title={item.artist}>
				{item.artist}
			</p>
			<div class="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
				<span class="text-gray-500 flex-shrink-0">{timeAgo(item.timestamp)}</span>
				<span
					class="px-2 py-1 rounded-full font-medium truncate max-w-[120px]"
					style="background-color: {userColor}33; color: {userColor}"
					title={item.user}
				>
					{item.user}
				</span>
			</div>
		</div>
	</div>
</div>
