import { writable, derived } from 'svelte/store';
import type { HistoryItem } from '$lib/types';

export type SortOption = 'recent' | 'oldest' | 'artist' | 'track';
export type ViewMode = 'grid' | 'list' | 'compact';

export const searchQuery = writable('');
export const selectedArtist = writable<string | null>(null);
export const sortBy = writable<SortOption>('recent');
export const viewMode = writable<ViewMode>('grid');
export const dateRange = writable<{ start: Date | null; end: Date | null }>({
  start: null,
  end: null,
});

export function filterAndSortHistory(history: HistoryItem[]) {
  return derived(
    [searchQuery, selectedArtist, sortBy, dateRange],
    ([$searchQuery, $selectedArtist, $sortBy, $dateRange]) => {
      let filtered = [...history];

      // Search filter
      if ($searchQuery) {
        const query = $searchQuery.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.track.toLowerCase().includes(query) ||
            item.artist.toLowerCase().includes(query) ||
            item.user.toLowerCase().includes(query)
        );
      }

      // Artist filter
      if ($selectedArtist) {
        filtered = filtered.filter((item) => item.artist === $selectedArtist);
      }

      // Date range filter
      if ($dateRange.start || $dateRange.end) {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.timestamp);
          if ($dateRange.start && itemDate < $dateRange.start) return false;
          if ($dateRange.end && itemDate > $dateRange.end) return false;
          return true;
        });
      }

      // Sort
      filtered.sort((a, b) => {
        switch ($sortBy) {
          case 'recent':
            return b.timestamp - a.timestamp;
          case 'oldest':
            return a.timestamp - b.timestamp;
          case 'artist':
            return a.artist.localeCompare(b.artist);
          case 'track':
            return a.track.localeCompare(b.track);
          default:
            return 0;
        }
      });

      return filtered;
    }
  );
}
