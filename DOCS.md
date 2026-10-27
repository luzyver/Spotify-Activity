# 📖 Rezz Spotify - Documentation

Automated Spotify activity tracker that logs listening history and displays real-time "Now Playing" status.

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Spotify API   │────▶│ Cloudflare Worker│────▶│  GitHub Repo    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                        │
                               ▼                        ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │   Frontend App   │◀────│  History JSON   │
                        │ (SvelteKit + CF) │     │    Archives     │
                        └──────────────────┘     └─────────────────┘
```

## 📁 Project Structure

```
├── frontend/              # SvelteKit frontend app
│   ├── src/
│   │   ├── routes/        # Pages
│   │   └── lib/           # Components, utils, types
│   └── static/history/    # Daily history archives (JSON)
│
├── worker/                # Cloudflare Worker backend
│   └── src/
│       ├── handlers/      # API & cron handlers
│       ├── services/      # Spotify & GitHub API clients
│       └── utils/         # Data processing, encoding
│
├── script/                # CLI tools
│   ├── spotify-auth.js    # OAuth helper
│   └── generate-readme.js # README generator
│
└── .github/workflows/     # GitHub Actions
```

## 🔧 Setup

### Prerequisites
- Node.js 20+
- Cloudflare account
- Spotify Developer account
- GitHub account

### 1. Spotify App Setup
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create new app
3. Add redirect URI: `https://test.luzyver.dev/callback`
4. Copy Client ID and Client Secret

### 2. Get Refresh Token
```bash
cd script
npm install
cp .env.example .env  # Add your credentials

# Generate auth URL
node spotify-auth.js url

# After authorizing, exchange code for token
SPOTIFY_AUTH_CODE="your_code" node spotify-auth.js token
```

### 3. Deploy Worker
```bash
cd worker
npm install

# Set secrets
npx wrangler secret put SPOTIFY_CLIENT_ID
npx wrangler secret put SPOTIFY_CLIENT_SECRET
npx wrangler secret put SPOTIFY_REFRESH_TOKENS
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put GITHUB_REPO
npx wrangler secret put SUPABASE_ANON_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put TRIGGER_SECRET

# Deploy
npm run deploy
```

### 4. Deploy Frontend
```bash
cd frontend
npm install
npm run build
# Deploy to Cloudflare Pages
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/live` | GET | Currently playing tracks |
| `/api/history` | GET | Today's listening history |
| `/api/history/archive` | GET | Archived history from Supabase (`limit`, `offset`, `search`) |
| `/trigger` | GET | Manually trigger sync (requires `Authorization: Bearer <TRIGGER_SECRET>`) |
| `/` | GET | Health check |

## ⏰ Cron Jobs

| Schedule | Description |
|----------|-------------|
| `0 * * * *` | Hourly sync - fetch recent tracks |
| `1 17 * * *` | Daily clear - archive yesterday's history (00:01 GMT+7) |

## 🗄️ Data Storage

- **history.json** - Current day's listening history
- **last-clear.json** - Timestamp of last daily reset
- **frontend/static/history/*.json** - Daily archives (DDMMYYYY.json)

## 🛠️ Development

### Frontend
```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Production build
npm run check    # Type check
```

### Worker
```bash
cd worker
npm run dev      # Local dev with wrangler
npm run deploy   # Deploy to Cloudflare
```

## 📝 Environment Variables

### Worker Secrets
| Variable | Description |
|----------|-------------|
| `SPOTIFY_CLIENT_ID` | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Spotify app client secret |
| `SPOTIFY_REFRESH_TOKENS` | JSON object with user tokens |
| `GITHUB_TOKEN` | GitHub PAT with repo access |
| `GITHUB_REPO` | Repository (owner/repo) |
| `SUPABASE_ANON_KEY` | Supabase anon key (read-only access to the archive) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (used by the daily clear to archive history) |
| `TRIGGER_SECRET` | Random secret required to call `/trigger` |

### Token Format
```json
{
  "spotify:user:USER_ID": {
    "refreshToken": "AQB..."
  }
}
```

## 📄 License

MIT
