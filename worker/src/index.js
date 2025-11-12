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

async function updateMultipleGitHubFiles(repo, files, message, token) {
	// Get the latest commit SHA
	const branchResponse = await fetch(
		`https://api.github.com/repos/${repo}/git/refs/heads/main`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'User-Agent': 'Rezz-Spotify-Worker/1.0',
			},
		}
	);

	if (!branchResponse.ok) {
		throw new Error(`Failed to get branch: ${branchResponse.statusText}`);
	}

	const branchData = await branchResponse.json();
	const latestCommitSha = branchData.object.sha;

	// Create blobs for each file
	const blobs = await Promise.all(
		files.map(async (file) => {
			const blobResponse = await fetch(
				`https://api.github.com/repos/${repo}/git/blobs`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: 'application/vnd.github.v3+json',
						'Content-Type': 'application/json',
						'User-Agent': 'Rezz-Spotify-Worker/1.0',
					},
					body: JSON.stringify({
						content: utf8ToBase64(JSON.stringify(file.content, null, 2)),
						encoding: 'base64',
					}),
				}
			);

			if (!blobResponse.ok) {
				throw new Error(`Failed to create blob: ${blobResponse.statusText}`);
			}

			const blobData = await blobResponse.json();
			return {
				path: file.path,
				mode: '100644',
				type: 'blob',
				sha: blobData.sha,
			};
		})
	);

	// Create a tree
	const treeResponse = await fetch(
		`https://api.github.com/repos/${repo}/git/trees`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'Content-Type': 'application/json',
				'User-Agent': 'Rezz-Spotify-Worker/1.0',
			},
			body: JSON.stringify({
				base_tree: latestCommitSha,
				tree: blobs,
			}),
		}
	);

	if (!treeResponse.ok) {
		throw new Error(`Failed to create tree: ${treeResponse.statusText}`);
	}

	const treeData = await treeResponse.json();

	// Create a commit
	const commitResponse = await fetch(
		`https://api.github.com/repos/${repo}/git/commits`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'Content-Type': 'application/json',
				'User-Agent': 'Rezz-Spotify-Worker/1.0',
			},
			body: JSON.stringify({
				message,
				tree: treeData.sha,
				parents: [latestCommitSha],
			}),
		}
	);

	if (!commitResponse.ok) {
		throw new Error(`Failed to create commit: ${commitResponse.statusText}`);
	}

	const commitData = await commitResponse.json();

	// Update the reference
	const updateRefResponse = await fetch(
		`https://api.github.com/repos/${repo}/git/refs/heads/main`,
		{
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'Content-Type': 'application/json',
				'User-Agent': 'Rezz-Spotify-Worker/1.0',
			},
			body: JSON.stringify({
				sha: commitData.sha,
			}),
		}
	);

	if (!updateRefResponse.ok) {
		throw new Error(`Failed to update ref: ${updateRefResponse.statusText}`);
	}

	return await updateRefResponse.json();
}

// ============================================================================
// DATA PROCESSING
// ============================================================================

// Helper function to generate varied commit messages
function getRandomCommitMessage(newTracks, liveCount) {
	const messages = [
		// Standard sync messages
		`🎵 Update Spotify data [skip ci]`,
		`🎧 Sync music activity [skip ci]`,
		`✨ Fresh Spotify update [skip ci]`,
		`📊 Update listening data [skip ci]`,
		`🎶 Sync tracks and live status [skip ci]`,
		`💿 Spotify sync complete [skip ci]`,
		`🔄 Music data refresh [skip ci]`,
		`📻 Update play history and status [skip ci]`,
		`🎼 Sync Spotify activity [skip ci]`,
		`💫 Latest music update [skip ci]`,

		// Musical themed
		`🎸 Rocking the playlist updates [skip ci]`,
		`🎹 Harmonizing the data sync [skip ci]`,
		`🥁 Drumroll... music updated! [skip ci]`,
		`🎺 Trumpeting new listening data [skip ci]`,
		`🎻 Fine-tuning the track history [skip ci]`,
		`🎤 Dropping fresh beats data [skip ci]`,

		// Creative/Fun messages
		`🌟 Vibing with latest tracks [skip ci]`,
		`🚀 Launching music updates [skip ci]`,
		`⚡ Lightning-fast sync complete [skip ci]`,
		`🌈 Rainbow of musical updates [skip ci]`,
		`🔥 Hot tracks coming through [skip ci]`,
		`💎 Polishing the music data [skip ci]`,
		`🌙 Moonlight serenade sync [skip ci]`,
		`☀️ Sunshine music update [skip ci]`,
		`🎯 Bulls-eye track sync [skip ci]`,
		`🎨 Painting with sound data [skip ci]`,

		// Time-based messages
		`⏰ Timely music refresh [skip ci]`,
		`🕐 Hourly beats update [skip ci]`,
		`📅 Daily rhythm sync [skip ci]`,
		`⏳ Time flies, tracks sync [skip ci]`,

		// Tech-themed
		`🤖 Bot updating musical database [skip ci]`,
		`💻 Compiling fresh playlists [skip ci]`,
		`🔧 Maintaining the groove [skip ci]`,
		`⚙️ Automated music pipeline [skip ci]`,
		`📡 Broadcasting latest jams [skip ci]`,

		// Playful messages
		`🎪 The music show goes on [skip ci]`,
		`🎢 Rollercoaster of tunes updated [skip ci]`,
		`🎭 Drama-free data sync [skip ci]`,
		`🎬 Action! Music rolling [skip ci]`,
		`🎮 Level up: tracks synced [skip ci]`,
		`🏆 Trophy unlocked: sync complete [skip ci]`,
		`🎉 Celebrating new beats [skip ci]`,
		`🎊 Party time: data updated [skip ci]`
	];

	// Add dynamic messages based on activity
	if (newTracks > 0) {
		messages.push(
			`🎵 Add ${newTracks} new track${newTracks !== 1 ? 's' : ''} [skip ci]`,
			`📝 ${newTracks} track${newTracks !== 1 ? 's' : ''} added to history [skip ci]`,
			`🎧 Logged ${newTracks} new track${newTracks !== 1 ? 's' : ''} [skip ci]`,
			`✅ ${newTracks} fresh track${newTracks !== 1 ? 's' : ''} recorded [skip ci]`,
			`🆕 ${newTracks} track${newTracks !== 1 ? 's' : ''} joined the party [skip ci]`,
			`📥 Downloaded ${newTracks} track${newTracks !== 1 ? 's' : ''} to history [skip ci]`,
			`🌊 Wave of ${newTracks} new track${newTracks !== 1 ? 's' : ''} [skip ci]`,
			`💝 ${newTracks} musical gift${newTracks !== 1 ? 's' : ''} received [skip ci]`
		);
	}

	if (liveCount > 0) {
		messages.push(
			`🔴 ${liveCount} user${liveCount !== 1 ? 's' : ''} listening now [skip ci]`,
			`▶️ Live: ${liveCount} active listener${liveCount !== 1 ? 's' : ''} [skip ci]`,
			`🎧 ${liveCount} vibe${liveCount !== 1 ? 's' : ''} in progress [skip ci]`,
			`🔊 ${liveCount} soul${liveCount !== 1 ? 's' : ''} tuned in [skip ci]`,
			`🎶 ${liveCount} melody maker${liveCount !== 1 ? 's' : ''} online [skip ci]`,
			`👂 ${liveCount} ear${liveCount !== 1 ? 's' : ''} on the music [skip ci]`
		);
	}

	const randomIndex = Math.floor(Math.random() * messages.length);
	return messages[randomIndex];
}

// Helper function to fix double-encoded UTF-8 (mojibake)
function fixDoubleEncoding(str) {
	if (!str) return str;

	try {
		// Strategy: Try to decode as Latin-1 bytes -> UTF-8
		// If result is "better" (more valid UTF-8), use it
		const decoder = new TextDecoder('utf-8');

		// Convert string treating each character as Latin-1 byte
		const bytes = [];
		for (let i = 0; i < str.length; i++) {
			bytes.push(str.charCodeAt(i) & 0xFF);
		}

		// Try to decode as UTF-8
		const fixed = decoder.decode(new Uint8Array(bytes));

		// Check if fixed version is "better" than original
		// Criteria:
		// 1. No replacement characters (�)
		// 2. Different from original
		// 3. Has fewer high-ASCII characters (0x80-0xFF range)
		//    because proper UTF-8 uses multi-byte sequences for these

		if (fixed === str) return str; // No change

		// Count high-ASCII characters (potential mojibake indicators)
		const countHighAscii = (s) => {
			let count = 0;
			for (let i = 0; i < s.length; i++) {
				const code = s.charCodeAt(i);
				if (code >= 0x80 && code <= 0xFF) count++;
			}
			return count;
		};

		const originalHighAscii = countHighAscii(str);
		const fixedHighAscii = countHighAscii(fixed);

		// If fixed version has no replacement chars and fewer high-ASCII chars, it's likely correct
		if (!fixed.includes('\uFFFD') && fixedHighAscii < originalHighAscii) {
			return fixed;
		}
	} catch (e) {
		console.error('Error fixing encoding:', e.message);
	}

	return str;
}

// Clean existing history from double-encoding issues
function cleanHistory(history) {
	return history.map(entry => ({
		...entry,
		track: fixDoubleEncoding(entry.track),
		artist: fixDoubleEncoding(entry.artist),
		user: fixDoubleEncoding(entry.user)
	}));
}

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

async function handleClearHistory(env) {
	console.log('🗑️  Clearing history (scheduled)...');

	try {
		// Validate environment variables
		if (!env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not set');
		if (!env.GITHUB_REPO) throw new Error('GITHUB_REPO not set');

		const githubToken = env.GITHUB_TOKEN;
		const githubRepo = env.GITHUB_REPO;

		// Check current history
		const { content: currentHistory } = await getGitHubFile(
			githubRepo,
			'history.json',
			githubToken
		);

		// If history is already empty, skip commit
		if (!currentHistory || currentHistory.length === 0) {
			console.log(`ℹ️  History is already empty, skipping commit`);
			return new Response('Success: History already empty', { status: 200 });
		}

		// Clear history by setting it to empty array
		const emptyHistory = [];
		const commitMsg = '🗑️ Clear history (daily reset) [skip ci]';

		await updateMultipleGitHubFiles(
			githubRepo,
			[
				{ path: 'history.json', content: emptyHistory }
			],
			commitMsg,
			githubToken
		);

		console.log(`✅ History cleared successfully! (${currentHistory.length} items removed)`);
		return new Response('Success: History cleared', { status: 200 });
	} catch (error) {
		console.error('❌ Error clearing history:', error);
		return new Response(`Error: ${error.message}`, { status: 500 });
	}
}

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
		const { content: rawHistory = [], sha: historySha } = await getGitHubFile(
			githubRepo,
			'history.json',
			githubToken
		);

		// Clean history from any double-encoding issues
		const history = cleanHistory(rawHistory);
		console.log(`Loaded ${history.length} history entries`);

		const liveFriends = [];
		let totalNewTracks = 0;

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
				totalNewTracks += addedCount;
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

		// Remove duplicates (might be created after encoding fix)
		const uniqueHistory = [];
		const seen = new Set();

		for (const entry of history) {
			const key = `${entry.userId}|${entry.uri}|${entry.timestamp}`;
			if (!seen.has(key)) {
				seen.add(key);
				uniqueHistory.push(entry);
			}
		}

		console.log(`Removed ${history.length - uniqueHistory.length} duplicate entries`);

		// Sort history
		uniqueHistory.sort((a, b) => b.timestamp - a.timestamp);

		// Check if there are actual changes before committing
		const { content: existingLive } = await getGitHubFile(
			githubRepo,
			'live.json',
			githubToken
		);

		// Compare history data
		const historyChanged = JSON.stringify(rawHistory) !== JSON.stringify(uniqueHistory);

		// Compare live data
		const newLiveData = { friends: liveFriends };
		const liveChanged = JSON.stringify(existingLive) !== JSON.stringify(newLiveData);

		// Only commit if there are changes
		if (historyChanged || liveChanged) {
			const commitMsg = getRandomCommitMessage(totalNewTracks, liveFriends.length);
			await updateMultipleGitHubFiles(
				githubRepo,
				[
					{ path: 'history.json', content: uniqueHistory },
					{ path: 'live.json', content: newLiveData }
				],
				commitMsg,
				githubToken
			);

			console.log(`✅ Update complete! Commit: ${commitMsg}`);
			console.log(`   - History changed: ${historyChanged}`);
			console.log(`   - Live status changed: ${liveChanged}`);
			return new Response('Success: Changes committed', { status: 200 });
		} else {
			console.log(`ℹ️  No changes detected, skipping commit`);
			return new Response('Success: No changes to commit', { status: 200 });
		}
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
		// Get current time in UTC
		const now = new Date();
		const hours = now.getUTCHours();
		const minutes = now.getUTCMinutes();

		// Check if this is the clear history cron (16:59 UTC = 23:59 GMT+7)
		if (hours === 16 && minutes === 59) {
			console.log('🗑️  Detected clear history cron trigger');
			ctx.waitUntil(handleClearHistory(env));
		} else {
			console.log('🎵 Detected sync cron trigger');
			ctx.waitUntil(handleScheduled(env));
		}
	},

	// HTTP request (for manual trigger)
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const pathname = url.pathname;

		// CORS headers for all responses
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		// Handle OPTIONS for CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// Manual trigger endpoint
		if (request.method === 'GET' && pathname === '/trigger') {
			return handleScheduled(env);
		}

		// Clear history endpoint
		if ((request.method === 'GET' || request.method === 'POST') && pathname === '/clear-history') {
			try {
				console.log('🗑️  Clearing history request received...');

				// Validate environment variables
				if (!env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not set');
				if (!env.GITHUB_REPO) throw new Error('GITHUB_REPO not set');
				if (!env.CLEAR_HISTORY_PASSWORD) throw new Error('CLEAR_HISTORY_PASSWORD not configured');

				// Check password authentication
				const providedPassword = url.searchParams.get('password') ||
					request.headers.get('X-Clear-Password') ||
					request.headers.get('Authorization')?.replace('Bearer ', '');

				if (!providedPassword) {
					console.log('❌ No password provided');

					// If accessed from browser (GET without password), show HTML form
					if (request.method === 'GET' && request.headers.get('Accept')?.includes('text/html')) {
						return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Clear History - Authentication Required</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20px;
		}
		.container {
			background: white;
			padding: 40px;
			border-radius: 16px;
			box-shadow: 0 20px 60px rgba(0,0,0,0.3);
			max-width: 400px;
			width: 100%;
		}
		h1 {
			color: #333;
			margin-bottom: 10px;
			font-size: 24px;
		}
		p {
			color: #666;
			margin-bottom: 30px;
			font-size: 14px;
		}
		.form-group {
			margin-bottom: 20px;
		}
		label {
			display: block;
			margin-bottom: 8px;
			color: #333;
			font-weight: 500;
			font-size: 14px;
		}
		input[type="password"] {
			width: 100%;
			padding: 12px 16px;
			border: 2px solid #e0e0e0;
			border-radius: 8px;
			font-size: 16px;
			transition: border-color 0.3s;
		}
		input[type="password"]:focus {
			outline: none;
			border-color: #667eea;
		}
		button {
			width: 100%;
			padding: 14px;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			border: none;
			border-radius: 8px;
			font-size: 16px;
			font-weight: 600;
			cursor: pointer;
			transition: transform 0.2s, box-shadow 0.2s;
		}
		button:hover {
			transform: translateY(-2px);
			box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
		}
		button:active {
			transform: translateY(0);
		}
		.icon {
			font-size: 48px;
			text-align: center;
			margin-bottom: 20px;
		}
		#message {
			margin-top: 20px;
			padding: 12px;
			border-radius: 8px;
			font-size: 14px;
			display: none;
		}
		#message.success {
			background: #d4edda;
			color: #155724;
			border: 1px solid #c3e6cb;
		}
		#message.error {
			background: #f8d7da;
			color: #721c24;
			border: 1px solid #f5c6cb;
		}
		.loading {
			display: none;
			text-align: center;
			margin-top: 10px;
			color: #667eea;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="icon">🗑️</div>
		<h1>Clear History</h1>
		<p>Enter password to clear listening history</p>

		<form id="clearForm">
			<div class="form-group">
				<label for="password">Password</label>
				<input type="password" id="password" name="password" required placeholder="Enter password" autocomplete="off">
			</div>
			<button type="submit">Clear History</button>
		</form>

		<div class="loading" id="loading">⏳ Processing...</div>
		<div id="message"></div>
	</div>

	<script>
		document.getElementById('clearForm').addEventListener('submit', async (e) => {
			e.preventDefault();

			const password = document.getElementById('password').value;
			const button = e.target.querySelector('button');
			const loading = document.getElementById('loading');
			const message = document.getElementById('message');

			// Reset
			message.style.display = 'none';
			button.disabled = true;
			loading.style.display = 'block';

			try {
				const response = await fetch('/clear-history?password=' + encodeURIComponent(password), {
					method: 'POST'
				});

				const data = await response.json();

				if (data.success) {
					message.className = 'success';
					message.textContent = '✅ ' + data.message + (data.itemsRemoved ? ' (' + data.itemsRemoved + ' items removed)' : '');
					document.getElementById('password').value = '';
				} else {
					message.className = 'error';
					message.textContent = '❌ ' + data.error;
				}
			} catch (error) {
				message.className = 'error';
				message.textContent = '❌ Network error: ' + error.message;
			} finally {
				message.style.display = 'block';
				button.disabled = false;
				loading.style.display = 'none';
			}
		});
	</script>
</body>
</html>
						`, {
							status: 200,
							headers: {
								'Content-Type': 'text/html',
								...corsHeaders
							}
						});
					}

					// API request without password
					return new Response(JSON.stringify({
						success: false,
						error: 'Password required. Use ?password=YOUR_PASSWORD or X-Clear-Password header'
					}), {
						status: 401,
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders
						}
					});
				}

				if (providedPassword !== env.CLEAR_HISTORY_PASSWORD) {
					console.log('❌ Invalid password provided');
					return new Response(JSON.stringify({
						success: false,
						error: 'Invalid password'
					}), {
						status: 403,
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders
						}
					});
				}

				console.log('✅ Password authenticated, clearing history...');

				const githubToken = env.GITHUB_TOKEN;
				const githubRepo = env.GITHUB_REPO;

				// Check current history
				const { content: currentHistory } = await getGitHubFile(
					githubRepo,
					'history.json',
					githubToken
				);

				// If history is already empty, skip commit
				if (!currentHistory || currentHistory.length === 0) {
					console.log(`ℹ️  History is already empty, skipping commit`);
					return new Response(JSON.stringify({
						success: true,
						message: 'History is already empty',
						skipped: true,
						timestamp: new Date().toISOString()
					}), {
						status: 200,
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders
						}
					});
				}

				// Clear history by setting it to empty array
				const emptyHistory = [];
				const commitMsg = '🗑️ Clear history (daily reset) [skip ci]';

				await updateMultipleGitHubFiles(
					githubRepo,
					[
						{ path: 'history.json', content: emptyHistory }
					],
					commitMsg,
					githubToken
				);

				console.log(`✅ History cleared successfully! (${currentHistory.length} items removed)`);
				return new Response(JSON.stringify({
					success: true,
					message: 'History cleared successfully',
					itemsRemoved: currentHistory.length,
					timestamp: new Date().toISOString()
				}), {
					status: 200,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
			} catch (error) {
				console.error('❌ Error clearing history:', error);
				return new Response(JSON.stringify({
					success: false,
					error: error.message
				}), {
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
			}
		}

		// API endpoint to get live.json with no caching
		if (request.method === 'GET' && pathname === '/api/live') {
			try {
				const { content } = await getGitHubFile(
					env.GITHUB_REPO,
					'live.json',
					env.GITHUB_TOKEN
				);

				return new Response(JSON.stringify(content || { friends: [] }), {
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
						'Pragma': 'no-cache',
						'Expires': '0',
						...corsHeaders
					}
				});
			} catch (error) {
				return new Response(JSON.stringify({ friends: [], error: error.message }), {
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
			}
		}

		// API endpoint to get history.json with no caching
		if (request.method === 'GET' && pathname === '/api/history') {
			try {
				const { content } = await getGitHubFile(
					env.GITHUB_REPO,
					'history.json',
					env.GITHUB_TOKEN
				);

				return new Response(JSON.stringify(content || []), {
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
						'Pragma': 'no-cache',
						'Expires': '0',
						...corsHeaders
					}
				});
			} catch (error) {
				return new Response(JSON.stringify({ error: error.message }), {
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
			}
		}

		return new Response('Spotify Activity Worker\n\nEndpoints:\n- GET /trigger - Manual trigger\n- GET /clear-history - Clear history data\n- GET /api/live - Get live activity\n- GET /api/history - Get listening history', {
			headers: { 'Content-Type': 'text/plain' },
		});
	},
};
