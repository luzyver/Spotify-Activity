/**
 * Commit Message Generator
 * Generates varied and creative commit messages
 */

/**
 * Generate a random commit message based on activity
 * @param {number} newTracks - Number of new tracks added
 * @param {number} liveCount - Number of users currently listening
 * @returns {string} Commit message with [skip ci] flag
 */
export function getRandomCommitMessage(newTracks, liveCount) {
	const messages = [
		// Standard sync messages
		`🎵 Update Spotify data [skip ci]`,
		`🎧 Sync music activity [skip ci]`,
		`✨ Fresh Spotify update [skip ci]`,
		`📊 Update listening data [skip ci]`,
		`🎶 Sync tracks and live status [skip ci]`,
		`💿 Spotify sync complete [skip ci]`,
		`🔄 Music data refresh [skip ci]`,
		`📻 Update play history and status [skip ci]`,
		`🎼 Sync Spotify activity [skip ci]`,
		`💫 Latest music update [skip ci]`,

		// Musical themed
		`🎸 Rocking the playlist updates [skip ci]`,
		`🎹 Harmonizing the data sync [skip ci]`,
		`🥁 Drumroll... music updated! [skip ci]`,
		`🎺 Trumpeting new listening data [skip ci]`,
		`🎻 Fine-tuning the track history [skip ci]`,
		`🎤 Dropping fresh beats data [skip ci]`,

		// Creative/Fun messages
		`🌟 Vibing with latest tracks [skip ci]`,
		`🚀 Launching music updates [skip ci]`,
		`⚡ Lightning-fast sync complete [skip ci]`,
		`🌈 Rainbow of musical updates [skip ci]`,
		`🔥 Hot tracks coming through [skip ci]`,
		`💎 Polishing the music data [skip ci]`,
		`🌙 Moonlight serenade sync [skip ci]`,
		`☀️ Sunshine music update [skip ci]`,
		`🎯 Bulls-eye track sync [skip ci]`,
		`🎨 Painting with sound data [skip ci]`,

		// Time-based messages
		`⏰ Timely music refresh [skip ci]`,
		`🕐 Hourly beats update [skip ci]`,
		`📅 Daily rhythm sync [skip ci]`,
		`⏳ Time flies, tracks sync [skip ci]`,

		// Tech-themed
		`🤖 Bot updating musical database [skip ci]`,
		`💻 Compiling fresh playlists [skip ci]`,
		`🔧 Maintaining the groove [skip ci]`,
		`⚙️ Automated music pipeline [skip ci]`,
		`📡 Broadcasting latest jams [skip ci]`,

		// Playful messages
		`🎪 The music show goes on [skip ci]`,
		`🎢 Rollercoaster of tunes updated [skip ci]`,
		`🎭 Drama-free data sync [skip ci]`,
		`🎬 Action! Music rolling [skip ci]`,
		`🎮 Level up: tracks synced [skip ci]`,
		`🏆 Trophy unlocked: sync complete [skip ci]`,
		`🎉 Celebrating new beats [skip ci]`,
		`🎊 Party time: data updated [skip ci]`
	];

	// Add dynamic messages based on activity
	if (newTracks > 0) {
		messages.push(
			`🎵 Add ${newTracks} new track${newTracks !== 1 ? 's' : ''} [skip ci]`,
			`📝 ${newTracks} track${newTracks !== 1 ? 's' : ''} added to history [skip ci]`,
			`🎧 Logged ${newTracks} new track${newTracks !== 1 ? 's' : ''} [skip ci]`,
			`✅ ${newTracks} fresh track${newTracks !== 1 ? 's' : ''} recorded [skip ci]`,
			`🆕 ${newTracks} track${newTracks !== 1 ? 's' : ''} joined the party [skip ci]`,
			`📥 Downloaded ${newTracks} track${newTracks !== 1 ? 's' : ''} to history [skip ci]`,
			`🌊 Wave of ${newTracks} new track${newTracks !== 1 ? 's' : ''} [skip ci]`,
			`💝 ${newTracks} musical gift${newTracks !== 1 ? 's' : ''} received [skip ci]`
		);
	}

	if (liveCount > 0) {
		messages.push(
			`🔴 ${liveCount} user${liveCount !== 1 ? 's' : ''} listening now [skip ci]`,
			`▶️ Live: ${liveCount} active listener${liveCount !== 1 ? 's' : ''} [skip ci]`,
			`🎧 ${liveCount} vibe${liveCount !== 1 ? 's' : ''} in progress [skip ci]`,
			`🔊 ${liveCount} soul${liveCount !== 1 ? 's' : ''} tuned in [skip ci]`,
			`🎶 ${liveCount} melody maker${liveCount !== 1 ? 's' : ''} online [skip ci]`,
			`👂 ${liveCount} ear${liveCount !== 1 ? 's' : ''} on the music [skip ci]`
		);
	}

	const randomIndex = Math.floor(Math.random() * messages.length);
	return messages[randomIndex];
}
