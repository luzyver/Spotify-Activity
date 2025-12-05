export const TRACKED_USERS: Record<string, { name: string }> = {
  'spotify:user:31ilktz5fqv575vybtkzthcniyqu': {
    name: 'Rezz',
  },
};

export const ITEMS_PER_PAGE = 12;

// Use relative path in dev to use Vite proxy, full URL in prod
export const WORKER_BASE = import.meta.env.DEV ? '' : 'https://worker-spotify.luzyver.dev';

export const API_ENDPOINTS = {
  LIVE: `${WORKER_BASE}/api/live`,
  HISTORY: `${WORKER_BASE}/api/history`,
  TRIGGER: `${WORKER_BASE}/trigger`,
};
