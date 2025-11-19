export const TRACKED_USERS: Record<string, { name: string }> = {
  'spotify:user:31ilktz5fqv575vybtkzthcniyqu': {
    name: 'Rezz',
  },
};

export const ITEMS_PER_PAGE = 12;

export const WORKER_BASE = 'https://worker-spotify.luzyver.dev';

export const API_ENDPOINTS = {
  LIVE: `${WORKER_BASE}/api/live`,
  HISTORY: `${WORKER_BASE}/api/history`,
  ALL_HISTORY: `${WORKER_BASE}/api/all-history`,
  TRIGGER: `${WORKER_BASE}/trigger`,
};
