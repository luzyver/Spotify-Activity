import type { HistoryItem } from '$lib/types';

/** Timestamps may be in seconds or milliseconds */
export const toMs = (ts: number) => (ts < 1e12 ? ts * 1000 : ts);

export function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function addDays(t: number, days: number): number {
  const d = new Date(t);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export interface ArtistStat {
  name: string;
  count: number;
  imageUrl: string;
}

export interface TrackStat {
  track: string;
  artist: string;
  uri: string;
  imageUrl: string;
  count: number;
}

export interface DayCount {
  time: number;
  count: number;
}

export interface ListeningStats {
  today: number;
  yesterday: number;
  week: number;
  prevWeek: number;
  total: number;
  uniqueArtists: number;
  streak: number;
  daily: DayCount[];
  topArtists: ArtistStat[];
  topTrack: TrackStat | null;
  /** [day (Mon=0)][hour] play counts over the last 4 weeks */
  heatmap: number[][];
  heatmapMax: number;
  peakHour: number | null;
}

export function computeStats(items: HistoryItem[], now = Date.now()): ListeningStats {
  const today0 = startOfDay(now);
  const yesterday0 = addDays(today0, -1);
  const week0 = addDays(today0, -6);
  const prevWeek0 = addDays(today0, -13);
  const heat0 = addDays(today0, -27);

  const perDay = new Map<string, number>();
  const artists = new Set<string>();
  const artistWeek = new Map<string, ArtistStat>();
  const trackWeek = new Map<string, TrackStat>();
  const heatmap = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  const hours = Array<number>(24).fill(0);
  let today = 0;
  let yesterday = 0;
  let week = 0;
  let prevWeek = 0;

  for (const item of items) {
    const t = toMs(item.timestamp);
    const key = dayKey(t);
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
    if (item.artist) artists.add(item.artist.toLowerCase());

    if (t >= today0) today++;
    else if (t >= yesterday0) yesterday++;

    if (t >= week0) {
      week++;
      // items are newest first, so the first image seen is the latest one
      const a = artistWeek.get(item.artist) ?? { name: item.artist, count: 0, imageUrl: item.imageUrl };
      a.count++;
      artistWeek.set(item.artist, a);

      const tr = trackWeek.get(item.uri) ?? {
        track: item.track,
        artist: item.artist,
        uri: item.uri,
        imageUrl: item.imageUrl,
        count: 0,
      };
      tr.count++;
      trackWeek.set(item.uri, tr);
    } else if (t >= prevWeek0) {
      prevWeek++;
    }

    if (t >= heat0) {
      const d = new Date(t);
      heatmap[(d.getDay() + 6) % 7][d.getHours()]++;
      hours[d.getHours()]++;
    }
  }

  // Streak: consecutive days with plays, counting today if it already has plays
  let streak = 0;
  let cursor = perDay.has(dayKey(today0)) ? today0 : yesterday0;
  while (perDay.has(dayKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  const daily: DayCount[] = [];
  for (let i = 13; i >= 0; i--) {
    const time = addDays(today0, -i);
    daily.push({ time, count: perDay.get(dayKey(time)) ?? 0 });
  }

  const topArtists = [...artistWeek.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  const topTrack = [...trackWeek.values()].sort((a, b) => b.count - a.count)[0] ?? null;
  const heatmapMax = Math.max(0, ...heatmap.flat());
  const hourMax = Math.max(...hours);

  return {
    today,
    yesterday,
    week,
    prevWeek,
    total: items.length,
    uniqueArtists: artists.size,
    streak,
    daily,
    topArtists,
    topTrack,
    heatmap,
    heatmapMax,
    peakHour: hourMax > 0 ? hours.indexOf(hourMax) : null,
  };
}

export interface DayGroup {
  key: string;
  label: string;
  items: HistoryItem[];
}

const dateFormat = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
const dateFormatYear = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function dayLabel(t: number, now = Date.now()): string {
  const day0 = startOfDay(t);
  const today0 = startOfDay(now);
  if (day0 === today0) return 'Hari ini';
  if (day0 === addDays(today0, -1)) return 'Kemarin';
  return new Date(t).getFullYear() === new Date(now).getFullYear()
    ? dateFormat.format(t)
    : dateFormatYear.format(t);
}

/** Group newest-first items into consecutive day sections */
export function groupByDay(items: HistoryItem[], now = Date.now()): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const item of items) {
    const t = toMs(item.timestamp);
    const key = dayKey(t);
    const last = groups[groups.length - 1];
    if (last?.key === key) last.items.push(item);
    else groups.push({ key, label: dayLabel(t, now), items: [item] });
  }
  return groups;
}

const timeFormat = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' });

export const formatTime = (ts: number) => timeFormat.format(toMs(ts));

export const formatNumber = (n: number) => n.toLocaleString('id-ID');
