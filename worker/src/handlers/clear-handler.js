/**
 * Clear History Handler
 * Handles clearing history data
 */

import * as github from '../services/github.js';
import { getClearHistoryHTML } from './clear-history-html.js';

/**
 * Handle clearing history (scheduled or manual)
 * @param {Object} env - Environment variables
 * @returns {Promise<Response>} Response object
 */
export async function handleClearHistory(env) {
	console.log('🗑️  Clearing history (scheduled)...');

	try {
		// Validate environment variables
		if (!env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not set');
		if (!env.GITHUB_REPO) throw new Error('GITHUB_REPO not set');

		const githubToken = env.GITHUB_TOKEN;
		const githubRepo = env.GITHUB_REPO;

		// Check current history
		const { content: currentHistory } = await github.getGitHubFile(
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
		const clearTimestamp = Date.now();
		const lastClearData = { lastClearTimestamp: clearTimestamp };
		// Format date as ddmmyyyy (UTC)
		const now = new Date(clearTimestamp);
		const dd = String(now.getUTCDate()).padStart(2, '0');
		const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
		const yyyy = now.getUTCFullYear();
		const dateTag = `${dd}${mm}${yyyy}`;
		const commitMsg = `🗑️ [${dateTag}] Clear history (daily reset) [skip ci]`;

		await github.updateMultipleGitHubFiles(
			githubRepo,
			[
				{ path: 'history.json', content: emptyHistory },
				{ path: 'last-clear.json', content: lastClearData }
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

/**
 * Handle clear history endpoint with authentication
 * @param {Request} request - Request object
 * @param {Object} env - Environment variables
 * @param {Headers} corsHeaders - CORS headers
 * @returns {Promise<Response>} Response object
 */
export async function handleClearHistoryEndpoint(request, env, corsHeaders) {
	try {
		console.log('🗑️  Clearing history request received...');

		// Validate environment variables
		if (!env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not set');
		if (!env.GITHUB_REPO) throw new Error('GITHUB_REPO not set');
		if (!env.CLEAR_HISTORY_PASSWORD) throw new Error('CLEAR_HISTORY_PASSWORD not configured');

		const url = new URL(request.url);

		// Check password authentication
		const providedPassword = url.searchParams.get('password') ||
			request.headers.get('X-Clear-Password') ||
			request.headers.get('Authorization')?.replace('Bearer ', '');

		if (!providedPassword) {
			console.log('❌ No password provided');

			// If accessed from browser (GET without password), show HTML form
			if (request.method === 'GET' && request.headers.get('Accept')?.includes('text/html')) {
				return new Response(getClearHistoryHTML(), {
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
		const { content: currentHistory } = await github.getGitHubFile(
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
		const clearTimestamp = Date.now();
		const lastClearData = { lastClearTimestamp: clearTimestamp };
		// Format date as ddmmyyyy (UTC)
		const now = new Date(clearTimestamp);
		const dd = String(now.getUTCDate()).padStart(2, '0');
		const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
		const yyyy = now.getUTCFullYear();
		const dateTag = `${dd}${mm}${yyyy}`;
		const commitMsg = `🗑️ [${dateTag}] Clear history (daily reset) [skip ci]`;

		await github.updateMultipleGitHubFiles(
			githubRepo,
			[
				{ path: 'history.json', content: emptyHistory },
				{ path: 'last-clear.json', content: lastClearData }
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
