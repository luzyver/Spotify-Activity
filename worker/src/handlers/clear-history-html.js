/**
 * Clear History HTML Form
 * Returns HTML for password-protected clear history page
 */

export function getClearHistoryHTML() {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Clear History - Authentication Required</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20px;
		}
		.container {
			background: white;
			padding: 40px;
			border-radius: 16px;
			box-shadow: 0 20px 60px rgba(0,0,0,0.3);
			max-width: 400px;
			width: 100%;
		}
		h1 {
			color: #333;
			margin-bottom: 10px;
			font-size: 24px;
		}
		p {
			color: #666;
			margin-bottom: 30px;
			font-size: 14px;
		}
		.form-group {
			margin-bottom: 20px;
		}
		label {
			display: block;
			margin-bottom: 8px;
			color: #333;
			font-weight: 500;
			font-size: 14px;
		}
		input[type="password"] {
			width: 100%;
			padding: 12px 16px;
			border: 2px solid #e0e0e0;
			border-radius: 8px;
			font-size: 16px;
			transition: border-color 0.3s;
		}
		input[type="password"]:focus {
			outline: none;
			border-color: #667eea;
		}
		button {
			width: 100%;
			padding: 14px;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			border: none;
			border-radius: 8px;
			font-size: 16px;
			font-weight: 600;
			cursor: pointer;
			transition: transform 0.2s, box-shadow 0.2s;
		}
		button:hover {
			transform: translateY(-2px);
			box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
		}
		button:active {
			transform: translateY(0);
		}
		.icon {
			font-size: 48px;
			text-align: center;
			margin-bottom: 20px;
		}
		#message {
			margin-top: 20px;
			padding: 12px;
			border-radius: 8px;
			font-size: 14px;
			display: none;
		}
		#message.success {
			background: #d4edda;
			color: #155724;
			border: 1px solid #c3e6cb;
		}
		#message.error {
			background: #f8d7da;
			color: #721c24;
			border: 1px solid #f5c6cb;
		}
		.loading {
			display: none;
			text-align: center;
			margin-top: 10px;
			color: #667eea;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="icon">🗑️</div>
		<h1>Clear History</h1>
		<p>Enter password to clear listening history</p>

		<form id="clearForm">
			<div class="form-group">
				<label for="password">Password</label>
				<input type="password" id="password" name="password" required placeholder="Enter password" autocomplete="off">
			</div>
			<button type="submit">Clear History</button>
		</form>

		<div class="loading" id="loading">⏳ Processing...</div>
		<div id="message"></div>
	</div>

	<script>
		document.getElementById('clearForm').addEventListener('submit', async (e) => {
			e.preventDefault();

			const password = document.getElementById('password').value;
			const button = e.target.querySelector('button');
			const loading = document.getElementById('loading');
			const message = document.getElementById('message');

			// Reset
			message.style.display = 'none';
			button.disabled = true;
			loading.style.display = 'block';

			try {
				const response = await fetch('/clear-history?password=' + encodeURIComponent(password), {
					method: 'POST'
				});

				const data = await response.json();

				if (data.success) {
					message.className = 'success';
					message.textContent = '✅ ' + data.message + (data.itemsRemoved ? ' (' + data.itemsRemoved + ' items removed)' : '');
					document.getElementById('password').value = '';
				} else {
					message.className = 'error';
					message.textContent = '❌ ' + data.error;
				}
			} catch (error) {
				message.className = 'error';
				message.textContent = '❌ Network error: ' + error.message;
			} finally {
				message.style.display = 'block';
				button.disabled = false;
				loading.style.display = 'none';
			}
		});
	</script>
</body>
</html>`;
}
