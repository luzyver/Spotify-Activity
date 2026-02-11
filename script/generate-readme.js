#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

// Fetch all history from Supabase with pagination
async function fetchAllHistory() {
  const PAGE_SIZE = 1000;
  let allRecords = [];
  let offset = 0;
  let hasMore = true;

  console.log('📥 Fetching history from Supabase...');

  while (hasMore) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/listening_history?select=*&order=timestamp.desc&offset=${offset}&limit=${PAGE_SIZE}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allRecords.push(...data);
      offset += PAGE_SIZE;
      console.log(`  ✓ Fetched ${allRecords.length} records...`);

      if (data.length < PAGE_SIZE) {
        hasMore = false;
      }
    }
  }

  return allRecords;
}

// Helper functions
const formatDate = (timestamp, options = { year: 'numeric', month: 'long', day: 'numeric' }) =>
  new Date(timestamp).toLocaleDateString('en-US', { ...options, timeZone: 'Asia/Jakarta' });

const countBy = (arr, keyFn) => {
  const counts = {};
  for (const item of arr) {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
};

const topN = (counts, n = 10) =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);

const groupByDate = (records) => {
  const grouped = {};
  for (const record of records) {
    const date = new Date(record.timestamp).toLocaleDateString('en-GB', { timeZone: 'Asia/Jakarta' });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(record);
  }
  return grouped;
};

async function main() {
  try {
    const allTracks = await fetchAllHistory();

    if (allTracks.length === 0) {
      console.log('⚠️ No history found in Supabase');
      return;
    }

    console.log(`\n📊 Processing ${allTracks.length} tracks...`);

    // Calculate stats
    const stats = {
      total: allTracks.length,
      uniqueTracks: new Set(allTracks.map((t) => t.uri)).size,
      uniqueArtists: new Set(allTracks.map((t) => t.artist)).size,
    };

    const timestamps = allTracks.map((t) => t.timestamp).sort((a, b) => a - b);
    const period =
      timestamps.length > 0
        ? `${formatDate(timestamps[0])} - ${formatDate(timestamps[timestamps.length - 1])}`
        : 'N/A';

    const topArtists = topN(countBy(allTracks, (t) => t.artist));
    const topTracks = topN(countBy(allTracks, (t) => `${t.track} - ${t.artist}`));

    // Group by date for daily breakdown (all days, oldest first)
    const dailyData = groupByDate(allTracks);
    const sortedDates = Object.keys(dailyData).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/').map(Number);
      const [dayB, monthB, yearB] = b.split('/').map(Number);
      return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
    });

    // Generate markdown
    const table = (headers, rows) => {
      const header = `| ${headers.join(' | ')} |`;
      const separator = `|${headers.map(() => '------').join('|')}|`;
      const body = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
      return `${header}\n${separator}\n${body}`;
    };

    const readme = `# 🎵 Listening History

> Automated Spotify activity tracker with historical data archive

## 📊 Overall Statistics

${table(
  ['Metric', 'Value'],
  [
    ['**Total Plays**', stats.total.toLocaleString()],
    ['**Unique Tracks**', stats.uniqueTracks.toLocaleString()],
    ['**Unique Artists**', stats.uniqueArtists.toLocaleString()],
    ['**Period**', period],
    ['**Storage**', 'Supabase'],
  ]
)}

## 🎤 Top 10 Artists (All Time)

${table(
  ['Rank', 'Artist', 'Plays'],
  topArtists.map(([artist, count], i) => [(i + 1).toString(), artist, count.toLocaleString()])
)}

## 🎧 Top 10 Most Played Tracks (All Time)

${table(
  ['Rank', 'Track', 'Plays'],
  topTracks.map(([track, count], i) => [(i + 1).toString(), track, count.toLocaleString()])
)}

## 📅 Daily Breakdown

${table(
  ['Date', 'Plays', 'Top Artist', 'Top Track'],
  sortedDates.map((date) => {
    const tracks = dailyData[date];
    const artistCounts = countBy(tracks, (t) => t.artist);
    const trackCounts = countBy(tracks, (t) => `${t.track} - ${t.artist}`);
    const [topArtist] = topN(artistCounts, 1)[0] || ['-', 0];
    const [topTrack] = topN(trackCounts, 1)[0] || ['-', 0];
    const artistText = topArtist !== '-' ? `${topArtist} (${artistCounts[topArtist]})` : '-';
    const trackText = topTrack !== '-' ? `${topTrack} (${trackCounts[topTrack]})` : '-';

    return [
      date,
      tracks.length.toString(),
      artistText,
      trackText,
    ];
  })
)}

---

## 📖 Documentation

For setup guide, API docs, and project structure, see **[DOCS.md](./DOCS.md)**

---

*Stats above are automatically generated from Supabase listening history data*
`;

    const readmePath = path.join(__dirname, '..', 'README.md');
    fs.writeFileSync(readmePath, readme);
    console.log(`\n✅ README generated: ${stats.total.toLocaleString()} tracks from Supabase`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
