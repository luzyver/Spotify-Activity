import * as spotify from '../services/spotify.js';
import * as github from '../services/github.js';
import * as processor from '../utils/data-processor.js';
import { getRandomCommitMessage } from '../utils/commit-messages.js';

export async function handleScheduled(env) {
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

		// Load existing data from GitHub
		const { content: rawHistory = [] } = await github.getGitHubFile(
			githubRepo,
			'history.json',
			githubToken
		);

		// Load last clear timestamp
		const { content: lastClearData = { lastClearTimestamp: 0 } } = await github.getGitHubFile(
			githubRepo,
			'last-clear.json',
			githubToken
		);
		const lastClearTimestamp = lastClearData.lastClearTimestamp || 0;
		console.log(`Last clear timestamp: ${lastClearTimestamp} (${new Date(lastClearTimestamp).toISOString()})`);

		// Clean history from any double-encoding issues
		let history = processor.cleanHistory(rawHistory);
		console.log(`Loaded ${history.length} history entries`);

		if (lastClearTimestamp > 0) {
			const beforeFilter = history.length;
			history = history.filter(entry => entry.timestamp > lastClearTimestamp);
			const filtered = beforeFilter - history.length;
			if (filtered > 0) {
				console.log(`⚠️  Filtered out ${filtered} old entries (before clear timestamp)`);
			}
		}

		let totalNewTracks = 0;

		// Process each user
		for (const [userId, tokenData] of Object.entries(tokens)) {
			try {
				console.log(`Processing: ${userId}`);

				// Get access token
				const accessToken = await spotify.refreshAccessToken(
					tokenData.refreshToken,
					clientId,
					clientSecret
				);

				// Get user profile
				const userProfile = await spotify.getUserProfile(accessToken);
				if (!userProfile) {
					console.log(`Failed to get profile for ${userId}`);
					continue;
				}

				// Get recent tracks (only fetch tracks after last clear timestamp)
				const recentTracks = await spotify.getRecentlyPlayed(accessToken, lastClearTimestamp);
				const addedCount = processor.processRecentTracks(
					recentTracks,
					userProfile,
					history,
					lastClearTimestamp
				);
				totalNewTracks += addedCount;
				console.log(
					`Recent: ${recentTracks.length} fetched, ${addedCount} new (after: ${new Date(lastClearTimestamp).toISOString()})`
				);
			} catch (error) {
				console.error(`Error processing ${userId}:`, error.message);
			}
		}

		// Remove duplicates and sort
		const uniqueHistory = processor.removeDuplicates(history);
		console.log(`Removed ${history.length - uniqueHistory.length} duplicate entries`);

		const sortedHistory = processor.sortHistory(uniqueHistory);

		// Compare data
		const historyChanged = JSON.stringify(rawHistory) !== JSON.stringify(sortedHistory);

		// Only commit if there are changes
		if (historyChanged) {
			const { message: commitMsg, updatedCommits } = await getRandomCommitMessage(totalNewTracks, githubRepo, githubToken);
			await github.updateMultipleGitHubFiles(
				githubRepo,
				[
					{ path: 'history.json', content: sortedHistory },
					{ path: 'last-commits.json', content: updatedCommits }
				],
				commitMsg,
				githubToken
			);

			console.log(`✅ Update complete! Commit: ${commitMsg}`);
			console.log(`   - New tracks: ${totalNewTracks}`);
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
