import type { PageLoad } from './$types';
import { API_ENDPOINTS } from '$lib/config';
import type { NowPlayingBuddy, HistoryItem } from '$lib/types';

export const ssr = true;

export const load: PageLoad = async ({ fetch }) => {
  try {
    const [liveRes, historyRes, allHistoryRes] = await Promise.all([
      fetch(API_ENDPOINTS.LIVE, { cache: 'no-store' }),
      fetch(API_ENDPOINTS.HISTORY, { cache: 'no-store' }),
      fetch(API_ENDPOINTS.ALL_HISTORY, { cache: 'no-store' }),
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

    let allHistoryData: HistoryItem[] = [];
    if (allHistoryRes.ok) {
      const json = await allHistoryRes.json().catch(() => [] as HistoryItem[]);
      allHistoryData = Array.isArray(json) ? (json as HistoryItem[]) : [];
    }

    return {
      nowPlaying: (liveData as { friends?: NowPlayingBuddy[] })?.friends ?? [],
      history: historyData.sort((a, b) => b.timestamp - a.timestamp),
      allHistory: allHistoryData.sort((a, b) => b.timestamp - a.timestamp),
    };
  } catch {
    return {
      nowPlaying: [],
      history: [],
      allHistory: [],
    };
  }
};
