import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface HistoryRecord {
  id: number;
  timestamp: number;
  user_name: string;
  user_id: string;
  track: string;
  artist: string;
  uri: string;
  image_url: string | null;
  created_at: string;
}

// Fetch history with pagination
export async function fetchHistory(options: {
  limit?: number;
  offset?: number;
  search?: string;
  userId?: string;
} = {}) {
  const { limit = 50, offset = 0, search, userId } = options;

  let query = supabase
    .from('listening_history')
    .select('*', { count: 'exact' })
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`track.ilike.%${search}%,artist.ilike.%${search}%,user_name.ilike.%${search}%`);
  }

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching history:', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

// Fetch stats
export async function fetchStats() {
  const { data, error } = await supabase.rpc('get_listening_stats');

  if (error) {
    console.error('Error fetching stats:', error);
    return null;
  }

  return data;
}

// Fetch top artists
export async function fetchTopArtists(limit = 10) {
  const { data, error } = await supabase.rpc('get_top_artists', { limit_count: limit });

  if (error) {
    console.error('Error fetching top artists:', error);
    return [];
  }

  return data || [];
}

// Fetch top tracks
export async function fetchTopTracks(limit = 10) {
  const { data, error } = await supabase.rpc('get_top_tracks', { limit_count: limit });

  if (error) {
    console.error('Error fetching top tracks:', error);
    return [];
  }

  return data || [];
}

// Convert Supabase record to HistoryItem format
export function toHistoryItem(record: HistoryRecord) {
  return {
    timestamp: record.timestamp,
    user: record.user_name,
    userId: record.user_id,
    track: record.track,
    artist: record.artist,
    uri: record.uri,
    imageUrl: record.image_url
  };
}
