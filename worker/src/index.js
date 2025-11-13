import { handleScheduled } from './handlers/sync-handler.js';
import { handleClearHistory, handleClearHistoryEndpoint } from './handlers/clear-handler.js';
import { handleLiveAPI, handleHistoryAPI } from './handlers/api-handler.js';
import { handleBackupEndpoint } from './handlers/backup-handler.js';
import { handleUpdateReadme } from './handlers/update-readme-handler.js';
import { getHomeHTML } from './handlers/home-html.js';
import { CORS_HEADERS, CRON_SCHEDULES } from './config/constants.js';

async function handleScheduledEvent(event, env, ctx) {
	const now = new Date();
	const hours = now.getUTCHours();
	const minutes = now.getUTCMinutes();

	if (hours === CRON_SCHEDULES.CLEAR_HISTORY_HOUR &&
	    minutes === CRON_SCHEDULES.CLEAR_HISTORY_MINUTE) {
		console.log('🗑️  Detected clear history cron trigger');
		ctx.waitUntil(handleClearHistory(env));
	} else {
		console.log('🎵 Detected sync cron trigger');
		ctx.waitUntil(handleScheduled(env));
	}
}

async function handleFetch(request, env, ctx) {
	const url = new URL(request.url);
	const pathname = url.pathname;

	if (request.method === 'OPTIONS') {
		return new Response(null, { headers: CORS_HEADERS });
	}

	if (request.method === 'GET' && pathname === '/trigger') {
		return handleScheduled(env);
	}

	if ((request.method === 'GET' || request.method === 'POST') && pathname === '/clear-history') {
		return handleClearHistoryEndpoint(request, env, CORS_HEADERS);
	}

	if ((request.method === 'GET' || request.method === 'POST') && pathname === '/backup') {
		return handleBackupEndpoint(request, env, CORS_HEADERS);
	}

	if ((request.method === 'GET' || request.method === 'POST') && pathname === '/update') {
		return handleUpdateReadme(env, CORS_HEADERS);
	}

	if (request.method === 'GET' && pathname === '/api/live') {
		return handleLiveAPI(env, CORS_HEADERS);
	}

	if (request.method === 'GET' && pathname === '/api/history') {
		return handleHistoryAPI(env, CORS_HEADERS);
	}

	// Home page with UI
	if (request.method === 'GET' && pathname === '/') {
		return new Response(getHomeHTML(), {
			headers: { 'Content-Type': 'text/html' },
		});
	}

	// 404 for unknown paths
	return new Response('Not Found', { status: 404 });
}

export default {
	async scheduled(event, env, ctx) {
		await handleScheduledEvent(event, env, ctx);
	},

	async fetch(request, env, ctx) {
		return handleFetch(request, env, ctx);
	},
};
