-- Supabase Schema for Spotify Listening History
-- Run this in Supabase SQL Editor: https://aoomudynybikamxpcpoa.supabase.co

-- Table: listening_history
CREATE TABLE IF NOT EXISTS listening_history (
  id BIGSERIAL PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  user_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  track TEXT NOT NULL,
  artist TEXT NOT NULL,
  uri TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicates
  UNIQUE(user_id, uri, timestamp)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_history_timestamp ON listening_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_history_user ON listening_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_artist ON listening_history(artist);
CREATE INDEX IF NOT EXISTS idx_history_track ON listening_history(track);

-- Enable Row Level Security (RLS)
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access"
  ON listening_history
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Allow insert from service role (worker)
CREATE POLICY "Allow service role insert"
  ON listening_history
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow anon insert (for migration script)
CREATE POLICY "Allow anon insert"
  ON listening_history
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Function: Get listening stats
CREATE OR REPLACE FUNCTION get_listening_stats()
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_plays', COUNT(*),
    'unique_tracks', COUNT(DISTINCT uri),
    'unique_artists', COUNT(DISTINCT artist),
    'first_play', MIN(timestamp),
    'last_play', MAX(timestamp)
  )
  FROM listening_history;
$$ LANGUAGE sql;

-- Function: Get top artists
CREATE OR REPLACE FUNCTION get_top_artists(limit_count INT DEFAULT 10)
RETURNS TABLE(artist TEXT, play_count BIGINT) AS $$
  SELECT artist, COUNT(*) as play_count
  FROM listening_history
  GROUP BY artist
  ORDER BY play_count DESC
  LIMIT limit_count;
$$ LANGUAGE sql;

-- Function: Get top tracks
CREATE OR REPLACE FUNCTION get_top_tracks(limit_count INT DEFAULT 10)
RETURNS TABLE(track TEXT, artist TEXT, play_count BIGINT) AS $$
  SELECT track, artist, COUNT(*) as play_count
  FROM listening_history
  GROUP BY track, artist
  ORDER BY play_count DESC
  LIMIT limit_count;
$$ LANGUAGE sql;
