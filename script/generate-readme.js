import fs from 'fs';
import path from 'path';

const historyDir = 'frontend/static/history';
const files = fs.readdirSync(historyDir)
  .filter(f => f.endsWith('.json'))
  .map(f => {
    const content = JSON.parse(fs.readFileSync(path.join(historyDir, f), 'utf8'));
    const dateMatch = f.match(/^(\d{8})\.json$/);
    return {
      filename: f,
      date: dateMatch ? dateMatch[1] : '',
      count: content.length,
      data: content
    };
  });

const allData = files.flatMap(f => f.data);
const totalTracks = allData.length;
const uniqueTracks = new Set(allData.map(t => t.uri)).size;
const uniqueArtists = new Set(allData.map(t => t.artist)).size;

const artistCounts = {};
allData.forEach(t => {
  artistCounts[t.artist] = (artistCounts[t.artist] || 0) + 1;
});
const topArtists = Object.entries(artistCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

const trackCounts = {};
allData.forEach(t => {
  const key = t.track + ' - ' + t.artist;
  trackCounts[key] = (trackCounts[key] || 0) + 1;
});
const topTracks = Object.entries(trackCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

const timestamps = allData.map(t => t.timestamp).sort((a, b) => a - b);
const firstDate = timestamps.length > 0 
  ? new Date(timestamps[0]).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' 
    }) 
  : 'N/A';
const lastDate = timestamps.length > 0 
  ? new Date(timestamps[timestamps.length - 1]).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' 
    }) 
  : 'N/A';

let readme = '# 🎵 Rezz Spotify Listening History\n\n';
readme += '> Automated Spotify activity tracker with historical data archive\n\n';
readme += '## 📊 Overall Statistics\n\n';
readme += '| Metric | Value |\n';
readme += '|--------|-------|\n';
readme += '| **Total Plays** | ' + totalTracks.toLocaleString() + ' |\n';
readme += '| **Unique Tracks** | ' + uniqueTracks.toLocaleString() + ' |\n';
readme += '| **Unique Artists** | ' + uniqueArtists.toLocaleString() + ' |\n';
readme += '| **Period** | ' + firstDate + ' - ' + lastDate + ' |\n';
readme += '| **Archive Files** | ' + files.length + ' |\n\n';

readme += '## 🎤 Top 10 Artists (All Time)\n\n';
readme += '| Rank | Artist | Plays |\n';
readme += '|------|--------|-------|\n';
topArtists.forEach(([artist, count], i) => {
  readme += '| ' + (i + 1) + ' | ' + artist + ' | ' + count.toLocaleString() + ' |\n';
});

readme += '\n## 🎧 Top 10 Most Played Tracks (All Time)\n\n';
readme += '| Rank | Track | Plays |\n';
readme += '|------|-------|-------|\n';
topTracks.forEach(([track, count], i) => {
  readme += '| ' + (i + 1) + ' | ' + track + ' | ' + count.toLocaleString() + ' |\n';
});

readme += '\n## 📅 Daily Breakdown\n\n';
readme += '| Date | Plays | Top Artist | Top Track |\n';
readme += '|------|-------|------------|-----------|';

const sortedFiles = files.sort((a, b) => a.date.localeCompare(b.date));
sortedFiles.forEach(file => {
  const dateObj = new Date(
    parseInt(file.date.substring(4, 8)),
    parseInt(file.date.substring(2, 4)) - 1,
    parseInt(file.date.substring(0, 2))
  );
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Jakarta'
  });
  
  const dailyArtistCounts = {};
  const dailyTrackCounts = {};
  file.data.forEach(t => {
    dailyArtistCounts[t.artist] = (dailyArtistCounts[t.artist] || 0) + 1;
    const key = t.track + ' - ' + t.artist;
    dailyTrackCounts[key] = (dailyTrackCounts[key] || 0) + 1;
  });
  
  const topArtist = Object.entries(dailyArtistCounts).sort((a, b) => b[1] - a[1])[0];
  const topTrack = Object.entries(dailyTrackCounts).sort((a, b) => b[1] - a[1])[0];
  
  const artistText = topArtist ? topArtist[0] + ' (' + topArtist[1] + ')' : '-';
  const trackText = topTrack ? topTrack[0] + ' (' + topTrack[1] + ')' : '-';
  
  readme += '\n| ' + formattedDate + ' | ' + file.count + ' | ' + artistText + ' | ' + trackText + ' |';
});

readme += '\n\n---\n\n*This README is automatically generated from listening history data*\n';

fs.writeFileSync('README.md', readme);
console.log('README generated with', files.length, 'files and', totalTracks, 'total tracks');
