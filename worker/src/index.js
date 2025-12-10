import { handleScheduled } from './handlers/sync-handler.js';
import { handleLiveAPI, handleHistoryAPI } from './handlers/api-handler.js';
import { handleClearHistory } from './handlers/clear-handler.js';

const ALLOWED_ORIGINS = ['https://spotify.luzyver.dev'];

const getCorsHeaders = (origin) => ({
	'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

const jsonResponse = (data, status = 200, headers = {}) =>
	new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', ...headers },
	});

export default {
	async scheduled(event, env, ctx) {
		const isClearCron = event.cron === '1 17 * * *';
		console.log(isClearCron ? '🗑️ Clear history cron' : '🎵 Sync cron');
		ctx.waitUntil(isClearCron ? handleClearHistory(env) : handleScheduled(env));
	},

	async fetch(request, env) {
		const { pathname } = new URL(request.url);
		const origin = request.headers.get('Origin') || '';
		const cors = getCorsHeaders(origin);

		// CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: cors });
		}

		// Routes
		if (request.method === 'GET') {
			switch (pathname) {
				case '/':
					return jsonResponse({ status: 'ok', service: 'Rezz Spotify Worker' });

				case '/trigger': {
					const res = await handleScheduled(env);
					return new Response(await res.text(), {
						status: res.status,
						headers: { 'Content-Type': 'text/plain', ...cors },
					});
				}

				case '/api/live':
					return handleLiveAPI(env, cors);

				case '/api/history':
					return handleHistoryAPI(env, cors);
			}
		}

		return new Response('Not Found', { status: 404 });
	},
};
