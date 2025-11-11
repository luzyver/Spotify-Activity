/**
 * Spotify Activity Tracker - Main Application
 * Handles UI rendering, data fetching, and user interactions
 */

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const AppState = {
	avatarImages: {},
	currentPage: 1,
	totalPages: 0,
	sortedHistory: []
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const Utils = {
	/**
	 * Get user initial from tracked users config
	 */
	getInitial(userId) {
		return TRACKED_USERS[userId]?.initial || "U";
	},

	/**
	 * Get user display name from tracked users config
	 */
	getUserName(userId) {
		return TRACKED_USERS[userId]?.name || "User";
	},

	/**
	 * Get user color from tracked users config
	 */
	getUserColor(userId) {
		return TRACKED_USERS[userId]?.color || "#1db954";
	},

	/**
	 * Convert timestamp to human-readable "time ago" format
	 */
	timeAgo(timestamp) {
		const ts = String(timestamp).length === 10 ? timestamp * 1000 : timestamp;
		const now = Date.now();
		const diff = Math.floor((now - ts) / 1000);

		if (diff < 60) return "just now";
		if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
		if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
		return `${Math.floor(diff / 604800)}w ago`;
	},

	/**
	 * Convert Spotify URI to web URL
	 */
	spotifyUrl(uri) {
		if (!uri) return "#";
		const trackId = uri.split(":")[2];
		return `https://open.spotify.com/track/${trackId}`;
	},

	/**
	 * Smooth scroll to element
	 */
	scrollToElement(elementId, block = 'start') {
		const element = document.getElementById(elementId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block });
		}
	}
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

const UI = {
	/**
	 * Create floating background particles
	 */
	createParticles() {
		const container = document.getElementById('particles');
		const particleCount = 30;

		for (let i = 0; i < particleCount; i++) {
			const particle = document.createElement('div');
			particle.className = 'particle';
			particle.style.left = `${Math.random() * 100}%`;
			particle.style.animationDelay = `${Math.random() * 8}s`;
			particle.style.animationDuration = `${Math.random() * 4 + 6}s`;
			container.appendChild(particle);
		}
	},

	/**
	 * Render empty state for now playing section
	 */
	renderEmptyNowPlaying() {
		return `
			<div class="glass-card rounded-3xl p-12 text-center max-w-md">
				<svg class="w-24 h-24 mx-auto mb-6 opacity-30" fill="currentColor" viewBox="0 0 20 20">
					<path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
				</svg>
				<h3 class="text-xl font-bold text-gray-400 mb-2">No one is listening right now</h3>
				<p class="text-sm text-gray-500">Start playing music on Spotify to see it here</p>
			</div>
		`;
	},

	/**
	 * Render now playing card for a user
	 */
	renderNowPlayingCard(buddy) {
		if (!buddy?.track) return '';

		const userName = buddy.user?.name || Utils.getUserName(buddy.user?.uri);
		const avatarUrl = buddy.user?.imageUrl || `https://ui-avatars.com/api/?name=${userName}&background=1db954&color=fff`;

		return `
			<div class="glass-card-live rounded-3xl p-8 w-80 float-animation scale-in">
				<div class="flex items-center justify-between mb-6">
					<div class="flex items-center gap-3">
						<div class="relative">
							<img src="${avatarUrl}"
								 class="w-12 h-12 rounded-full border-3 border-[#1db954] ring-2 ring-[#1db954]/30"
								 alt="${userName}"
								 onerror="this.src='https://ui-avatars.com/api/?name=${userName}&background=1db954&color=fff'">
							<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-[#1db954] rounded-full border-2 border-[#0a0a0a] animate-pulse"></div>
						</div>
						<div class="text-left">
							<div class="font-bold text-lg">${userName}</div>
							<div class="text-xs text-gray-400 flex items-center gap-1">
								<span class="w-2 h-2 bg-[#1db954] rounded-full animate-pulse"></span>
								${Utils.timeAgo(buddy.timestamp)}
							</div>
						</div>
					</div>
					<span class="badge-live">LIVE</span>
				</div>

				<div class="relative w-56 h-56 mx-auto mb-6">
					<div class="absolute inset-0 pulse-glow rounded-full"></div>
					<div class="relative w-full h-full rounded-full overflow-hidden spin-slow vinyl bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-black shadow-2xl">
						<img src="${buddy.track?.imageUrl || ''}"
							 class="w-full h-full object-cover relative z-10"
							 alt="${buddy.track?.name || 'Album art'}">
					</div>
				</div>

				<div class="text-center space-y-2">
					<a href="${Utils.spotifyUrl(buddy.track?.uri)}"
					   target="_blank"
					   class="block font-bold text-xl hover:text-[#1db954] transition truncate"
					   title="${buddy.track?.name || ''}">
						${buddy.track?.name || ''}
					</a>
					<p class="text-sm text-gray-400 truncate font-medium" title="${buddy.track?.artist?.name || ''}">
						${buddy.track?.artist?.name || ''}
					</p>
					<p class="text-xs text-gray-500 truncate italic" title="${buddy.track?.album?.name || ''}">
						${buddy.track?.album?.name || ''}
					</p>
				</div>
			</div>
		`;
	},

	/**
	 * Create history track card element
	 */
	createHistoryCard(item, index) {
		const div = document.createElement("div");
		div.className = `glass-card rounded-2xl p-5 track-card fade-in-up`;
		div.style.animationDelay = `${(index % ITEMS_PER_PAGE) * 0.03}s`;

		const userColor = Utils.getUserColor(item.userId);
		const globalIndex = ((AppState.currentPage - 1) * ITEMS_PER_PAGE) + index + 1;

		div.innerHTML = `
			<div class="flex items-center gap-4">
				<div class="relative flex-shrink-0">
					<img src="${item.imageUrl}"
						 class="w-20 h-20 rounded-xl shadow-2xl album-cover"
						 alt="${item.track}">
					<div class="absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
						 style="background-color: ${userColor}">
						${globalIndex}
					</div>
				</div>
				<div class="flex-1 min-w-0">
					<a href="${Utils.spotifyUrl(item.uri)}"
					   target="_blank"
					   class="font-bold text-lg hover:text-[#1db954] transition block truncate mb-1"
					   title="${item.track}">
						${item.track}
					</a>
					<p class="text-sm text-gray-400 truncate mb-2" title="${item.artist}">
						${item.artist}
					</p>
					<div class="flex items-center gap-3 text-xs">
						<span class="text-gray-500">${Utils.timeAgo(item.timestamp)}</span>
						<span class="px-2 py-1 rounded-full font-medium"
							  style="background-color: ${userColor}33; color: ${userColor}">
							${item.user}
						</span>
					</div>
				</div>
			</div>
		`;

		return div;
	},

	/**
	 * Update stats display
	 */
	updateStats(history) {
		const totalTracksElement = document.getElementById("total-tracks");
		if (totalTracksElement) {
			totalTracksElement.textContent = history.length;
		}

		// Calculate and display per-user stats
		const statsContainer = document.getElementById("stats-container");
		const userStats = {};

		history.forEach(item => {
			if (!userStats[item.userId]) {
				userStats[item.userId] = {
					count: 0,
					name: item.user,
					color: Utils.getUserColor(item.userId)
				};
			}
			userStats[item.userId].count++;
		});

		// Add user stat badges
		Object.values(userStats).forEach(stat => {
			const badge = document.createElement('div');
			badge.className = 'stat-badge';
			badge.innerHTML = `
				<span class="font-bold" style="color: ${stat.color}">${stat.count}</span>
				<span class="text-gray-400 text-sm ml-2">${stat.name}</span>
			`;
			statsContainer.appendChild(badge);
		});
	},

	/**
	 * Update page info display
	 */
	updatePageInfo(currentPage, totalPages) {
		const pageInfoElement = document.getElementById("page-info");
		if (pageInfoElement) {
			pageInfoElement.innerHTML = `
				<span class="text-gray-400 text-sm font-medium">Page ${currentPage} of ${totalPages}</span>
			`;
		}
	}
};

// ============================================================================
// DATA LOADING
// ============================================================================

const DataLoader = {
	/**
	 * Load and render now playing data
	 */
	async loadNowPlaying() {
		try {
			// Fetch with cache busting to ensure fresh data
			const timestamp = new Date().getTime();
			const url = `https://cdn.jsdelivr.net/gh/luzyver/Rezz-Spotify@main/live.json?t=${timestamp}`;
			const response = await fetch(url, {
				cache: 'no-cache',
				mode: 'cors'
			});
			const data = await response.json();
			const container = document.getElementById("couple");

			if (!container) return;

			const users = data.friends || [];

			// Store avatar images
			users.forEach(user => {
				if (user?.user?.uri && user?.user?.imageUrl) {
					AppState.avatarImages[user.user.uri] = user.user.imageUrl;
				}
			});

			// Render
			if (users.length === 0) {
				container.innerHTML = UI.renderEmptyNowPlaying();
			} else {
				container.innerHTML = users
					.map(user => UI.renderNowPlayingCard(user))
					.join('');
			}
		} catch (error) {
			console.error("Error loading now playing:", error);
		}
	},

	/**
	 * Load and render history with pagination
	 */
	async loadHistory() {
		try {
			// Fetch with cache busting to ensure fresh data
			const timestamp = new Date().getTime();
			const url = `https://cdn.jsdelivr.net/gh/luzyver/Rezz-Spotify@main/history.json?t=${timestamp}`;
			const response = await fetch(url, {
				cache: 'no-cache',
				mode: 'cors'
			});
			const history = await response.json();

			// Update stats
			UI.updateStats(history);

			// Sort and store
			AppState.sortedHistory = history.sort((a, b) => b.timestamp - a.timestamp);
			AppState.totalPages = Math.ceil(AppState.sortedHistory.length / ITEMS_PER_PAGE);

			// Render first page
			Pagination.renderPage(1);
			Pagination.renderControls();
		} catch (error) {
			console.error("Error loading history:", error);
		}
	}
};

// ============================================================================
// PAGINATION
// ============================================================================

const Pagination = {
	/**
	 * Render a specific page of history
	 */
	renderPage(page) {
		const container = document.getElementById("history");
		if (!container) return;

		AppState.currentPage = page;
		container.innerHTML = '';

		const start = (page - 1) * ITEMS_PER_PAGE;
		const end = start + ITEMS_PER_PAGE;
		const pageItems = AppState.sortedHistory.slice(start, end);

		pageItems.forEach((item, index) => {
			container.appendChild(UI.createHistoryCard(item, index));
		});

		// Update page info and scroll
		UI.updatePageInfo(AppState.currentPage, AppState.totalPages);
		Utils.scrollToElement("history");
	},

	/**
	 * Render pagination controls
	 */
	renderControls() {
		const container = document.getElementById("pagination");
		if (!container) return;

		container.innerHTML = '';

		const { currentPage, totalPages } = AppState;

		// Previous button
		this._createButton(container, '← Prev', currentPage === 1, () => {
			if (currentPage > 1) {
				this.renderPage(currentPage - 1);
				this.renderControls();
			}
		});

		// Page numbers
		this._renderPageNumbers(container);

		// Next button
		this._createButton(container, 'Next →', currentPage === totalPages, () => {
			if (currentPage < totalPages) {
				this.renderPage(currentPage + 1);
				this.renderControls();
			}
		});
	},

	/**
	 * Render page number buttons
	 */
	_renderPageNumbers(container) {
		const { currentPage, totalPages } = AppState;
		const maxVisiblePages = 5;

		let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
		let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

		if (endPage - startPage < maxVisiblePages - 1) {
			startPage = Math.max(1, endPage - maxVisiblePages + 1);
		}

		// First page + ellipsis
		if (startPage > 1) {
			this._createButton(container, '1', false, () => {
				this.renderPage(1);
				this.renderControls();
			});

			if (startPage > 2) {
				this._createEllipsis(container);
			}
		}

		// Page numbers
		for (let i = startPage; i <= endPage; i++) {
			const isActive = i === currentPage;
			this._createButton(container, String(i), false, () => {
				this.renderPage(i);
				this.renderControls();
			}, isActive);
		}

		// Ellipsis + last page
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				this._createEllipsis(container);
			}

			this._createButton(container, String(totalPages), false, () => {
				this.renderPage(totalPages);
				this.renderControls();
			});
		}
	},

	/**
	 * Create a pagination button
	 */
	_createButton(container, text, disabled, onClick, isActive = false) {
		const button = document.createElement('button');
		button.className = `page-btn ${isActive ? 'active' : ''}`;
		button.innerHTML = text;
		button.disabled = disabled;
		button.onclick = onClick;
		container.appendChild(button);
	},

	/**
	 * Create ellipsis separator
	 */
	_createEllipsis(container) {
		const dots = document.createElement('span');
		dots.className = 'page-info';
		dots.textContent = '...';
		container.appendChild(dots);
	}
};

// ============================================================================
// INITIALIZATION
// ============================================================================

const App = {
	/**
	 * Initialize the application
	 */
	init() {
		UI.createParticles();
		DataLoader.loadNowPlaying();
		DataLoader.loadHistory();
	}
};

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	App.init();
});

// Optional: Auto-refresh (disabled by default during pagination)
// Uncomment to enable auto-refresh every 30 seconds
/*
setInterval(() => {
	location.reload();
}, 30000);
*/
