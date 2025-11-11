<script lang="ts">
	import type { NowPlayingBuddy } from '$lib/types';
	import { getUserName, timeAgo, spotifyUrl } from '$lib/utils';

	interface Props {
		buddy: NowPlayingBuddy;
	}

	let { buddy }: Props = $props();

	const userName = $derived(buddy.user?.name || getUserName(buddy.user?.uri));
	const avatarUrl = $derived(
		buddy.user?.imageUrl || `https://ui-avatars.com/api/?name=${userName}&background=1db954&color=fff`
	);
</script>

<div class="glass-card-live rounded-3xl p-6 sm:p-8 w-full max-w-sm mx-auto float-animation scale-in">
	<div class="flex items-center justify-between mb-4 sm:mb-6">
		<div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
			<div class="relative flex-shrink-0">
				<img
					src={avatarUrl}
					class="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-[#1db954] ring-2 ring-[#1db954]/30"
					alt={userName}
					onerror={(e) => (e.currentTarget as HTMLImageElement).src = avatarUrl}
				/>
				<div class="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-[#1db954] rounded-full border-2 border-[#0a0a0a] animate-pulse"></div>
			</div>
			<div class="text-left min-w-0 flex-1">
				<div class="font-bold text-base sm:text-lg truncate">{userName}</div>
				<div class="text-xs text-gray-400 flex items-center gap-1">
					<span class="w-2 h-2 bg-[#1db954] rounded-full animate-pulse flex-shrink-0"></span>
					<span class="truncate">{timeAgo(buddy.timestamp)}</span>
				</div>
			</div>
		</div>
		<span class="badge-live text-[9px] sm:text-[10px] flex-shrink-0 ml-2">LIVE</span>
	</div>

	<div class="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-4 sm:mb-6">
		<div class="absolute inset-0 pulse-glow rounded-full"></div>
		<div class="relative w-full h-full rounded-full overflow-hidden spin-slow vinyl bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-black shadow-2xl">
			<img
				src={buddy.track?.imageUrl || ''}
				class="w-full h-full object-cover relative z-10"
				alt={buddy.track?.name || 'Album art'}
			/>
		</div>
	</div>

	<div class="text-center space-y-1.5 sm:space-y-2">
		<a
			href={spotifyUrl(buddy.track?.uri)}
			target="_blank"
			rel="noopener noreferrer"
			class="block font-bold text-lg sm:text-xl hover:text-[#1db954] transition truncate"
			title={buddy.track?.name || ''}
		>
			{buddy.track?.name || ''}
		</a>
		<p class="text-sm text-gray-400 truncate font-medium" title={buddy.track?.artist?.name || ''}>
			{buddy.track?.artist?.name || ''}
		</p>
		<p class="text-xs text-gray-500 truncate italic" title={buddy.track?.album?.name || ''}>
			{buddy.track?.album?.name || ''}
		</p>
	</div>
</div>
