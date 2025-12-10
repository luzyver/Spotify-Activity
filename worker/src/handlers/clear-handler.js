import * as github from '../services/github.js';

const getGMT7Date = (offset = 0) => {
	const now = new Date();
	const gmt7 = new Date(now.getTime() + 7 * 60 * 60 * 1000 + offset * 24 * 60 * 60 * 1000);
	const dd = String(gmt7.getUTCDate()).padStart(2, '0');
	const mm = String(gmt7.getUTCMonth() + 1).padStart(2, '0');
	const yyyy = gmt7.getUTCFullYear();
	return `${dd}${mm}${yyyy}`;
};

export async function handleClearHistory(env) {
	console.log('🗑️ Starting history clear...');

	try {
		const { GITHUB_TOKEN, GITHUB_REPO } = env;
		if (!GITHUB_TOKEN || !GITHUB_REPO) throw new Error('Missing GitHub credentials');

		const { content: currentHistory = [] } = await github.getGitHubFile(GITHUB_REPO, 'history.json', GITHUB_TOKEN);
		const itemsCount = currentHistory.length;
		console.log(`📊 Items before clear: ${itemsCount}`);

		// Use yesterday's date for archive (clearing yesterday's history)
		const dateTag = getGMT7Date(-1);
		const archivePath = `frontend/static/history/${dateTag}.json`;

		// Use last track timestamp to prevent gaps
		const safeClearTimestamp = itemsCount > 0
			? Math.max(...currentHistory.map(t => t.timestamp))
			: Date.now();

		console.log(`🔒 Clear timestamp: ${new Date(safeClearTimestamp).toISOString()}`);

		const filesToUpdate = [
			{ path: 'history.json', content: [] },
			{ path: 'last-clear.json', content: { lastClearTimestamp: safeClearTimestamp } },
		];

		if (itemsCount > 0) {
			filesToUpdate.push({ path: archivePath, content: currentHistory });
		}

		await github.updateMultipleGitHubFiles(
			GITHUB_REPO,
			filesToUpdate,
			`🗑️ [${dateTag}] Clear history (daily reset)`,
			GITHUB_TOKEN
		);

		console.log(`✅ Cleared ${itemsCount} items, archived to ${archivePath}`);

		return new Response(
			JSON.stringify({
				success: true,
				itemsRemoved: itemsCount,
				dateTag,
				archivePath,
				timestamp: safeClearTimestamp,
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('❌ Clear error:', error);
		return new Response(
			JSON.stringify({ success: false, error: error.message }),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
}
