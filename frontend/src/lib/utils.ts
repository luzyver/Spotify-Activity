import { TRACKED_USERS } from './config';

/**
 * Get user initial from tracked users config
 */
export function getInitial(userId: string): string {
	return TRACKED_USERS[userId]?.initial || "U";
}

/**
 * Get user display name from tracked users config
 */
export function getUserName(userId: string): string {
	return TRACKED_USERS[userId]?.name || "User";
}

/**
 * Get user color from tracked users config
 */
export function getUserColor(userId: string): string {
	return TRACKED_USERS[userId]?.color || "#1db954";
}

/**
 * Convert timestamp to human-readable "time ago" format
 */
export function timeAgo(timestamp: number): string {
	const ts = String(timestamp).length === 10 ? timestamp * 1000 : timestamp;
	const now = Date.now();
	const diff = Math.floor((now - ts) / 1000);

	if (diff < 60) return "just now";
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
	return `${Math.floor(diff / 604800)}w ago`;
}

/**
 * Convert Spotify URI to web URL
 */
export function spotifyUrl(uri?: string): string {
	if (!uri) return "#";
	const trackId = uri.split(":")[2];
	return `https://open.spotify.com/track/${trackId}`;
}
