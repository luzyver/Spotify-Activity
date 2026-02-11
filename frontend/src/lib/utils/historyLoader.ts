import type { HistoryItem } from '$lib/types';
import { API_ENDPOINTS } from '$lib/config';

// Cache for loaded history
let historyCache: HistoryItem[] | null = null;
let totalCount: number = 0;

/**
 * Load history from worker API with pagination
 */
export async function loadHistoryFromSupabase(options: {
  limit?: number;
  offset?: number;
  search?: string;
} = {}): Promise<{ data: HistoryItem[]; count: number }> {
  const { limit = 1000, offset = 0, search } = options;

  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  if (search) params.set('search', search);

  try {
    const res = await fetch(`${API_ENDPOINTS.HISTORY_ARCHIVE}?${params}`, { cache: 'no-store' });
    if (!res.ok) {
      console.error('Error fetching history archive:', res.status);
      return { data: [], count: 0 };
    }
    const json = await res.json();
    return { data: json.data ?? [], count: json.count ?? 0 };
  } catch (error) {
    console.error('Error fetching history archive:', error);
    return { data: [], count: 0 };
  }
}

/**
 * Load all history (with caching)
 */
export async function loadAllHistory(
  onProgress?: (loaded: number, total: number) => void
): Promise<HistoryItem[]> {
  if (historyCache) return historyCache;

  const PAGE_SIZE = 1000;
  let allItems: HistoryItem[] = [];
  let offset = 0;
  let hasMore = true;

  // Get first batch to know total count
  const first = await loadHistoryFromSupabase({ limit: PAGE_SIZE, offset: 0 });
  totalCount = first.count;
  allItems = first.data;
  offset = PAGE_SIZE;
  onProgress?.(allItems.length, totalCount);

  if (first.data.length < PAGE_SIZE) hasMore = false;

  while (hasMore) {
    const { data } = await loadHistoryFromSupabase({ limit: PAGE_SIZE, offset });

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allItems.push(...data);
      offset += PAGE_SIZE;
      onProgress?.(allItems.length, totalCount);

      if (data.length < PAGE_SIZE) {
        hasMore = false;
      }
    }
  }

  historyCache = allItems;
  return allItems;
}

/**
 * Get total count of history items
 */
export function getTotalCount(): number {
  return totalCount;
}

export interface DailyHistory {
  date: string;
  plays: number;
  tracks: HistoryItem[];
}

/**
 * Group history by date
 */
export function groupHistoryByDate(history: HistoryItem[]): DailyHistory[] {
  const grouped = new Map<string, HistoryItem[]>();

  for (const item of history) {
    const date = new Date(item.timestamp).toLocaleDateString('en-US');
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(item);
  }

  return Array.from(grouped.entries())
    .map(([date, tracks]) => ({ date, plays: tracks.length, tracks }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get date range from history items
 */
export function getDateRange(history: HistoryItem[]): { start: Date; end: Date } | null {
  if (!history.length) return null;
  const timestamps = history.map(h => h.timestamp);
  return { start: new Date(Math.min(...timestamps)), end: new Date(Math.max(...timestamps)) };
}

/**
 * Clear cache (useful for testing or force refresh)
 */
export function clearHistoryCache(): void {
  historyCache = null;
  totalCount = 0;
}
