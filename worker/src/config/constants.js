/**
 * Configuration Constants
 * Central location for all configuration values
 */

/**
 * CORS headers for all API responses
 */
export const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Clear-Password, X-Backup-Password',
};

/**
 * Cron schedule times
 */
export const CRON_SCHEDULES = {
	// Clear history cron time (16:59 UTC = 23:59 GMT+7)
	CLEAR_HISTORY_HOUR: 16,
	CLEAR_HISTORY_MINUTE: 59,
};

/**
 * API response messages
 */
export const MESSAGES = {
	WORKER_INFO: `Spotify Activity Worker

Endpoints:
- GET /trigger - Manual trigger
- GET /clear-history - Clear history data
- GET /backup - Create backup file from clear commit
- GET /api/live - Get live activity
- GET /api/history - Get listening history`,
};
