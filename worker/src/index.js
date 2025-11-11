/**
 * Cloudflare Worker for Spotify Activity Tracker
 * Fetches Spotify data and updates GitHub repository
 */

// ============================================================================
// SPOTIFY API
// ============================================================================

async function refreshAccessToken(refreshToken, clientId, clientSecret) {
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

async function getUserProfile(accessToken) {
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

async function getRecentlyPlayed(accessToken) {
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

async function getCurrentlyPlaying(accessToken) {
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

// ============================================================================
// GITHUB API
// ============================================================================

// Helper function to properly decode base64 to UTF-8 string
function base64ToUtf8(base64Str) {
	// Remove whitespace and newlines that GitHub might add
	const cleanBase64 = base64Str.replace(/\s/g, '');

	// Decode base64 to binary string
	const binaryString = atob(cleanBase64);

	// Convert binary string to Uint8Array
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}

	// Decode UTF-8 bytes to string
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

async function getGitHubFile(repo, path, token) {
	const url = `https://api.github.com/repos/${repo}/contents/${path}`;
	console.log(`Fetching: ${url}`);

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'Rezz-Spotify-Worker/1.0',
		},
	});

	console.log(`Response status: ${response.status}`);

	if (response.status === 404) {
		console.log(`File not found: ${path}, will create new`);
		return { content: null, sha: null };
	}

	if (!response.ok) {
		const errorBody = await response.text();
		console.error(`GitHub API Error: ${response.status} - ${errorBody}`);
		throw new Error(`Failed to get file: ${response.statusText} - ${errorBody}`);
	}

	const data = await response.json();
	// Use proper UTF-8 decoding instead of just atob()
	const jsonString = base64ToUtf8(data.content);
	const content = JSON.parse(jsonString);
	return { content, sha: data.sha };
}

// Helper function to properly encode UTF-8 strings to base64
// This handles Unicode characters correctly for GitHub API
function utf8ToBase64(str) {
	// Use TextEncoder to properly convert UTF-8 string to bytes
	const encoder = new TextEncoder();
	const utf8Bytes = encoder.encode(str);

	// Convert bytes array to binary string
	const binaryString = Array.from(utf8Bytes)
		.map(byte => String.fromCharCode(byte))
		.join('');

	// Encode to base64
	return btoa(binaryString);
}

async function updateGitHubFile(repo, path, content, message, sha, token) {
	const response = await fetch(
		`https://api.github.com/repos/${repo}/contents/${path}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'Content-Type': 'application/json',
				'User-Agent': 'Rezz-Spotify-Worker/1.0',
			},
			body: JSON.stringify({
				message,
				content: utf8ToBase64(JSON.stringify(content, null, 2)),
				sha,
			}),
		}
	);

	if (!response.ok) {
		throw new Error(`Failed to update file: ${response.statusText}`);
	}

	return await response.json();
}

// ============================================================================
// DATA PROCESSING
// ============================================================================

function processRecentTracks(recentTracks, userProfile, history) {
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

		// Check for duplicates using URI and timestamp (more reliable than track name)
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

function processCurrentlyPlaying(nowPlaying, userProfile) {
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

// ============================================================================
// MAIN HANDLER
// ============================================================================

async function handleScheduled(env) {
	console.log('🎵 Fetching Spotify data...');

	try {
		// Validate environment variables
		if (!env.SPOTIFY_CLIENT_ID) throw new Error('SPOTIFY_CLIENT_ID not set');
		if (!env.SPOTIFY_CLIENT_SECRET) throw new Error('SPOTIFY_CLIENT_SECRET not set');
		if (!env.SPOTIFY_REFRESH_TOKENS) throw new Error('SPOTIFY_REFRESH_TOKENS not set');
		if (!env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not set');
		if (!env.GITHUB_REPO) throw new Error('GITHUB_REPO not set');

		// Parse tokens
		const tokens = JSON.parse(env.SPOTIFY_REFRESH_TOKENS);
		const clientId = env.SPOTIFY_CLIENT_ID;
		const clientSecret = env.SPOTIFY_CLIENT_SECRET;
		const githubToken = env.GITHUB_TOKEN;
		const githubRepo = env.GITHUB_REPO;

		console.log(`GitHub Repo: ${githubRepo}`);
		console.log(`GitHub Token: ${githubToken.substring(0, 10)}...`);

		// Load existing data from GitHub
		const { content: history = [], sha: historySha } = await getGitHubFile(
			githubRepo,
			'history.json',
			githubToken
		);

		const liveFriends = [];

		// Process each user
		for (const [userId, tokenData] of Object.entries(tokens)) {
			try {
				console.log(`Processing: ${userId}`);

				// Get access token
				const accessToken = await refreshAccessToken(
					tokenData.refreshToken,
					clientId,
					clientSecret
				);

				// Get user profile
				const userProfile = await getUserProfile(accessToken);
				if (!userProfile) {
					console.log(`Failed to get profile for ${userId}`);
					continue;
				}

				// Get recent tracks
				const recentTracks = await getRecentlyPlayed(accessToken);
				const addedCount = processRecentTracks(
					recentTracks,
					userProfile,
					history
				);
				console.log(
					`Recent: ${recentTracks.length} fetched, ${addedCount} new`
				);

				// Get currently playing
				const nowPlaying = await getCurrentlyPlaying(accessToken);
				if (nowPlaying) {
					const liveEntry = processCurrentlyPlaying(nowPlaying, userProfile);
					if (liveEntry) {
						liveFriends.push(liveEntry);
						console.log(`Now playing: ${nowPlaying.track.name}`);
					}
				}
			} catch (error) {
				console.error(`Error processing ${userId}:`, error.message);
			}
		}

		// Sort history
		history.sort((a, b) => b.timestamp - a.timestamp);

		// Update GitHub files
		await updateGitHubFile(
			githubRepo,
			'history.json',
			history,
			'Update Spotify history [skip ci]',
			historySha,
			githubToken
		);

		const { sha: liveSha } = await getGitHubFile(
			githubRepo,
			'live.json',
			githubToken
		);

		await updateGitHubFile(
			githubRepo,
			'live.json',
			{ friends: liveFriends },
			'Update Spotify live data [skip ci]',
			liveSha,
			githubToken
		);

		console.log('✅ Update complete!');
		return new Response('Success', { status: 200 });
	} catch (error) {
		console.error('❌ Error:', error);
		return new Response(`Error: ${error.message}`, { status: 500 });
	}
}

// ============================================================================
// CLOUDFLARE WORKER EXPORTS
// ============================================================================

export default {
	// Scheduled event (cron trigger)
	async scheduled(event, env, ctx) {
		ctx.waitUntil(handleScheduled(env));
	},

	// HTTP request (for manual trigger)
	async fetch(request, env, ctx) {
		if (request.method === 'GET' && new URL(request.url).pathname === '/trigger') {
			return handleScheduled(env);
		}

		return new Response('Spotify Activity Worker\n\nEndpoints:\n- GET /trigger - Manual trigger', {
			headers: { 'Content-Type': 'text/plain' },
		});
	},
};
