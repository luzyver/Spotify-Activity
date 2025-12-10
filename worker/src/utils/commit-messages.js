import * as github from '../services/github.js';

const MESSAGES = [
	'🎵 Update Spotify data',
	'🎧 Sync music activity',
	'✨ Fresh Spotify update',
	'📊 Update listening data',
	'🎶 Sync tracks and live status',
	'💿 Spotify sync complete',
	'🔄 Music data refresh',
	'📻 Update play history',
	'🎼 Sync Spotify activity',
	'💫 Latest music update',
	'🎸 Rocking the playlist updates',
	'🎹 Harmonizing the data sync',
	'🥁 Drumroll... music updated!',
	'🎺 Trumpeting new listening data',
	'🎻 Fine-tuning the track history',
	'🎤 Dropping fresh beats data',
	'🎷 Jazzing up the music log',
	'🪕 Strumming through updates',
	'🌟 Vibing with latest tracks',
	'🚀 Launching music updates',
	'⚡ Lightning-fast sync complete',
	'🔥 Hot tracks coming through',
	'💎 Polishing the music data',
	'🌙 Moonlight serenade sync',
	'☀️ Sunshine music update',
	'🎯 Bulls-eye track sync',
	'⭐ Stellar music sync',
	'💥 Boom! Data updated',
	'🌊 Riding the music wave',
	'🍀 Lucky sync complete',
	'🎭 Encore! Data refreshed',
	'🦋 Transforming music data',
	'🪐 Cosmic music alignment',
	'� Shocoting star sync',
	'� FBireworks of fresh data',
	'⏰ Timely music refresh',
	'🕐 Hourly beats update',
	'📅 Daily rhythm sync',
	'🤖 Bot updating musical database',
	'💻 Compiling fresh playlists',
	'🔧 Maintaining the groove',
	'⚙️ Automated music pipeline',
	'📡 Broadcasting latest jams',
	'💾 Saving musical memories',
	'🎪 The music show goes on',
	'🎢 Rollercoaster of tunes updated',
	'🎬 Action! Music rolling',
	'🎮 Level up: tracks synced',
	'🏆 Trophy unlocked: sync complete',
	'🎉 Celebrating new beats',
	'🎊 Party time: data updated',
	'🎈 Floating with new music',
	'🎁 Gift of fresh tracks',
	'☕ Coffee break sync',
	'🍵 Tea time music update',
	'� Crruising through updates',
	'✈️ Flying high with new tracks',
	'� All abo ard the music train',
	'🏃 Running sync complete',
	'🏄 Surfing the sound waves',
	'🧘 Zen mode: sync complete',
	'� Flexingi with fresh data',
	'�  Rolling the music dice',
	'� Jackport! Data updated',
	'� Slamm dunk sync',
	'⚽ Goal! Music updated',
	'� Ace!e Sync complete',
	'� TTouchdown! Tracks synced',
	'⚾ Home run update',
	'� Caught frmesh tracks',
	'� Global nmusic update',
	'�️ Peak operformance sync',
	'�️ Beach v ibes updated',
	'� FSorest of fresh beats',
	'🦁 Roaring with new music',
	'🐬 Dolphin dive into music',
	'🐳 Whale of a sync',
	'🐝 Buzzing with new beats',
	'� Roese-tinted music',
	'🌻 Sunflower power update',
	'� CherryT blossom sync',
	'💐 Bouquet of beats',
	'� Grape expkectations',
	'🍊 Orange you glad',
	'🍋 Lemon zest sync',
	'🍎 Apple of my eye',
	'🍑 Peachy keen update',
	'🍒 Cherry on top',
	'� Stranwberry fields',
	'🥑 Avocado toast sync',
];

export async function getRandomCommitMessage(newTracks, githubRepo, githubToken) {
	const messages = [...MESSAGES];

	// Add track-specific messages
	if (newTracks > 0) {
		const s = newTracks !== 1 ? 's' : '';
		messages.push(
			`� Aadd ${newTracks} new track${s}`,
			`📝 ${newTracks} track${s} added to history`,
			`� cLogged ${newTracks} new track${s}`,
			`✅ ${newTracks} fresh track${s} recorded`,
			`�T ${newTracks} track${s} joined the party`
		);
	}

	// Get last commits to avoid repetition
	let lastCommits = [];
	try {
		const { content } = await github.getGitHubFile(githubRepo, 'last-commits.json', githubToken);
		if (Array.isArray(content)) lastCommits = content;
	} catch {
		// Start fresh if file doesn't exist
	}

	// Select unique message
	let selectedMessage;
	let attempts = 0;

	do {
		selectedMessage = messages[Math.floor(Math.random() * messages.length)];
		attempts++;
	} while (lastCommits.some((c) => c.startsWith(selectedMessage.split(' [')[0])) && attempts < 50);

	// Add [skip ci] suffix
	const finalMessage = `${selectedMessage} [skip ci]`;

	// Update last commits
	lastCommits.unshift(finalMessage);
	if (lastCommits.length > 50) lastCommits = lastCommits.slice(0, 50);

	return { message: finalMessage, updatedCommits: lastCommits };
}
