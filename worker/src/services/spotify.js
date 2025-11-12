/**
 * Spotify API Service
 * Handles all Spotify API interactions
 */

/**
 * Refresh Spotify access token using refresh token
 * @param {string} refreshToken - The refresh token
 * @param {string} clientId - Spotify client ID
 * @param {string} clientSecret - Spotify client secret
 * @returns {Promise<string>} Access token
 */
export async function refreshAccessToken(refreshToken, clientId, clientSecret) {
	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken,
		}),
	});

	if (!response.ok) {
		throw new Error(`Failed to refresh token: ${response.statusText}`);
	}

	const data = await response.json();
	return data.access_token;
}

/**
 * Get user profile from Spotify
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<Object|null>} User profile object or null if failed
 */
export async function getUserProfile(accessToken) {
	const response = await fetch('https://api.spotify.com/v1/me', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Accept': 'application/json',
			'Content-Type': 'application/json; charset=utf-8',
		},
	});

	if (!response.ok) return null;

	const data = await response.json();
	return {
		name: data.display_name,
		uri: data.uri,
		imageUrl: data.images?.[0]?.url || null,
	};
}

/**
 * Get recently played tracks from Spotify
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<Array>} Array of recently played track items
 */
export async function getRecentlyPlayed(accessToken) {
	const response = await fetch(
		'https://api.spotify.com/v1/me/player/recently-played?limit=50',
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Accept': 'application/json',
				'Content-Type': 'application/json; charset=utf-8',
			},
		}
	);

	if (!response.ok) return [];

	const data = await response.json();
	return data.items || [];
}

/**
 * Get currently playing track from Spotify
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<Object|null>} Currently playing track or null
 */
export async function getCurrentlyPlaying(accessToken) {
	const response = await fetch(
		'https://api.spotify.com/v1/me/player/currently-playing',
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Accept': 'application/json',
				'Content-Type': 'application/json; charset=utf-8',
			},
		}
	);

	if (response.status === 204 || !response.ok) return null;

	const data = await response.json();
	if (!data.item) return null;

	return {
		timestamp: Date.now(),
		track: {
			name: data.item.name,
			uri: data.item.uri,
			imageUrl: data.item.album.images?.[0]?.url || null,
		},
		album: {
			name: data.item.album.name,
			uri: data.item.album.uri,
		},
		artist: {
			name: data.item.artists.map(a => a.name).join(', '),
			uri: data.item.artists[0]?.uri,
		},
		context: {
			uri: data.context?.uri || null,
			name: data.context?.type || null,
			index: 0,
		},
	};
}
