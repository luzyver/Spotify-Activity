#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const HISTORY_DIR = 'frontend/static/history';

// Helper functions
const readJson = (filepath) => JSON.parse(fs.readFileSync(filepath, 'utf8'));

const formatDate = (dateStr, options = { year: 'numeric', month: 'long', day: 'numeric' }) =>
  new Date(
    parseInt(dateStr.substring(4, 8)),
    parseInt(dateStr.substring(2, 4)) - 1,
    parseInt(dateStr.substring(0, 2))
  ).toLocaleDateString('en-US', { ...options, timeZone: 'Asia/Jakarta' });

const sortByDate = (a, b) => {
  const toSortable = (d) => d.substring(4, 8) + d.substring(2, 4) + d.substring(0, 2);
  return toSortable(a.date).localeCompare(toSortable(b.date));
};

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

// Load all history files
const files = fs
  .readdirSync(HISTORY_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => {
    const data = readJson(path.join(HISTORY_DIR, f));
    const date = f.replace('.json', '');
    return { filename: f, date, count: data.length, data };
  })
  .sort(sortByDate);

const allTracks = files.flatMap((f) => f.data);

// Calculate stats
const stats = {
  total: allTracks.length,
  uniqueTracks: new Set(allTracks.map((t) => t.uri)).size,
  uniqueArtists: new Set(allTracks.map((t) => t.artist)).size,
  files: files.length,
};

const timestamps = allTracks.map((t) => t.timestamp).sort((a, b) => a - b);
const period =
  timestamps.length > 0
    ? `${formatDate(files[0].date)} - ${formatDate(files[files.length - 1].date)}`
    : 'N/A';

const topArtists = topN(countBy(allTracks, (t) => t.artist));
const topTracks = topN(countBy(allTracks, (t) => `${t.track} - ${t.artist}`));

// Generate markdown
const table = (headers, rows) => {
  const header = `| ${headers.join(' | ')} |`;
  const separator = `|${headers.map(() => '------').join('|')}|`;
  const body = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
  return `${header}\n${separator}\n${body}`;
};

const readme = `# 🎵 Rezz Spotify Listening History

> Automated Spotify activity tracker with historical data archive

## 📊 Overall Statistics

${table(
  ['Metric', 'Value'],
  [
    ['**Total Plays**', stats.total.toLocaleString()],
    ['**Unique Tracks**', stats.uniqueTracks.toLocaleString()],
    ['**Unique Artists**', stats.uniqueArtists.toLocaleString()],
    ['**Period**', period],
    ['**Archive Files**', stats.files.toString()],
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
  files.map((file) => {
    const artistCounts = countBy(file.data, (t) => t.artist);
    const trackCounts = countBy(file.data, (t) => `${t.track} - ${t.artist}`);
    const [topArtist] = topN(artistCounts, 1)[0] || ['-', 0];
    const [topTrack] = topN(trackCounts, 1)[0] || ['-', 0];
    const artistText = topArtist !== '-' ? `${topArtist} (${artistCounts[topArtist]})` : '-';
    const trackText = topTrack !== '-' ? `${topTrack} (${trackCounts[topTrack]})` : '-';

    return [
      formatDate(file.date, { year: 'numeric', month: 'short', day: 'numeric' }),
      file.count.toString(),
      artistText,
      trackText,
    ];
  })
)}

---

*This README is automatically generated from listening history data*
`;

fs.writeFileSync('README.md', readme);
console.log(`✓ README generated: ${stats.files} files, ${stats.total.toLocaleString()} tracks`);
