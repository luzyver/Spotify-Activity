import * as github from '../services/github.js';

/**
 * Generate README content with history data summary per date
 */
function generateReadmeContent(historyFiles, allHistoryData) {
	// Calculate overall statistics
	const totalTracks = allHistoryData.length;
	const uniqueTracks = new Set(allHistoryData.map(t => t.uri)).size;
	const uniqueArtists = new Set(allHistoryData.map(t => t.artist)).size;
	
	// Count tracks per artist (overall)
	const artistCounts = {};
	allHistoryData.forEach(track => {
		artistCounts[track.artist] = (artistCounts[track.artist] || 0) + 1;
	});
	
	// Top 10 artists (overall)
	const topArtists = Object.entries(artistCounts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10);
	
	// Count tracks per song (overall)
	const trackCounts = {};
	allHistoryData.forEach(track => {
		const key = `${track.track} - ${track.artist}`;
		trackCounts[key] = (trackCounts[key] || 0) + 1;
	});
	
	// Top 10 most played tracks (overall)
	const topTracks = Object.entries(trackCounts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10);
	
	// Date range (GMT+7)
	const timestamps = allHistoryData.map(t => t.timestamp).sort((a, b) => a - b);
	const firstDate = timestamps.length > 0 ? new Date(timestamps[0]).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' }) : 'N/A';
	const lastDate = timestamps.length > 0 ? new Date(timestamps[timestamps.length - 1]).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' }) : 'N/A';
	
	let readme = `# 🎵 Rezz Spotify Listening History

> Automated Spotify activity tracker with historical data archive

## 📊 Overall Statistics

| Metric | Value |
|--------|-------|
| **Total Plays** | ${totalTracks.toLocaleString()} |
| **Unique Tracks** | ${uniqueTracks.toLocaleString()} |
| **Unique Artists** | ${uniqueArtists.toLocaleString()} |
| **Period** | ${firstDate} - ${lastDate} |
| **Archive Files** | ${historyFiles.length} |

## 🎤 Top 10 Artists (All Time)

| Rank | Artist | Plays |
|------|--------|-------|
`;

	topArtists.forEach(([artist, count], index) => {
		readme += `| ${index + 1} | ${artist} | ${count.toLocaleString()} |\n`;
	});

	readme += `\n## 🎧 Top 10 Most Played Tracks (All Time)

| Rank | Track | Plays |
|------|-------|-------|
`;

	topTracks.forEach(([track, count], index) => {
		readme += `| ${index + 1} | ${track} | ${count.toLocaleString()} |\n`;
	});

	readme += `\n## 📅 Daily Breakdown

| Date | Plays | Top Artist | Top Track |
|------|-------|------------|-----------|
`;

	if (historyFiles && historyFiles.length > 0) {
		const sortedFiles = [...historyFiles].sort((a, b) => b.date.localeCompare(a.date));
		
		sortedFiles.forEach(file => {
			const dateObj = new Date(
				parseInt(file.date.substring(4, 8)), // year
				parseInt(file.date.substring(2, 4)) - 1, // month (0-indexed)
				parseInt(file.date.substring(0, 2)) // day
			);
			const formattedDate = dateObj.toLocaleDateString('en-US', { 
				year: 'numeric', 
				month: 'short', 
				day: 'numeric',
				timeZone: 'Asia/Jakarta'
			});
			
			// Calculate stats for this specific date
			const dailyArtistCounts = {};
			const dailyTrackCounts = {};
			
			file.data.forEach(track => {
				dailyArtistCounts[track.artist] = (dailyArtistCounts[track.artist] || 0) + 1;
				const trackKey = `${track.track} - ${track.artist}`;
				dailyTrackCounts[trackKey] = (dailyTrackCounts[trackKey] || 0) + 1;
			});
			
			const topDailyArtist = Object.entries(dailyArtistCounts)
				.sort((a, b) => b[1] - a[1])[0];
			
			const topDailyTrack = Object.entries(dailyTrackCounts)
				.sort((a, b) => b[1] - a[1])[0];
			
			const artistText = topDailyArtist ? `${topDailyArtist[0]} (${topDailyArtist[1]})` : '-';
			const trackText = topDailyTrack ? `${topDailyTrack[0]} (${topDailyTrack[1]})` : '-';
			
			readme += `| ${formattedDate} | ${file.count} | ${artistText} | ${trackText} |\n`;
		});
	}

	readme += `---

*This README is automatically generated from listening history data*
`;

	return readme;
}

/**
 * Scan history directory and get all history files with their data
 */
async function getHistoryFiles(repo, token) {
	const historyPath = 'frontend/static/history';
	
	try {
		const url = `https://api.github.com/repos/${repo}/contents/${historyPath}`;
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'User-Agent': 'Rezz-Spotify-Worker/1.0',
			},
		});

		if (!response.ok) {
			console.error(`Failed to get history directory: ${response.status}`);
			return { files: [], allData: [] };
		}

		const files = await response.json();
		const historyFiles = [];
		const allHistoryData = [];

		for (const file of files) {
			if (file.type === 'file' && file.name.endsWith('.json')) {
				// Get file content to count tracks
				try {
					const { content } = await github.getGitHubFile(repo, file.path, token);
					const trackCount = Array.isArray(content) ? content.length : 0;
					
					// Extract date from filename (ddmmyyyy.json)
					const dateMatch = file.name.match(/^(\d{8})\.json$/);
					if (dateMatch) {
						historyFiles.push({
							filename: file.name,
							date: dateMatch[1],
							count: trackCount,
							path: file.path,
							data: content || [] // Store the actual data for per-day stats
						});
						
						// Add all tracks to combined data
						if (Array.isArray(content)) {
							allHistoryData.push(...content);
						}
					}
				} catch (error) {
					console.error(`Error reading ${file.name}:`, error);
				}
			}
		}

		return { files: historyFiles, allData: allHistoryData };
	} catch (error) {
		console.error('Error scanning history directory:', error);
		return { files: [], allData: [] };
	}
}

/**
 * Handle /update endpoint
 */
export async function handleUpdateReadme(env, corsHeaders) {
	try {
		// Validate env
		if (!env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not set');
		if (!env.GITHUB_REPO) throw new Error('GITHUB_REPO not set');

		const githubToken = env.GITHUB_TOKEN;
		const githubRepo = env.GITHUB_REPO;

		console.log('📝 Starting README update...');

		// Get all history files and data
		const { files: historyFiles, allData: allHistoryData } = await getHistoryFiles(githubRepo, githubToken);
		console.log(`Found ${historyFiles.length} history files with ${allHistoryData.length} total tracks`);

		// Generate new README content
		const newReadmeContent = generateReadmeContent(historyFiles, allHistoryData);

		// Get current README
		const readmePath = 'README.md';
		let existingSha = null;
		let existingContent = null;
		try {
			const response = await fetch(
				`https://api.github.com/repos/${githubRepo}/contents/${readmePath}`,
				{
					headers: {
						Authorization: `Bearer ${githubToken}`,
						Accept: 'application/vnd.github.v3+json',
						'User-Agent': 'Rezz-Spotify-Worker/1.0',
					},
				}
			);
			if (response.ok) {
				const data = await response.json();
				existingSha = data.sha;
				// Decode existing content
				existingContent = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
			}
		} catch (error) {
			console.log('README not found, will create new');
		}

		// Check if content has changed
		if (existingContent && existingContent === newReadmeContent) {
			console.log('ℹ️  README content unchanged, skipping commit');
			return new Response(
				JSON.stringify({
					success: true,
					message: 'README unchanged, no commit needed',
					historyFiles: historyFiles.length,
					skipped: true,
				}),
				{ 
					status: 200, 
					headers: { 'Content-Type': 'application/json', ...corsHeaders } 
				}
			);
		}

		// Update README
		const commitMessage = `📝 Update README with history archive (${historyFiles.length} files) [skip ci]`;
		
		const response = await fetch(
			`https://api.github.com/repos/${githubRepo}/contents/${readmePath}`,
			{
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${githubToken}`,
					Accept: 'application/vnd.github.v3+json',
					'Content-Type': 'application/json',
					'User-Agent': 'Rezz-Spotify-Worker/1.0',
				},
				body: JSON.stringify({
					message: commitMessage,
					content: btoa(unescape(encodeURIComponent(newReadmeContent))),
					sha: existingSha,
				}),
			}
		);

		if (!response.ok) {
			const errorBody = await response.text();
			throw new Error(`Failed to update README: ${response.status} - ${errorBody}`);
		}

		const result = await response.json();

		console.log('✅ README updated successfully');

		return new Response(
			JSON.stringify({
				success: true,
				message: 'README updated successfully',
				historyFiles: historyFiles.length,
				commit: result.commit.sha,
			}),
			{ 
				status: 200, 
				headers: { 'Content-Type': 'application/json', ...corsHeaders } 
			}
		);
	} catch (error) {
		console.error('❌ Error updating README:', error);
		return new Response(
			JSON.stringify({ 
				success: false, 
				error: error.message 
			}),
			{ 
				status: 500, 
				headers: { 'Content-Type': 'application/json', ...corsHeaders } 
			}
		);
	}
}
