export const TRACKED_USERS: Record<string, { name: string }> = {
  'spotify:user:31ilktz5fqv575vybtkzthcniyqu': {
    name: 'Rezz',
  },
};

export const ITEMS_PER_PAGE = 12;

export const WORKER_URL = 'https://worker-spotify.luzyver.dev';

// Use relative path in dev (Vite proxy) for client-side code, full URL in prod
export const WORKER_BASE = import.meta.env.DEV ? '' : WORKER_URL;

export const API_ENDPOINTS = {
  LIVE: `${WORKER_BASE}/api/live`,
  HISTORY: `${WORKER_BASE}/api/history`,
  HISTORY_ARCHIVE: `${WORKER_BASE}/api/history/archive`,
  TRIGGER: `${WORKER_BASE}/trigger`,
};
