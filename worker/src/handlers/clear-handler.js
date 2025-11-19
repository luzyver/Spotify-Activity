import * as github from '../services/github.js';

export async function handleClearHistory(env) {
	console.log('🗑️ Starting history clear...');

	try {
		// Validate environment variables
		if (!env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not set');
		if (!env.GITHUB_REPO) throw new Error('GITHUB_REPO not set');

		const githubToken = env.GITHUB_TOKEN;
		const githubRepo = env.GITHUB_REPO;

		// Check if history.json exists
		const { content: currentHistory = [] } = await github.getGitHubFile(
			githubRepo,
			'history.json',
			githubToken
		);

		const itemsCount = currentHistory.length;
		console.log(`📊 Items before clear: ${itemsCount}`);

		// Clear history (empty array)
		const clearedHistory = [];

		// Update last-clear.json with current timestamp
		const timestamp = Date.now();
		const lastClearData = { lastClearTimestamp: timestamp };

		// Generate date tag (GMT+7)
		const date = new Date(timestamp);
		const gmt7Date = new Date(date.getTime() + (7 * 60 * 60 * 1000));
		const day = String(gmt7Date.getUTCDate()).padStart(2, '0');
		const month = String(gmt7Date.getUTCMonth() + 1).padStart(2, '0');
		const year = gmt7Date.getUTCFullYear();
		const dateTag = `${day}${month}${year}`;

		// Commit changes
		const commitMsg = `🗑️ [${dateTag}] Clear history (daily reset) [skip ci]`;
		await github.updateMultipleGitHubFiles(
			githubRepo,
			[
				{ path: 'history.json', content: clearedHistory },
				{ path: 'last-clear.json', content: lastClearData }
			],
			commitMsg,
			githubToken
		);

		console.log(`✅ History cleared! Items removed: ${itemsCount}`);
		console.log(`   Date tag: ${dateTag}`);
		console.log(`   Timestamp: ${timestamp} (${new Date(timestamp).toISOString()})`);

		return new Response(
			JSON.stringify({
				success: true,
				itemsRemoved: itemsCount,
				dateTag: dateTag,
				timestamp: timestamp
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	} catch (error) {
		console.error('❌ Error clearing history:', error);
		return new Response(
			JSON.stringify({ success: false, error: error.message }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
}
