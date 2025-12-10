import * as spotify from '../services/spotify.js';
import * as github from '../services/github.js';
import * as processor from '../utils/data-processor.js';
import { getRandomCommitMessage } from '../utils/commit-messages.js';

const validateEnv = (env) => {
	const required = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_REFRESH_TOKENS', 'GITHUB_TOKEN', 'GITHUB_REPO'];
	for (const key of required) {
		if (!env[key]) throw new Error(`${key} not set`);
	}
};

async function processUser(userId, tokenData, clientId, clientSecret, history, lastClearTimestamp) {
	try {
		console.log(`Processing: ${userId}`);
		const accessToken = await spotify.refreshAccessToken(tokenData.refreshToken, clientId, clientSecret);

		const [userProfile, recentTracks] = await Promise.all([
			spotify.getUserProfile(accessToken),
			spotify.getRecentlyPlayed(accessToken, lastClearTimestamp),
		]);

		if (!userProfile) {
			console.log(`Failed to get profile for ${userId}`);
			return 0;
		}

		const addedCount = processor.processRecentTracks(recentTracks, userProfile, history, lastClearTimestamp);
		console.log(`Recent: ${recentTracks.length} fetched, ${addedCount} new`);
		return addedCount;
	} catch (error) {
		console.error(`Error processing ${userId}:`, error.message);
		return 0;
	}
}

export async function handleScheduled(env) {
	console.log('🎵 Fetching Spotify data...');

	try {
		validateEnv(env);

		const tokens = JSON.parse(env.SPOTIFY_REFRESH_TOKENS);
		const { SPOTIFY_CLIENT_ID: clientId, SPOTIFY_CLIENT_SECRET: clientSecret, GITHUB_TOKEN, GITHUB_REPO } = env;

		// Load data from GitHub in parallel
		const [historyResult, clearResult] = await Promise.all([
			github.getGitHubFile(GITHUB_REPO, 'history.json', GITHUB_TOKEN),
			github.getGitHubFile(GITHUB_REPO, 'last-clear.json', GITHUB_TOKEN),
		]);

		const lastClearTimestamp = clearResult.content?.lastClearTimestamp || 0;
		console.log(`Last clear: ${new Date(lastClearTimestamp).toISOString()}`);

		let history = processor.cleanHistory(historyResult.content || []);
		console.log(`Loaded ${history.length} history entries`);

		if (lastClearTimestamp > 0) {
			const before = history.length;
			history = history.filter(entry => entry.timestamp > lastClearTimestamp);
			if (before - history.length > 0) {
				console.log(`Filtered ${before - history.length} old entries`);
			}
		}

		// Process all users in parallel
		const results = await Promise.all(
			Object.entries(tokens).map(([userId, tokenData]) =>
				processUser(userId, tokenData, clientId, clientSecret, history, lastClearTimestamp)
			)
		);

		const totalNewTracks = results.reduce((sum, count) => sum + count, 0);

		// Dedupe and sort
		const uniqueHistory = processor.removeDuplicates(history);
		console.log(`Removed ${history.length - uniqueHistory.length} duplicates`);

		const sortedHistory = processor.sortHistory(uniqueHistory);

		// Check for changes
		const hasChanges = JSON.stringify(historyResult.content) !== JSON.stringify(sortedHistory);

		if (!hasChanges) {
			console.log('ℹ️ No changes, skipping commit');
			return new Response('Success: No changes', { status: 200 });
		}

		// Commit changes
		const { message: commitMsg, updatedCommits } = await getRandomCommitMessage(totalNewTracks, GITHUB_REPO, GITHUB_TOKEN);

		await github.updateMultipleGitHubFiles(
			GITHUB_REPO,
			[
				{ path: 'history.json', content: sortedHistory },
				{ path: 'last-commits.json', content: updatedCommits },
			],
			commitMsg,
			GITHUB_TOKEN
		);

		console.log(`✅ Committed: ${commitMsg} (${totalNewTracks} new tracks)`);
		return new Response('Success: Changes committed', { status: 200 });
	} catch (error) {
		console.error('❌ Error:', error);
		return new Response(`Error: ${error.message}`, { status: 500 });
	}
}
