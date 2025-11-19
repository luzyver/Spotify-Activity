import * as github from '../services/github.js';

export async function handleLiveAPI(env, corsHeaders) {
	try {
		const tokens = JSON.parse(env.SPOTIFY_REFRESH_TOKENS);
		const clientId = env.SPOTIFY_CLIENT_ID;
		const clientSecret = env.SPOTIFY_CLIENT_SECRET;

		const liveFriends = [];

		// Fetch currently playing for each user
		for (const [userId, tokenData] of Object.entries(tokens)) {
			try {
				const spotify = await import('../services/spotify.js');
				const processor = await import('../utils/data-processor.js');

				// Get access token
				const accessToken = await spotify.refreshAccessToken(
					tokenData.refreshToken,
					clientId,
					clientSecret
				);

				// Get user profile
				const userProfile = await spotify.getUserProfile(accessToken);
				if (!userProfile) continue;

				// Get currently playing
				const nowPlaying = await spotify.getCurrentlyPlaying(accessToken);
				if (nowPlaying) {
					const liveEntry = processor.processCurrentlyPlaying(nowPlaying, userProfile);
					if (liveEntry) {
						liveFriends.push(liveEntry);
					}
				}
			} catch (error) {
				console.error(`Error fetching live data for ${userId}:`, error.message);
			}
		}

		return new Response(JSON.stringify({ friends: liveFriends }), {
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

export async function handleHistoryAPI(env, corsHeaders) {
	try {
		const tokens = JSON.parse(env.SPOTIFY_REFRESH_TOKENS);
		const clientId = env.SPOTIFY_CLIENT_ID;
		const clientSecret = env.SPOTIFY_CLIENT_SECRET;

		// Load existing history from GitHub
		const { content: rawHistory = [] } = await github.getGitHubFile(
			env.GITHUB_REPO,
			'history.json',
			env.GITHUB_TOKEN
		);

		// Load last clear timestamp
		const { content: lastClearData = { lastClearTimestamp: 0 } } = await github.getGitHubFile(
			env.GITHUB_REPO,
			'last-clear.json',
			env.GITHUB_TOKEN
		);
		const lastClearTimestamp = lastClearData.lastClearTimestamp || 0;

		const processor = await import('../utils/data-processor.js');
		const spotify = await import('../services/spotify.js');

		// Clean and filter history
		let history = processor.cleanHistory(rawHistory);
		if (lastClearTimestamp > 0) {
			history = history.filter(entry => entry.timestamp > lastClearTimestamp);
		}

		// Fetch fresh data from Spotify for each user
		for (const [userId, tokenData] of Object.entries(tokens)) {
			try {
				// Get access token
				const accessToken = await spotify.refreshAccessToken(
					tokenData.refreshToken,
					clientId,
					clientSecret
				);

				// Get user profile
				const userProfile = await spotify.getUserProfile(accessToken);
				if (!userProfile) continue;

				// Get recent tracks (after last clear)
				const recentTracks = await spotify.getRecentlyPlayed(accessToken, lastClearTimestamp);
				processor.processRecentTracks(
					recentTracks,
					userProfile,
					history,
					lastClearTimestamp
				);
			} catch (error) {
				console.error(`Error fetching history for ${userId}:`, error.message);
			}
		}

		// Remove duplicates and sort
		const uniqueHistory = processor.removeDuplicates(history);
		const sortedHistory = processor.sortHistory(uniqueHistory);

		return new Response(JSON.stringify(sortedHistory), {
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
