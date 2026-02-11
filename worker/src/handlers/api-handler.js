import * as github from '../services/github.js';
import * as spotify from '../services/spotify.js';
import * as supabase from '../services/supabase.js';
import * as processor from '../utils/data-processor.js';

const NO_CACHE_HEADERS = {
	'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
	'Pragma': 'no-cache',
	'Expires': '0',
};

const jsonResponse = (data, status = 200, headers = {}) =>
	new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', ...NO_CACHE_HEADERS, ...headers },
	});

async function fetchUserLiveData(userId, tokenData, clientId, clientSecret) {
	try {
		const accessToken = await spotify.refreshAccessToken(tokenData.refreshToken, clientId, clientSecret);
		const [userProfile, nowPlaying] = await Promise.all([
			spotify.getUserProfile(accessToken),
			spotify.getCurrentlyPlaying(accessToken),
		]);

		if (!userProfile || !nowPlaying) return null;
		return processor.processCurrentlyPlaying(nowPlaying, userProfile);
	} catch (error) {
		console.error(`Live data error for ${userId}:`, error.message);
		return null;
	}
}

export async function handleLiveAPI(env, corsHeaders) {
	try {
		const tokens = JSON.parse(env.SPOTIFY_REFRESH_TOKENS);
		const { SPOTIFY_CLIENT_ID: clientId, SPOTIFY_CLIENT_SECRET: clientSecret } = env;

		// Fetch all users in parallel
		const results = await Promise.all(
			Object.entries(tokens).map(([userId, tokenData]) =>
				fetchUserLiveData(userId, tokenData, clientId, clientSecret)
			)
		);

		const friends = results.filter(Boolean);
		return jsonResponse({ friends }, 200, corsHeaders);
	} catch (error) {
		return jsonResponse({ friends: [], error: error.message }, 500, corsHeaders);
	}
}

async function fetchUserHistory(userId, tokenData, clientId, clientSecret, history, lastClearTimestamp) {
	try {
		const accessToken = await spotify.refreshAccessToken(tokenData.refreshToken, clientId, clientSecret);
		const [userProfile, recentTracks] = await Promise.all([
			spotify.getUserProfile(accessToken),
			spotify.getRecentlyPlayed(accessToken, lastClearTimestamp),
		]);

		if (!userProfile) return;
		processor.processRecentTracks(recentTracks, userProfile, history, lastClearTimestamp);
	} catch (error) {
		console.error(`History error for ${userId}:`, error.message);
	}
}

export async function handleHistoryAPI(env, corsHeaders) {
	try {
		const tokens = JSON.parse(env.SPOTIFY_REFRESH_TOKENS);
		const { SPOTIFY_CLIENT_ID: clientId, SPOTIFY_CLIENT_SECRET: clientSecret, GITHUB_REPO, GITHUB_TOKEN } = env;

		// Fetch GitHub data in parallel
		const [historyResult, clearResult] = await Promise.all([
			github.getGitHubFile(GITHUB_REPO, 'history.json', GITHUB_TOKEN),
			github.getGitHubFile(GITHUB_REPO, 'last-clear.json', GITHUB_TOKEN),
		]);

		const lastClearTimestamp = clearResult.content?.lastClearTimestamp || 0;
		let history = processor.cleanHistory(historyResult.content || []);

		if (lastClearTimestamp > 0) {
			history = history.filter(entry => entry.timestamp > lastClearTimestamp);
		}

		// Fetch all users in parallel
		await Promise.all(
			Object.entries(tokens).map(([userId, tokenData]) =>
				fetchUserHistory(userId, tokenData, clientId, clientSecret, history, lastClearTimestamp)
			)
		);

		const result = processor.sortHistory(processor.removeDuplicates(history));
		return jsonResponse(result, 200, corsHeaders);
	} catch (error) {
		return jsonResponse({ error: error.message }, 500, corsHeaders);
	}
}

export async function handleHistoryArchiveAPI(env, corsHeaders, url) {
	try {
		const limit = parseInt(url.searchParams.get('limit')) || 1000;
		const offset = parseInt(url.searchParams.get('offset')) || 0;
		const search = url.searchParams.get('search') || undefined;

		const { data, count } = await supabase.fetchHistory(env.SUPABASE_ANON_KEY, { limit, offset, search });

		// Transform from Supabase column format to frontend HistoryItem format
		const items = data.map(record => ({
			timestamp: record.timestamp,
			user: record.user_name,
			userId: record.user_id,
			track: record.track,
			artist: record.artist,
			uri: record.uri,
			imageUrl: record.image_url
		}));

		return jsonResponse({ data: items, count }, 200, corsHeaders);
	} catch (error) {
		return jsonResponse({ data: [], count: 0, error: error.message }, 500, corsHeaders);
	}
}
