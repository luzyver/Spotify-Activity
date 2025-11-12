/**
 * Cloudflare Worker for Spotify Activity Tracker
 * Main entry point - routes requests to appropriate handlers
 */

import { handleScheduled } from './handlers/sync-handler.js';
import { handleClearHistory, handleClearHistoryEndpoint } from './handlers/clear-handler.js';
import { handleLiveAPI, handleHistoryAPI } from './handlers/api-handler.js';
import { handleBackupEndpoint } from './handlers/backup-handler.js';
import { CORS_HEADERS, CRON_SCHEDULES, MESSAGES } from './config/constants.js';

/**
 * Handle scheduled cron triggers
 * @param {ScheduledEvent} event - Scheduled event
 * @param {Object} env - Environment variables
 * @param {ExecutionContext} ctx - Execution context
 */
async function handleScheduledEvent(event, env, ctx) {
	// Get current time in UTC
	const now = new Date();
	const hours = now.getUTCHours();
	const minutes = now.getUTCMinutes();

	// Check if this is the clear history cron (16:59 UTC = 23:59 GMT+7)
	if (hours === CRON_SCHEDULES.CLEAR_HISTORY_HOUR &&
	    minutes === CRON_SCHEDULES.CLEAR_HISTORY_MINUTE) {
		console.log('🗑️  Detected clear history cron trigger');
		ctx.waitUntil(handleClearHistory(env));
	} else {
		console.log('🎵 Detected sync cron trigger');
		ctx.waitUntil(handleScheduled(env));
	}
}

/**
 * Handle HTTP requests
 * @param {Request} request - Request object
 * @param {Object} env - Environment variables
 * @param {ExecutionContext} ctx - Execution context
 * @returns {Promise<Response>} Response object
 */
async function handleFetch(request, env, ctx) {
	const url = new URL(request.url);
	const pathname = url.pathname;

	// Handle OPTIONS for CORS preflight
	if (request.method === 'OPTIONS') {
		return new Response(null, { headers: CORS_HEADERS });
	}

	// Manual trigger endpoint
	if (request.method === 'GET' && pathname === '/trigger') {
		return handleScheduled(env);
	}

	// Clear history endpoint
	if ((request.method === 'GET' || request.method === 'POST') && pathname === '/clear-history') {
		return handleClearHistoryEndpoint(request, env, CORS_HEADERS);
	}

	// Backup endpoint
	if ((request.method === 'GET' || request.method === 'POST') && pathname === '/backup') {
		return handleBackupEndpoint(request, env, CORS_HEADERS);
	}

	// API endpoint to get live.json with no caching
	if (request.method === 'GET' && pathname === '/api/live') {
		return handleLiveAPI(env, CORS_HEADERS);
	}

	// API endpoint to get history.json with no caching
	if (request.method === 'GET' && pathname === '/api/history') {
		return handleHistoryAPI(env, CORS_HEADERS);
	}

	// Default response - show available endpoints
	return new Response(MESSAGES.WORKER_INFO, {
		headers: { 'Content-Type': 'text/plain' },
	});
}

/**
 * Export Cloudflare Worker handlers
 */
export default {
	/**
	 * Scheduled event handler (cron trigger)
	 */
	async scheduled(event, env, ctx) {
		await handleScheduledEvent(event, env, ctx);
	},

	/**
	 * HTTP request handler
	 */
	async fetch(request, env, ctx) {
		return handleFetch(request, env, ctx);
	},
};
