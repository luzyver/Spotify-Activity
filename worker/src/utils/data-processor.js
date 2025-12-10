export function cleanHistory(history) {
	if (!Array.isArray(history)) return [];

	return history.filter(
		(entry) =>
			entry &&
			typeof entry.timestamp === 'number' &&
			typeof entry.user === 'string' &&
			typeof entry.track === 'string' &&
			typeof entry.artist === 'string'
	);
}

export function processRecentTracks(recentTracks, userProfile, history, lastClearTimestamp = 0) {
	let addedCount = 0;

	for (const item of recentTracks) {
		const timestamp = new Date(item.played_at).getTime();

		// Skip tracks before clear timestamp
		if (lastClearTimestamp > 0 && timestamp <= lastClearTimestamp) continue;

		// Check for duplicates
		const exists = history.some(
			(h) =>
				h.userId === userProfile.uri &&
				h.uri === item.track.uri &&
				Math.abs(h.timestamp - timestamp) < 1000
		);

		if (!exists) {
			history.push({
				timestamp,
				user: userProfile.name,
				userId: userProfile.uri,
				track: item.track.name,
				artist: item.track.artists.map((a) => a.name).join(', '),
				uri: item.track.uri,
				imageUrl: item.track.album.images?.[0]?.url || null,
			});
			addedCount++;
		}
	}

	return addedCount;
}

export function processCurrentlyPlaying(nowPlaying, userProfile) {
	if (!nowPlaying) return null;

	return {
		timestamp: nowPlaying.timestamp,
		user: {
			uri: userProfile.uri,
			name: userProfile.name,
			imageUrl: userProfile.imageUrl,
		},
		track: {
			uri: nowPlaying.track.uri,
			name: nowPlaying.track.name,
			imageUrl: nowPlaying.track.imageUrl,
			album: nowPlaying.album,
			artist: nowPlaying.artist,
			context: nowPlaying.context,
		},
	};
}

export function removeDuplicates(history) {
	const seen = new Set();
	return history.filter((entry) => {
		const key = `${entry.userId}|${entry.uri}|${entry.timestamp}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

export function sortHistory(history) {
	return history.sort((a, b) => b.timestamp - a.timestamp);
}
