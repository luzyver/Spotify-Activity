#!/usr/bin/env node
import 'dotenv/config';

const CONFIG = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'https://test.luzyver.dev/callback',
  scopes: [
    'user-read-recently-played',
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-read-private',
  ],
};

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

const log = {
  info: (msg) => console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${msg}`),
  success: (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  warn: (msg) => console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`),
  dim: (msg) => console.log(`${COLORS.dim}${msg}${COLORS.reset}`),
};

function showHelp() {
  console.log(`
${COLORS.green}Spotify Auth CLI${COLORS.reset}

Usage: node spotify-auth.js <command>

Commands:
  url      Generate authorization URL
  token    Exchange auth code for refresh token
  help     Show this help message

Examples:
  node spotify-auth.js url
  SPOTIFY_AUTH_CODE="abc123" node spotify-auth.js token

Environment Variables (.env):
  SPOTIFY_CLIENT_ID      Your Spotify app client ID
  SPOTIFY_CLIENT_SECRET  Your Spotify app client secret
  SPOTIFY_AUTH_CODE      Authorization code (for token command)
`);
}

function generateAuthUrl() {
  if (!CONFIG.clientId) {
    log.error('SPOTIFY_CLIENT_ID not found in .env');
    process.exit(1);
  }

  const url = new URL('https://accounts.spotify.com/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', CONFIG.clientId);
  url.searchParams.set('scope', CONFIG.scopes.join(' '));
  url.searchParams.set('redirect_uri', CONFIG.redirectUri);

  console.log(`\n${COLORS.green}Authorization URL:${COLORS.reset}\n`);
  console.log(`  ${url.toString()}\n`);

  log.info('Steps:');
  log.dim('  1. Open the URL above in your browser');
  log.dim('  2. Login and authorize the app');
  log.dim('  3. Copy the "code" parameter from redirect URL');
  log.dim('  4. Run: SPOTIFY_AUTH_CODE="your_code" node spotify-auth.js token\n');
}

async function exchangeToken() {
  const authCode = process.env.SPOTIFY_AUTH_CODE;

  if (!CONFIG.clientId || !CONFIG.clientSecret) {
    log.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env');
    process.exit(1);
  }

  if (!authCode) {
    log.error('Missing SPOTIFY_AUTH_CODE');
    log.dim('Usage: SPOTIFY_AUTH_CODE="your_code" node spotify-auth.js token');
    process.exit(1);
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${CONFIG.clientId}:${CONFIG.clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: CONFIG.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`${error.error}: ${error.error_description}`);
    }

    const data = await response.json();

    console.log(`\n${COLORS.green}Tokens Retrieved!${COLORS.reset}\n`);
    
    log.success('Access Token:');
    log.dim(`  ${data.access_token.substring(0, 50)}...`);
    
    console.log('');
    log.success('Refresh Token (SAVE THIS):');
    console.log(`\n  ${COLORS.cyan}${data.refresh_token}${COLORS.reset}\n`);

    log.info('Add to SPOTIFY_REFRESH_TOKENS in worker secrets:');
    log.dim('  {"spotify:user:YOUR_USER_ID":{"refreshToken":"TOKEN_HERE"}}');
    console.log('');
  } catch (error) {
    log.error(`Token exchange failed: ${error.message}`);
    
    if (error.message.includes('invalid_grant')) {
      log.warn('The authorization code may have expired or already been used.');
      log.dim('Run "node spotify-auth.js url" to get a new code.');
    }
    
    process.exit(1);
  }
}

// Main
const command = process.argv[2];

switch (command) {
  case 'url':
    generateAuthUrl();
    break;
  case 'token':
    exchangeToken();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    if (command) {
      log.error(`Unknown command: ${command}`);
    }
    showHelp();
    process.exit(command ? 1 : 0);
}
