import type { PageLoad } from './$types';
import { API_ENDPOINTS } from '$lib/config';
import type { NowPlayingBuddy, HistoryItem } from '$lib/types';

export const ssr = true;

export const load: PageLoad = async ({ fetch }) => {
  try {
    const [liveRes, historyRes] = await Promise.all([
      fetch(API_ENDPOINTS.LIVE, { cache: 'no-store' }),
      fetch(API_ENDPOINTS.HISTORY, { cache: 'no-store' })
    ]);

    const liveData = await liveRes.json().catch(() => ({}));
    const historyData: HistoryItem[] = await historyRes.json().catch(() => []);

    const nowPlaying: NowPlayingBuddy[] = (liveData?.friends as NowPlayingBuddy[]) ?? [];
    const history = (historyData ?? []).slice().sort((a, b) => b.timestamp - a.timestamp);

    return {
      nowPlaying,
      history
    };
  } catch (e) {
    return {
      nowPlaying: [] as NowPlayingBuddy[],
      history: [] as HistoryItem[]
    };
  }
};

