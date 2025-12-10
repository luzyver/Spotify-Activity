// Building blocks for random commit messages
const EMOJIS = ['🎵', '🎧', '🎶', '🎼', '🎤', '🎸', '🎹', '🎺', '🎻', '🥁', '🎷', '🪕', '💿', '📻', '🔊', '🎙️', '🪘', '📀', '🎚️', '🎛️'];
const VERBS = ['Update', 'Sync', 'Refresh', 'Add', 'Log', 'Record', 'Save', 'Push', 'Commit', 'Track', 'Capture', 'Store', 'Archive', 'Upload', 'Process'];
const NOUNS = ['music data', 'Spotify activity', 'listening history', 'track data', 'play history', 'audio logs', 'music stats', 'sound waves', 'beat records', 'tune archive'];
const ADJECTIVES = ['fresh', 'new', 'latest', 'recent', 'hot', 'cool', 'stellar', 'cosmic', 'groovy', 'funky', 'smooth', 'crisp', 'vibrant', 'dynamic'];
const SUFFIXES = ['', ' ✨', ' 🚀', ' 💫', ' ⚡', ' 🔥', ' 💎', ' 🌟', ' ⭐', ' 🎯'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function getRandomCommitMessage(newTracks = 0) {
	const patterns = [
		() => `${pick(EMOJIS)} ${pick(VERBS)} ${pick(NOUNS)}`,
		() => `${pick(EMOJIS)} ${pick(ADJECTIVES).charAt(0).toUpperCase() + pick(ADJECTIVES).slice(1)} ${pick(NOUNS)}`,
		() => `${pick(EMOJIS)} ${pick(VERBS)} ${pick(ADJECTIVES)} ${pick(NOUNS)}`,
		() => `${pick(EMOJIS)} ${pick(VERBS)} ${pick(NOUNS)}${pick(SUFFIXES)}`,
		() => newTracks > 0
			? `${pick(EMOJIS)} ${pick(VERBS)} ${newTracks} ${newTracks === 1 ? 'track' : 'tracks'}`
			: `${pick(EMOJIS)} ${pick(VERBS)} ${pick(NOUNS)}`,
	];

	return `${pick(patterns)()} [skip ci]`;
}
