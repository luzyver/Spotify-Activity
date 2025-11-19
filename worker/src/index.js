import { handleScheduled } from './handlers/sync-handler.js';
import { handleLiveAPI, handleHistoryAPI, handleAllHistoryAPI } from './handlers/api-handler.js';
import { handleClearHistory } from './handlers/clear-handler.js';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function handleScheduledEvent(event, env, ctx) {
	// Determine which cron triggered
	const cronSchedule = event.cron;
	
	// 1 17 * * * = 00:01 GMT+7 (daily clear)
	if (cronSchedule === '1 17 * * *') {
		console.log('🗑️ Detected clear history cron trigger');
		ctx.waitUntil(handleClearHistory(env));
	} 
	// 0 * * * * = Every hour (sync)
	else {
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
		// Allow triggering sync from external UIs (frontend) with CORS-safe response
		const res = await handleScheduled(env);
		const body = await res.text();
		return new Response(body, {
			status: res.status,
			headers: {
				'Content-Type': 'text/plain',
				...CORS_HEADERS,
			},
		});
	}

	if (request.method === 'GET' && pathname === '/api/live') {
		return handleLiveAPI(env, CORS_HEADERS);
	}

	if (request.method === 'GET' && pathname === '/api/history') {
		return handleHistoryAPI(env, CORS_HEADERS);
	}

	if (request.method === 'GET' && pathname === '/api/all-history') {
		return handleAllHistoryAPI(env, CORS_HEADERS);
	}

	// Home/status endpoint (UI is served by the frontend app)
	if (request.method === 'GET' && pathname === '/') {
		return new Response(
			JSON.stringify({ status: 'ok', service: 'Rezz Spotify Worker' }),
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
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
