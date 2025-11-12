/**
 * Data Processor
 * Processes and transforms Spotify data
 */

import { fixDoubleEncoding } from './encoding.js';

/**
 * Clean existing history from double-encoding issues
 * @param {Array} history - Array of history entries
 * @returns {Array} Cleaned history
 */
export function cleanHistory(history) {
	return history.map(entry => ({
		...entry,
		track: fixDoubleEncoding(entry.track),
		artist: fixDoubleEncoding(entry.artist),
		user: fixDoubleEncoding(entry.user)
	}));
}

/**
 * Process recently played tracks and add to history
 * @param {Array} recentTracks - Array of recent track items from Spotify
 * @param {Object} userProfile - User profile object
 * @param {Array} history - Existing history array (will be modified)
 * @returns {number} Number of tracks added
 */
export function processRecentTracks(recentTracks, userProfile, history) {
	let addedCount = 0;

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

		// Check for duplicates using URI and timestamp
		// Also check if timestamp is within 1 second (1000ms) to handle slight timing differences
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

	return addedCount;
}

/**
 * Process currently playing track
 * @param {Object|null} nowPlaying - Currently playing track data from Spotify
 * @param {Object} userProfile - User profile object
 * @returns {Object|null} Formatted live entry or null
 */
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

/**
 * Remove duplicate entries from history
 * @param {Array} history - History array
 * @returns {Array} De-duplicated history
 */
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

/**
 * Sort history by timestamp (newest first)
 * @param {Array} history - History array
 * @returns {Array} Sorted history
 */
export function sortHistory(history) {
	return history.sort((a, b) => b.timestamp - a.timestamp);
}
