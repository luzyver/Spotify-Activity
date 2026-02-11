import type { HistoryItem } from '$lib/types';
import { supabase, toHistoryItem, type HistoryRecord } from '$lib/supabase';

// Cache for loaded history
let historyCache: HistoryItem[] | null = null;
let totalCount: number = 0;

/**
 * Load history from Supabase with pagination
 */
export async function loadHistoryFromSupabase(options: {
  limit?: number;
  offset?: number;
  search?: string;
} = {}): Promise<{ data: HistoryItem[]; count: number }> {
  const { limit = 50, offset = 0, search } = options;

  let query = supabase
    .from('listening_history')
    .select('*', { count: 'exact' })
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`track.ilike.%${search}%,artist.ilike.%${search}%,user_name.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching history from Supabase:', error);
    return { data: [], count: 0 };
  }

  const items = (data || []).map((record: HistoryRecord) => toHistoryItem(record));
  return { data: items, count: count || 0 };
}

/**
 * Load all history from Supabase (with caching)
 */
export async function loadAllHistory(
  onProgress?: (loaded: number, total: number) => void
): Promise<HistoryItem[]> {
  if (historyCache) return historyCache;

  const PAGE_SIZE = 1000;
  let allItems: HistoryItem[] = [];
  let offset = 0;
  let hasMore = true;

  // Get total count first
  const { count } = await supabase
    .from('listening_history')
    .select('*', { count: 'exact', head: true });

  totalCount = count || 0;

  while (hasMore) {
    const { data, error } = await supabase
      .from('listening_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error('Error loading history:', error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      const items = data.map((record: HistoryRecord) => toHistoryItem(record));
      allItems.push(...items);
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
 * Load history in batches (for infinite scroll)
 */
export async function loadHistoryBatch(
  batchSize: number = 50,
  onBatchComplete?: (items: HistoryItem[], batchIndex: number) => void
): Promise<HistoryItem[]> {
  if (historyCache) return historyCache;

  const { data, count } = await loadHistoryFromSupabase({ limit: batchSize * 5 });
  totalCount = count;

  if (onBatchComplete) {
    onBatchComplete(data, 0);
  }

  historyCache = data;
  return data;
}

/**
 * Load more history (for pagination/infinite scroll)
 */
export async function loadMoreHistory(
  currentCount: number,
  batchSize: number = 50
): Promise<{ items: HistoryItem[]; hasMore: boolean }> {
  const { data, count } = await loadHistoryFromSupabase({
    limit: batchSize,
    offset: currentCount
  });

  return {
    items: data,
    hasMore: currentCount + data.length < count
  };
}

/**
 * Search history
 */
export async function searchHistory(
  query: string,
  limit: number = 50
): Promise<HistoryItem[]> {
  const { data } = await loadHistoryFromSupabase({ search: query, limit });
  return data;
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

// Legacy exports for backward compatibility
export function getAvailableHistoryFiles(): string[] {
  return []; // No longer using files
}

export function parseFilenameDate(filename: string): Date | null {
  return null; // No longer using files
}

export function getHistoryDateRange(): { start: Date; end: Date } | null {
  return null; // Use getDateRange with history items instead
}
