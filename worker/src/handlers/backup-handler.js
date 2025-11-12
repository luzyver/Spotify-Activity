/**
 * Backup Handler
 * Creates a backup of history.json (pre-clear version) into frontend/static/history/{ddmmyyyy}.json
 */

import * as github from '../services/github.js';
import { getBackupHTML } from './backup-html.js';

/**
 * Extract [ddmmyyyy] from commit message. Fallback to author date if not found.
 * @param {Object} commitData - GitHub commit data
 * @returns {string} ddmmyyyy
 */
function extractDateTag(commitData) {
  const message = commitData?.commit?.message || '';
  const match = message.match(/\[(\d{8})\]/);
  if (match) return match[1];
  const dateStr = commitData?.commit?.author?.date || new Date().toISOString();
  const d = new Date(dateStr);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}${mm}${yyyy}`;
}

/**
 * Handle /backup endpoint
 * Query/body:
 *  - commit: commit SHA (required)
 *  - password: same as CLEAR_HISTORY_PASSWORD (required)
 */
export async function handleBackupEndpoint(request, env, corsHeaders) {
  try {
    // Validate env
    if (!env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not set');
    if (!env.GITHUB_REPO) throw new Error('GITHUB_REPO not set');
    if (!env.CLEAR_HISTORY_PASSWORD) throw new Error('CLEAR_HISTORY_PASSWORD not configured');

    const url = new URL(request.url);
    const accept = request.headers.get('Accept') || '';
    const contentType = request.headers.get('Content-Type') || '';

    const queryCommit = url.searchParams.get('commit') || url.searchParams.get('id');
    const queryPassword = url.searchParams.get('password');

    let bodyCommit = undefined;
    let bodyPassword = undefined;
    if (request.method === 'POST' && contentType.includes('application/json')) {
      try {
        const body = await request.json();
        bodyCommit = body?.commit || body?.id;
        bodyPassword = body?.password;
      } catch (_) {
        // ignore JSON parse errors
      }
    }

    const commitSha = queryCommit || bodyCommit;
    const providedPassword =
      queryPassword ||
      bodyPassword ||
      request.headers.get('X-Backup-Password') ||
      request.headers.get('X-Clear-Password') ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    // If accessed from browser and missing inputs, render HTML form
    if ((!providedPassword || !commitSha) && request.method === 'GET' && accept.includes('text/html')) {
      return new Response(getBackupHTML(), { status: 200, headers: { 'Content-Type': 'text/html', ...corsHeaders } });
    }

    if (!providedPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Password required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    if (providedPassword !== env.CLEAR_HISTORY_PASSWORD) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid password' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    if (!commitSha) {
      // If HTML requested, render form instead of JSON error
      if (accept.includes('text/html')) {
        return new Response(getBackupHTML(), { status: 200, headers: { 'Content-Type': 'text/html', ...corsHeaders } });
      }
      return new Response(
        JSON.stringify({ success: false, error: 'commit (sha) is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const githubToken = env.GITHUB_TOKEN;
    const githubRepo = env.GITHUB_REPO;

    // 1) Get commit info
    const commitData = await github.getCommit(githubRepo, commitSha, githubToken);
    const parentSha = commitData?.parents?.[0]?.sha;
    if (!parentSha) {
      throw new Error('Parent commit not found');
    }

    // 2) Determine date tag [ddmmyyyy]
    const dateTag = extractDateTag(commitData);

    // 3) Read history.json at parent commit (pre-clear state)
    const { content: previousHistory } = await github.getGitHubFileAtRef(
      githubRepo,
      'history.json',
      parentSha,
      githubToken
    );

    if (!previousHistory || !Array.isArray(previousHistory)) {
      return new Response(
        JSON.stringify({ success: false, error: 'No history found at parent commit' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // 4) Write backup file to frontend/static/history/{ddmmyyyy}.json
    const backupPath = `frontend/static/history/${dateTag}.json`;

    // Check if file exists to provide SHA (optional)
    let existingSha = null;
    try {
      const existing = await github.getGitHubFile(githubRepo, backupPath, githubToken);
      existingSha = existing.sha;
    } catch (_) { /* ignore */ }

    const commitMessage = `💾 Backup history [${dateTag}] from ${commitSha}`;
    await github.updateGitHubFile(
      githubRepo,
      backupPath,
      previousHistory,
      commitMessage,
      existingSha,
      githubToken
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Backup created',
        path: backupPath,
        dateTag,
        sourceCommit: commitSha,
        items: previousHistory.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('❌ Error in /backup:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}

