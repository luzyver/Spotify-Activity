<script lang="ts">
  import { API_ENDPOINTS } from '$lib/config';

  type StatusType = 'idle' | 'success' | 'error';

  let statusMessage = '';
  let statusType: StatusType = 'idle';
  let loadingTrigger = false;
  let loadingUpdate = false;
  let loadingBackup = false;
  let loadingClear = false;

  let backupCommitHash = '';
  let clearPassword = '';

  const endpoints = [
    { method: 'GET', path: '/trigger', desc: 'Manually trigger data sync' },
    { method: 'GET', path: '/api/live', desc: 'Currently playing tracks' },
    { method: 'GET', path: '/api/history', desc: 'Recently played tracks' },
    { method: 'POST', path: '/update', desc: 'Update README statistics' },
    { method: 'POST', path: '/backup', desc: 'Backup history from commit' },
    { method: 'POST', path: '/clear-history', desc: 'Clear history (protected)' },
  ] as const;

  function showStatus(message: string, type: StatusType) {
    statusMessage = message;
    statusType = type;
    if (message) {
      setTimeout(() => {
        statusMessage = '';
        statusType = 'idle';
      }, 5000);
    }
  }

  async function triggerSync() {
    loadingTrigger = true;
    showStatus('', 'idle');

    try {
      const res = await fetch(API_ENDPOINTS.TRIGGER);
      const text = await res.text().catch(() => '');
      if (res.ok) {
        showStatus(text || 'Success: Sync triggered', 'success');
      } else {
        showStatus(`Sync failed: ${text || res.statusText}`, 'error');
      }
    } catch (err) {
      showStatus(`Error: ${(err as Error).message}`, 'error');
    } finally {
      loadingTrigger = false;
    }
  }

  async function updateReadme() {
    loadingUpdate = true;
    showStatus('', 'idle');

    try {
      const res = await fetch(API_ENDPOINTS.UPDATE, { method: 'POST' });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data as any)?.success) {
        const skipped = (data as any)?.skipped;
        showStatus(skipped ? 'README unchanged' : 'README updated', 'success');
      } else {
        const error = (data as any)?.error || res.statusText || 'Unknown error';
        showStatus(`Update failed: ${error}`, 'error');
      }
    } catch (err) {
      showStatus(`Error: ${(err as Error).message}`, 'error');
    } finally {
      loadingUpdate = false;
    }
  }

  async function backupHistory() {
    if (!backupCommitHash.trim()) {
      showStatus('Please enter a commit hash', 'error');
      return;
    }

    loadingBackup = true;
    showStatus('', 'idle');

    try {
      const res = await fetch(API_ENDPOINTS.BACKUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitHash: backupCommitHash.trim() })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data as any)?.success) {
        showStatus('Backup completed successfully', 'success');
        backupCommitHash = '';
      } else {
        const error = (data as any)?.error || res.statusText || 'Unknown error';
        showStatus(`Backup failed: ${error}`, 'error');
      }
    } catch (err) {
      showStatus(`Error: ${(err as Error).message}`, 'error');
    } finally {
      loadingBackup = false;
    }
  }

  async function clearHistory() {
    if (!clearPassword.trim()) {
      showStatus('Please enter password', 'error');
      return;
    }

    if (!confirm('Are you sure you want to clear all history? This action cannot be undone!')) {
      return;
    }

    loadingClear = true;
    showStatus('', 'idle');

    try {
      const res = await fetch(API_ENDPOINTS.CLEAR_HISTORY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: clearPassword })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data as any)?.success) {
        showStatus('History cleared successfully', 'success');
        clearPassword = '';
      } else {
        const error = (data as any)?.error || res.statusText || 'Unauthorized';
        showStatus(`Clear failed: ${error}`, 'error');
      }
    } catch (err) {
      showStatus(`Error: ${(err as Error).message}`, 'error');
    } finally {
      loadingClear = false;
    }
  }
</script>

<svelte:head>
  <title>Spotify Worker Dashboard</title>
</svelte:head>

<div class="page">
  <div class="container">
    
    <header class="header">
      <div>
        <h1 class="title">Spotify Worker Dashboard</h1>
        <p class="subtitle">Manage automated Spotify activity tracking</p>
      </div>
      <div class="status-pill">
        <span class="dot"></span>
        Active
      </div>
    </header>

    {#if statusType !== 'idle' && statusMessage}
      <div class="toast toast-{statusType}">
        {statusMessage}
      </div>
    {/if}

    <div class="grid">
      
      <section class="card">
        <h2 class="card-title">Quick Actions</h2>
        <div class="actions">
          <button class="btn btn-primary" on:click={triggerSync} disabled={loadingTrigger}>
            {loadingTrigger ? 'Syncing...' : 'Trigger Sync'}
          </button>
          <button class="btn btn-primary" on:click={updateReadme} disabled={loadingUpdate}>
            {loadingUpdate ? 'Updating...' : 'Update README'}
          </button>
          <a class="btn btn-secondary" href={API_ENDPOINTS.LIVE} target="_blank" rel="noreferrer">
            View Live Data
          </a>
          <a class="btn btn-secondary" href={API_ENDPOINTS.HISTORY} target="_blank" rel="noreferrer">
            View History
          </a>
        </div>
      </section>

      <section class="card">
        <h2 class="card-title">Backup History</h2>
        <p class="card-text">Restore history data from a specific Git commit hash</p>
        <div class="form">
          <input
            type="text"
            class="input"
            placeholder="Enter commit hash"
            bind:value={backupCommitHash}
            disabled={loadingBackup}
          />
          <button 
            class="btn btn-success" 
            on:click={backupHistory} 
            disabled={loadingBackup || !backupCommitHash.trim()}
          >
            {loadingBackup ? 'Processing...' : 'Restore'}
          </button>
        </div>
      </section>

      <section class="card card-danger">
        <h2 class="card-title">Clear History</h2>
        <p class="card-text">⚠️ This will permanently delete all history data</p>
        <div class="form">
          <input
            type="password"
            class="input"
            placeholder="Enter password"
            bind:value={clearPassword}
            disabled={loadingClear}
          />
          <button 
            class="btn btn-danger" 
            on:click={clearHistory} 
            disabled={loadingClear || !clearPassword.trim()}
          >
            {loadingClear ? 'Clearing...' : 'Clear'}
          </button>
        </div>
      </section>

      <section class="card card-wide">
        <h2 class="card-title">API Endpoints</h2>
        <div class="endpoints">
          {#each endpoints as ep}
            <div class="endpoint">
              <span class="method method-{ep.method.toLowerCase()}">{ep.method}</span>
              <code class="path">{ep.path}</code>
              <span class="desc">{ep.desc}</span>
            </div>
          {/each}
        </div>
      </section>

    </div>

    <footer class="footer">
      Automated sync runs every 10 minutes via cron
    </footer>

  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }

  .page {
    min-height: 100vh;
    background: #0f0f0f;
    color: #e5e5e5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    padding: 40px 20px;
  }

  .container {
    max-width: 1100px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
  }

  .title {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px 0;
    letter-spacing: -0.02em;
  }

  .subtitle {
    font-size: 16px;
    color: #888;
    margin: 0;
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 100px;
    font-size: 14px;
    color: #4ade80;
  }

  .dot {
    width: 6px;
    height: 6px;
    background: #4ade80;
    border-radius: 50%;
    animation: blink 2s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .toast {
    padding: 16px 20px;
    margin-bottom: 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
  }

  .toast-success {
    background: #1a2e1a;
    border: 1px solid #2a4a2a;
    color: #4ade80;
  }

  .toast-error {
    background: #2e1a1a;
    border: 1px solid #4a2a2a;
    color: #ef4444;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }

  .card {
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 24px;
    transition: border-color 0.2s;
  }

  .card:hover {
    border-color: #3a3a3a;
  }

  .card-wide {
    grid-column: 1 / -1;
  }

  .card-danger {
    border-color: #3a2a2a;
  }

  .card-danger:hover {
    border-color: #4a2a2a;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 16px 0;
  }

  .card-text {
    font-size: 14px;
    color: #888;
    margin: 0 0 20px 0;
    line-height: 1.5;
  }

  .actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .form {
    display: flex;
    gap: 12px;
  }

  .input {
    flex: 1;
    padding: 12px 16px;
    background: #0f0f0f;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    transition: border-color 0.2s;
  }

  .input:focus {
    outline: none;
    border-color: #4a4a4a;
  }

  .input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input::placeholder {
    color: #555;
  }

  .btn {
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #2a2a2a;
    color: #fff;
  }

  .btn-primary:hover:not(:disabled) {
    background: #3a3a3a;
  }

  .btn-secondary {
    background: #1a1a1a;
    color: #888;
    border: 1px solid #2a2a2a;
  }

  .btn-secondary:hover:not(:disabled) {
    color: #fff;
    border-color: #3a3a3a;
  }

  .btn-success {
    background: #22c55e;
    color: #000;
  }

  .btn-success:hover:not(:disabled) {
    background: #16a34a;
  }

  .btn-danger {
    background: #dc2626;
    color: #fff;
  }

  .btn-danger:hover:not(:disabled) {
    background: #b91c1c;
  }

  .endpoints {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .endpoint {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: #0f0f0f;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .endpoint:hover {
    background: #1a1a1a;
  }

  .method {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .method-get {
    background: #1a2e1a;
    color: #4ade80;
  }

  .method-post {
    background: #1a2a3a;
    color: #60a5fa;
  }

  .path {
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    font-size: 13px;
    color: #fff;
  }

  .desc {
    font-size: 13px;
    color: #888;
    text-align: right;
  }

  .footer {
    text-align: center;
    padding: 24px;
    color: #666;
    font-size: 14px;
  }

  @media (max-width: 768px) {
    .page {
      padding: 20px 16px;
    }

    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .title {
      font-size: 24px;
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .actions {
      grid-template-columns: 1fr;
    }

    .form {
      flex-direction: column;
    }

    .endpoint {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .desc {
      text-align: left;
    }
  }
</style>
