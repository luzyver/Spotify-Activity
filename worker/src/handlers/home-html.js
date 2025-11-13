export function getHomeHTML() {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Spotify Worker API</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			background: #0a0a0a;
			color: #e0e0e0;
			line-height: 1.6;
		}
		
		.container {
			max-width: 900px;
			margin: 0 auto;
			padding: 60px 20px;
		}
		
		header {
			margin-bottom: 50px;
		}
		
		h1 {
			font-size: 32px;
			font-weight: 600;
			color: #fff;
			margin-bottom: 8px;
		}
		
		.subtitle {
			color: #888;
			font-size: 15px;
		}
		
		.section {
			margin-bottom: 40px;
		}
		
		.section-title {
			font-size: 13px;
			text-transform: uppercase;
			letter-spacing: 1px;
			color: #666;
			margin-bottom: 16px;
			font-weight: 500;
		}
		
		.endpoint-list {
			display: flex;
			flex-direction: column;
			gap: 1px;
			background: #1a1a1a;
			border-radius: 8px;
			overflow: hidden;
		}
		
		.endpoint {
			background: #0f0f0f;
			padding: 16px 20px;
			display: flex;
			align-items: center;
			gap: 16px;
		}
		
		.endpoint:hover {
			background: #151515;
		}
		
		.method {
			font-family: 'SF Mono', Monaco, monospace;
			font-size: 11px;
			font-weight: 600;
			padding: 4px 8px;
			border-radius: 4px;
			min-width: 45px;
			text-align: center;
		}
		
		.method.get {
			background: #1a3a1a;
			color: #4ade80;
		}
		
		.method.post {
			background: #1a2a3a;
			color: #60a5fa;
		}
		
		.endpoint-path {
			font-family: 'SF Mono', Monaco, monospace;
			font-size: 14px;
			color: #fff;
			flex: 0 0 auto;
		}
		
		.endpoint-desc {
			color: #888;
			font-size: 14px;
		}
		
		.actions {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;
		}
		
		.btn {
			background: #1a1a1a;
			border: 1px solid #2a2a2a;
			color: #fff;
			padding: 12px 20px;
			border-radius: 6px;
			font-size: 14px;
			cursor: pointer;
			text-decoration: none;
			display: inline-block;
			text-align: center;
			transition: all 0.15s;
		}
		
		.btn:hover {
			background: #252525;
			border-color: #3a3a3a;
		}
		
		.btn:active {
			transform: scale(0.98);
		}
		
		.status {
			margin-top: 20px;
			padding: 12px 16px;
			border-radius: 6px;
			font-size: 13px;
			display: none;
			border-left: 3px solid;
		}
		
		.status.show {
			display: block;
		}
		
		.status.success {
			background: #0a2a0a;
			border-color: #4ade80;
			color: #4ade80;
		}
		
		.status.error {
			background: #2a0a0a;
			border-color: #ef4444;
			color: #ef4444;
		}
		
		footer {
			margin-top: 60px;
			padding-top: 30px;
			border-top: 1px solid #1a1a1a;
			color: #666;
			font-size: 13px;
		}
		
		@media (max-width: 600px) {
			.container {
				padding: 40px 16px;
			}
			
			h1 {
				font-size: 24px;
			}
			
			.endpoint {
				flex-direction: column;
				align-items: flex-start;
				gap: 8px;
			}
			
			.actions {
				grid-template-columns: 1fr;
			}
		}
	</style>
</head>
<body>
	<div class="container">
		<header>
			<h1>Spotify Worker API</h1>
			<p class="subtitle">Cloudflare Worker for automated Spotify activity tracking</p>
		</header>
		
		<div class="section">
			<div class="section-title">Endpoints</div>
			<div class="endpoint-list">
				<div class="endpoint">
					<span class="method get">GET</span>
					<span class="endpoint-path">/trigger</span>
					<span class="endpoint-desc">Manually trigger data sync</span>
				</div>
				<div class="endpoint">
					<span class="method get">GET</span>
					<span class="endpoint-path">/api/live</span>
					<span class="endpoint-desc">Currently playing tracks</span>
				</div>
				<div class="endpoint">
					<span class="method get">GET</span>
					<span class="endpoint-path">/api/history</span>
					<span class="endpoint-desc">Recently played tracks</span>
				</div>
				<div class="endpoint">
					<span class="method post">POST</span>
					<span class="endpoint-path">/update</span>
					<span class="endpoint-desc">Update README statistics</span>
				</div>
				<div class="endpoint">
					<span class="method post">POST</span>
					<span class="endpoint-path">/backup</span>
					<span class="endpoint-desc">Backup history from commit</span>
				</div>
				<div class="endpoint">
					<span class="method post">POST</span>
					<span class="endpoint-path">/clear-history</span>
					<span class="endpoint-desc">Clear history (protected)</span>
				</div>
			</div>
		</div>
		
		<div class="section">
			<div class="section-title">Actions</div>
			<div class="actions">
				<button class="btn" onclick="triggerSync()">Trigger Sync</button>
				<button class="btn" onclick="updateReadme()">Update README</button>
				<a href="/api/live" class="btn" target="_blank">View Live Data</a>
				<a href="/api/history" class="btn" target="_blank">View History</a>
			</div>
			<div id="status" class="status"></div>
		</div>
		
		<footer>
			Automated sync runs every 10 minutes via cron
		</footer>
	</div>
	
	<script>
		function showStatus(message, type = 'success') {
			const status = document.getElementById('status');
			status.textContent = message;
			status.className = 'status show ' + type;
			setTimeout(() => status.className = 'status', 5000);
		}
		
		async function triggerSync() {
			try {
				const response = await fetch('/trigger');
				const text = await response.text();
				showStatus(response.ok ? text : 'Sync failed: ' + text, response.ok ? 'success' : 'error');
			} catch (error) {
				showStatus('Error: ' + error.message, 'error');
			}
		}
		
		async function updateReadme() {
			try {
				const response = await fetch('/update', { method: 'POST' });
				const data = await response.json();
				if (data.success) {
					showStatus(data.skipped ? 'README unchanged' : 'README updated', 'success');
				} else {
					showStatus('Update failed: ' + data.error, 'error');
				}
			} catch (error) {
				showStatus('Error: ' + error.message, 'error');
			}
		}
	</script>
</body>
</html>`;
}
