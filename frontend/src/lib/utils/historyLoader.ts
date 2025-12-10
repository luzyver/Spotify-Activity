import type { HistoryItem } from '$lib/types';

// Cache for loaded history
let historyCache: HistoryItem[] | null = null;
let fileListCache: string[] | null = null;

/**
 * Get list of available history files (cached)
 */
export function getAvailableHistoryFiles(): string[] {
  if (fileListCache) return fileListCache;
  
  const historyModules = import.meta.glob('/static/history/*.json');
  fileListCache = Object.keys(historyModules)
    .map(path => path.split('/').pop()?.replace('.json', '') || '')
    .filter(Boolean)
    .sort();
  
  return fileListCache;
}

/**
 * Load all history with optional progress callback
 */
export async function loadAllHistory(
  onProgress?: (loaded: number, total: number) => void
): Promise<HistoryItem[]> {
  if (historyCache) return historyCache;
  
  const files = getAvailableHistoryFiles();
  const total = files.length;
  const allHistory: HistoryItem[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const response = await fetch(`/history/${files[i]}.json`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) allHistory.push(...data);
      }
    } catch { /* skip failed */ }
    
    onProgress?.(i + 1, total);
  }

  historyCache = allHistory;
  return allHistory;
}

/**
 * Load history in batches for better performance
 */
export async function loadHistoryBatch(
  batchSize: number = 5,
  onBatchComplete?: (items: HistoryItem[], batchIndex: number) => void
): Promise<HistoryItem[]> {
  if (historyCache) return historyCache;
  
  const files = getAvailableHistoryFiles();
  const allHistory: HistoryItem[] = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (filename) => {
        try {
          const res = await fetch(`/history/${filename}.json`);
          if (!res.ok) return [];
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        } catch {
          return [];
        }
      })
    );

    const batchItems = results.flat();
    allHistory.push(...batchItems);
    onBatchComplete?.(batchItems, Math.floor(i / batchSize));
  }

  historyCache = allHistory;
  return allHistory;
}

/**
 * Load specific history file
 */
export async function loadHistoryFile(filename: string): Promise<HistoryItem[]> {
  try {
    const res = await fetch(`/history/${filename}.json`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch { /* ignore */ }
  return [];
}

/**
 * Parse date from filename (DDMMYYYY format)
 */
export function parseFilenameDate(filename: string): Date | null {
  if (filename.length !== 8) return null;
  
  const day = parseInt(filename.substring(0, 2), 10);
  const month = parseInt(filename.substring(2, 4), 10) - 1;
  const year = parseInt(filename.substring(4, 8), 10);

  const date = new Date(year, month, day);
  if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
    return date;
  }
  return null;
}

/**
 * Get date range from available files
 */
export function getHistoryDateRange(): { start: Date; end: Date } | null {
  const files = getAvailableHistoryFiles();
  if (!files.length) return null;

  const dates = files
    .map(parseFilenameDate)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (!dates.length) return null;
  return { start: dates[0], end: dates[dates.length - 1] };
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
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
 * Get calendar data for heatmap
 */
export function getCalendarData(history: HistoryItem[], days: number = 90): DailyHistory[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const dailyMap = new Map<string, HistoryItem[]>();

  // Initialize dates
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dailyMap.set(d.toLocaleDateString('en-US'), []);
  }

  // Fill data
  for (const item of history) {
    const itemDate = new Date(item.timestamp);
    if (itemDate >= startDate && itemDate <= endDate) {
      const key = itemDate.toLocaleDateString('en-US');
      dailyMap.get(key)?.push(item);
    }
  }

  return Array.from(dailyMap.entries())
    .map(([date, tracks]) => ({ date, plays: tracks.length, tracks }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get calendar data for specific month
 */
export function getMonthCalendarData(
  history: HistoryItem[],
  year: number,
  month: number
): DailyHistory[] {
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const dailyMap = new Map<string, HistoryItem[]>();

  // Initialize month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    dailyMap.set(date.toLocaleDateString('en-US'), []);
  }

  // Fill data
  for (const item of history) {
    const itemDate = new Date(item.timestamp);
    const key = itemDate.toLocaleDateString('en-US');
    dailyMap.get(key)?.push(item);
  }

  return Array.from(dailyMap.entries())
    .map(([date, tracks]) => ({ date, plays: tracks.length, tracks }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Clear cache (useful for testing or force refresh)
 */
export function clearHistoryCache(): void {
  historyCache = null;
  fileListCache = null;
}
