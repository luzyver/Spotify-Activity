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

<div class="glass-card-live rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-sm mx-auto float-animation scale-in">
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-2 min-w-0 flex-1">
			<div class="relative flex-shrink-0">
				<img
					src={avatarUrl}
					class="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#1db954] ring-2 ring-[#1db954]/30"
					alt={userName}
					onerror={(e) => (e.currentTarget as HTMLImageElement).src = avatarUrl}
				/>
				<div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#1db954] rounded-full border-2 border-[#0a0a0a] animate-pulse"></div>
			</div>
			<div class="text-left min-w-0 flex-1">
				<div class="font-bold text-sm sm:text-base truncate">{userName}</div>
				<div class="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
					<span class="w-1.5 h-1.5 bg-[#1db954] rounded-full animate-pulse flex-shrink-0"></span>
					<span class="truncate">{timeAgo(buddy.timestamp)}</span>
				</div>
			</div>
		</div>
		<span class="badge-live text-[9px] flex-shrink-0 ml-2">LIVE</span>
	</div>

	<div class="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-4">
		<div class="absolute inset-0 pulse-glow rounded-full"></div>
		<div class="relative w-full h-full rounded-full overflow-hidden spin-slow vinyl bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-black shadow-2xl">
			<img
				src={buddy.track?.imageUrl || ''}
				class="w-full h-full object-cover relative z-10"
				alt={buddy.track?.name || 'Album art'}
			/>
		</div>
	</div>

	<div class="text-center space-y-1">
		<a
			href={spotifyUrl(buddy.track?.uri)}
			target="_blank"
			rel="noopener noreferrer"
			class="block font-bold text-base sm:text-lg hover:text-[#1db954] transition truncate"
			title={buddy.track?.name || ''}
		>
			{buddy.track?.name || ''}
		</a>
		<p class="text-xs sm:text-sm text-gray-400 truncate font-medium" title={buddy.track?.artist?.name || ''}>
			{buddy.track?.artist?.name || ''}
		</p>
		<p class="text-[10px] sm:text-xs text-gray-500 truncate italic" title={buddy.track?.album?.name || ''}>
			{buddy.track?.album?.name || ''}
		</p>
	</div>
</div>
