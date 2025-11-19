export function cleanHistory(history) {
	if (!Array.isArray(history)) {
		console.warn('cleanHistory: history is not an array, returning empty array');
		return [];
	}
	
	// Validate each entry has required fields
	const cleaned = history.filter(entry => {
		const isValid = entry && 
			typeof entry.timestamp === 'number' &&
			typeof entry.user === 'string' &&
			typeof entry.track === 'string' &&
			typeof entry.artist === 'string';
		
		if (!isValid) {
			console.warn('cleanHistory: Invalid entry found', entry);
		}
		
		return isValid;
	});
	
	console.log(`cleanHistory: ${cleaned.length} valid entries from ${history.length} total`);
	return cleaned;
}

export function processRecentTracks(recentTracks, userProfile, history, lastClearTimestamp = 0) {
	let addedCount = 0;
	let skippedOld = 0;

	for (const item of recentTracks) {
		const entry = {
			timestamp: new Date(item.played_at).getTime(),
			user: userProfile.name,
			userId: userProfile.uri,
			track: item.track.name,
			artist: item.track.artists.map(a => a.name).join(', '),
			uri: item.track.uri,
			imageUrl: item.track.album.images?.[0]?.url || null,
		};

		if (lastClearTimestamp > 0 && entry.timestamp <= lastClearTimestamp) {
			skippedOld++;
			continue;
		}

		const exists = history.some(
			h =>
				h.userId === entry.userId &&
				h.uri === entry.uri &&
				Math.abs(h.timestamp - entry.timestamp) < 1000
		);

		if (!exists) {
			history.push(entry);
			addedCount++;
		}
	}

	if (skippedOld > 0) {
		console.log(`⚠️  Skipped ${skippedOld} old tracks (before/at clear timestamp)`);
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
			album: {
				uri: nowPlaying.album.uri,
				name: nowPlaying.album.name,
			},
			artist: {
				uri: nowPlaying.artist.uri,
				name: nowPlaying.artist.name,
			},
			context: {
				uri: nowPlaying.context.uri,
				name: nowPlaying.context.name,
				index: nowPlaying.context.index,
			},
		},
	};
}

export function removeDuplicates(history) {
	const uniqueHistory = [];
	const seen = new Set();

	for (const entry of history) {
		const key = `${entry.userId}|${entry.uri}|${entry.timestamp}`;
		if (!seen.has(key)) {
			seen.add(key);
			uniqueHistory.push(entry);
		}
	}

	return uniqueHistory;
}

export function sortHistory(history) {
	return history.sort((a, b) => b.timestamp - a.timestamp);
}
