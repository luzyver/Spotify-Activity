// Konfigurasi users yang akan di-track
export const TRACKED_USERS: Record<string, { name: string; initial: string; color: string }> = {
  'spotify:user:31ilktz5fqv575vybtkzthcniyqu': {
    name: 'Rezz',
    initial: 'R',
    color: '#1db954', // Spotify green
  },
  // Tambahkan user lain di sini:
  // "spotify:user:USER_ID_2": {
  // 	name: "Partner",
  // 	initial: "P",
  // 	color: "#e91e63" // Pink
  // },
};

// Pagination settings
export const ITEMS_PER_PAGE = 12; // 4 kolom x 3 baris

// API endpoints
export const API_ENDPOINTS = {
  LIVE: 'https://worker-spotify.luzyver.workers.dev/api/live',
  HISTORY: 'https://worker-spotify.luzyver.workers.dev/api/history',
};
