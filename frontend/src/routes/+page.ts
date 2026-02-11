import type { PageLoad } from './$types';
import { WORKER_URL } from '$lib/config';
import type { NowPlayingBuddy, HistoryItem } from '$lib/types';

export const ssr = true;

export const load: PageLoad = async ({ fetch }) => {
  try {
    // Always use absolute worker URL — SSR runs server-side where Vite proxy doesn't exist
    const [liveRes, historyRes] = await Promise.all([
      fetch(`${WORKER_URL}/api/live`, { cache: 'no-store' }),
      fetch(`${WORKER_URL}/api/history`, { cache: 'no-store' }),
    ]);

    let liveData: unknown = {};
    if (liveRes.ok) {
      liveData = await liveRes.json().catch(() => ({}));
    }

    let historyData: HistoryItem[] = [];
    if (historyRes.ok) {
      const json = await historyRes.json().catch(() => [] as HistoryItem[]);
      historyData = Array.isArray(json) ? (json as HistoryItem[]) : [];
    }

    return {
      nowPlaying: (liveData as { friends?: NowPlayingBuddy[] })?.friends ?? [],
      history: historyData.sort((a, b) => b.timestamp - a.timestamp),
      // Use history data for both - archive will be loaded lazily later
      allHistory: historyData.sort((a, b) => b.timestamp - a.timestamp),
    };
  } catch {
    return {
      nowPlaying: [],
      history: [],
      allHistory: [],
    };
  }
};
