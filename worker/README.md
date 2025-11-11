# Cloudflare Worker for Spotify Activity Tracker

This worker automatically fetches Spotify activity data and updates your GitHub repository every 10 minutes.

## Setup Instructions

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scopes:
   - ✅ `repo` (Full control)
4. Copy the token

### 4. Set Secrets

```bash
cd worker

# Set Spotify credentials
wrangler secret put SPOTIFY_CLIENT_ID
wrangler secret put SPOTIFY_CLIENT_SECRET

# Set Spotify refresh tokens (JSON format)
wrangler secret put SPOTIFY_REFRESH_TOKENS
# Example: {"spotify:user:USER_ID":{"refreshToken":"TOKEN"}}

# Set GitHub credentials
wrangler secret put GITHUB_TOKEN
# Paste your GitHub token

wrangler secret put GITHUB_REPO
# Format: username/repo-name
# Example: luzyver/Rezz-Spotify
```

### 5. Deploy Worker

```bash
npm install
wrangler deploy
```

### 6. Verify Deployment

After deployment, you'll get a URL like:
```
https://rezz-spotify-worker.YOUR_SUBDOMAIN.workers.dev
```

Visit `https://rezz-spotify-worker.YOUR_SUBDOMAIN.workers.dev/trigger` to manually trigger a fetch.

### 7. Check Cron Triggers

```bash
wrangler triggers
```

The worker will run automatically every 10 minutes.

## Configuration

### Change Cron Schedule

Edit `wrangler.toml`:

```toml
[triggers]
crons = ["*/10 * * * *"]  # Every 10 minutes
# crons = ["0 */1 * * *"]  # Every hour
# crons = ["0 */6 * * *"]  # Every 6 hours
```

Then redeploy:
```bash
wrangler deploy
```

## Monitoring

### View Logs (Real-time)

```bash
wrangler tail
```

### View Logs (Dashboard)

1. Go to: https://dash.cloudflare.com
2. Select **Workers & Pages**
3. Click your worker
4. Go to **Logs** tab

## Troubleshooting

### Check Secrets

```bash
wrangler secret list
```

### Test Locally

```bash
npm run dev
```

Then visit: http://localhost:8787/trigger

### Delete and Redeploy

```bash
wrangler delete rezz-spotify-worker
wrangler deploy
```

## Cost

Cloudflare Workers Free Tier:
- ✅ 100,000 requests/day
- ✅ 10ms CPU time per request
- ✅ Unlimited cron triggers

At 10-minute intervals: **144 requests/day** (well within free tier)

## Benefits Over GitHub Actions

1. ✅ **More generous free tier** (100k vs 2000 minutes)
2. ✅ **Unlimited cron triggers**
3. ✅ **No billing issues**
4. ✅ **Faster execution** (edge computing)
5. ✅ **Real-time logs**
6. ✅ **Better monitoring**

## Alternative: Manual Trigger

You can also trigger manually via HTTP:

```bash
curl https://rezz-spotify-worker.YOUR_SUBDOMAIN.workers.dev/trigger
```

Or visit the URL in your browser.
