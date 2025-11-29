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

		// Generate date tag (GMT+7) - use yesterday's date since we're clearing yesterday's history
		const currentTime = Date.now();
		const date = new Date(currentTime);
		const gmt7Date = new Date(date.getTime() + (7 * 60 * 60 * 1000));
		// Subtract 1 day to get yesterday
		const yesterdayGmt7 = new Date(gmt7Date.getTime() - (24 * 60 * 60 * 1000));
		const day = String(yesterdayGmt7.getUTCDate()).padStart(2, '0');
		const month = String(yesterdayGmt7.getUTCMonth() + 1).padStart(2, '0');
		const year = yesterdayGmt7.getUTCFullYear();
		const dateTag = `${day}${month}${year}`;

		// Archive current history to frontend/static/history/{DATE}.json
		const archivePath = `frontend/static/history/${dateTag}.json`;
		console.log(`📦 Archiving history to ${archivePath}...`);

		// Clear history (empty array)
		const clearedHistory = [];

		// CRITICAL FIX: Use timestamp of last track instead of Date.now()
		// This prevents "missing minute" gap where tracks played between
		// last sync and clear would be lost forever
		let safeClearTimestamp;
		if (currentHistory.length > 0) {
			// Find the most recent track timestamp (assuming sorted desc or unsorted)
			const timestamps = currentHistory.map(track => track.timestamp);
			safeClearTimestamp = Math.max(...timestamps);
			console.log(`🔒 Using last track timestamp: ${safeClearTimestamp} (${new Date(safeClearTimestamp).toISOString()})`);
		} else {
			// Fallback to current time if history is empty
			safeClearTimestamp = Date.now();
			console.log(`⚠️  History empty, using current timestamp: ${safeClearTimestamp}`);
		}
		
		const lastClearData = { lastClearTimestamp: safeClearTimestamp };

		// Commit changes (archive + clear + update last-clear)
		const commitMsg = `🗑️ [${dateTag}] Clear history (daily reset) [skip ci]`;
		const filesToUpdate = [
			{ path: 'history.json', content: clearedHistory },
			{ path: 'last-clear.json', content: lastClearData }
		];

		// Only archive if there's history to archive
		if (itemsCount > 0) {
			filesToUpdate.push({ path: archivePath, content: currentHistory });
		}

		await github.updateMultipleGitHubFiles(
			githubRepo,
			filesToUpdate,
			commitMsg,
			githubToken
		);

		console.log(`✅ History cleared! Items removed: ${itemsCount}`);
		console.log(`   Date tag: ${dateTag}`);
		console.log(`   Archive path: ${archivePath}`);
		console.log(`   Clear timestamp: ${safeClearTimestamp} (${new Date(safeClearTimestamp).toISOString()})`);

		return new Response(
			JSON.stringify({
				success: true,
				itemsRemoved: itemsCount,
				dateTag: dateTag,
				archivePath: archivePath,
				timestamp: safeClearTimestamp
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
