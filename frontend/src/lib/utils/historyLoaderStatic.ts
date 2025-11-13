import type { HistoryItem } from '$lib/types';

/**
 * Auto-detect and load all history files using Vite's import.meta.glob
 * This automatically finds all JSON files at build time
 */
export async function loadAllHistoryStatic(): Promise<HistoryItem[]> {
  const allHistory: HistoryItem[] = [];

  try {
    // Use Vite's import.meta.glob to auto-detect all JSON files
    // This is resolved at build time, so it knows exactly which files exist
    const historyFiles = import.meta.glob('/static/history/*.json');

    // Get list of file paths
    const filePaths = Object.keys(historyFiles).filter((path) => !path.includes('manifest.json'));

    // Load each file
    for (const path of filePaths) {
      try {
        // Extract filename from path: /static/history/12112025.json -> 12112025
        const filename = path.split('/').pop()?.replace('.json', '') || '';
        const url = `/history/${filename}.json`;

        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            allHistory.push(...data);
          }
        }
      } catch (error) {
        // Error loading file
      }
    }
  } catch (error) {
    // Fatal error
  }

  return allHistory;
}

/**
 * Get list of available history files
 */
export function getAvailableHistoryFiles(): string[] {
  const historyModules = import.meta.glob('/static/history/*.json');

  return Object.keys(historyModules)
    .filter((path) => !path.includes('manifest.json'))
    .map((path) => {
      // Extract filename without extension
      const filename = path.split('/').pop()?.replace('.json', '') || '';
      return filename;
    })
    .sort();
}

/**
 * Load specific history file
 */
export async function loadHistoryFile(filename: string): Promise<HistoryItem[]> {
  try {
    const response = await fetch(`/history/${filename}.json`);
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    // Failed to load file
  }
  return [];
}

/**
 * Parse date from filename (DDMMYYYY format)
 */
export function parseFilenameDate(filename: string): Date | null {
  try {
    // Format: DDMMYYYY
    const day = parseInt(filename.substring(0, 2), 10);
    const month = parseInt(filename.substring(2, 4), 10) - 1; // Month is 0-indexed
    const year = parseInt(filename.substring(4, 8), 10);

    const date = new Date(year, month, day);

    // Validate date
    if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
      return date;
    }
  } catch {
    // Invalid format
  }
  return null;
}

/**
 * Get date range from available files
 */
export function getHistoryDateRange(): { start: Date; end: Date } | null {
  const files = getAvailableHistoryFiles();

  if (files.length === 0) return null;

  const dates = files
    .map(parseFilenameDate)
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) return null;

  return {
    start: dates[0],
    end: dates[dates.length - 1],
  };
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

  history.forEach((item) => {
    const date = new Date(item.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(item);
  });

  return Array.from(grouped.entries())
    .map(([date, tracks]) => ({
      date,
      plays: tracks.length,
      tracks,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get date range from history
 */
export function getDateRange(history: HistoryItem[]): { start: Date; end: Date } | null {
  if (history.length === 0) return null;

  const timestamps = history.map((h) => h.timestamp);
  const start = new Date(Math.min(...timestamps));
  const end = new Date(Math.max(...timestamps));

  return { start, end };
}

/**
 * Get calendar data for heatmap (last N days)
 */
export function getCalendarData(history: HistoryItem[], days: number = 90): DailyHistory[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const dailyMap = new Map<string, HistoryItem[]>();

  // Initialize all dates with empty arrays
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    dailyMap.set(dateStr, []);
  }

  // Fill with actual data
  history.forEach((item) => {
    const itemDate = new Date(item.timestamp);
    if (itemDate >= startDate && itemDate <= endDate) {
      const dateStr = itemDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      if (dailyMap.has(dateStr)) {
        dailyMap.get(dateStr)!.push(item);
      }
    }
  });

  return Array.from(dailyMap.entries())
    .map(([date, tracks]) => ({
      date,
      plays: tracks.length,
      tracks,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get calendar data for a specific month
 */
export function getMonthCalendarData(
  history: HistoryItem[],
  year: number,
  month: number
): DailyHistory[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const dailyMap = new Map<string, HistoryItem[]>();

  // Initialize all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    dailyMap.set(dateStr, []);
  }

  // Fill with actual data
  history.forEach((item) => {
    const itemDate = new Date(item.timestamp);
    const dateStr = itemDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    if (dailyMap.has(dateStr)) {
      dailyMap.get(dateStr)!.push(item);
    }
  });

  return Array.from(dailyMap.entries())
    .map(([date, tracks]) => ({
      date,
      plays: tracks.length,
      tracks,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
