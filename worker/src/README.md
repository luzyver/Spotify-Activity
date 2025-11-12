# Worker Source Code Structure

Struktur ini dirancang agar lebih maintainable dengan memisahkan concern ke dalam modul-modul terpisah.

## 📁 Struktur Direktori

```
src/
├── index.js                    # Entry point utama worker
├── config/
│   └── constants.js            # Konstanta dan konfigurasi
├── services/
│   ├── spotify.js              # Spotify API integration
│   └── github.js               # GitHub API integration
├── handlers/
│   ├── sync-handler.js         # Handler untuk sync Spotify data
│   ├── clear-handler.js        # Handler untuk clear history
│   ├── clear-history-html.js   # HTML form untuk clear history
│   └── api-handler.js          # Handler untuk API endpoints
└── utils/
    ├── encoding.js             # UTF-8 dan Base64 encoding utilities
    ├── commit-messages.js      # Generator commit message
    └── data-processor.js       # Data processing dan transformasi
```

## 📦 Modul-Modul

### `index.js`
Entry point utama worker yang menangani routing dan delegasi ke handler yang tepat.

**Responsibilities:**
- Routing HTTP requests
- Handling scheduled cron triggers
- CORS handling
- Delegating to appropriate handlers

### `config/constants.js`
Konstanta dan konfigurasi terpusat.

**Exports:**
- `CORS_HEADERS` - CORS headers untuk semua response
- `CRON_SCHEDULES` - Jadwal cron untuk berbagai task
- `MESSAGES` - Template pesan response

### `services/spotify.js`
Integrasi dengan Spotify API.

**Functions:**
- `refreshAccessToken()` - Refresh access token
- `getUserProfile()` - Ambil profil user
- `getRecentlyPlayed()` - Ambil track yang baru diputar
- `getCurrentlyPlaying()` - Ambil track yang sedang diputar

### `services/github.js`
Integrasi dengan GitHub API untuk storage.

**Functions:**
- `getGitHubFile()` - Baca file dari GitHub
- `updateGitHubFile()` - Update satu file
- `updateMultipleGitHubFiles()` - Update banyak file dalam satu commit

### `handlers/sync-handler.js`
Handler untuk sinkronisasi data Spotify.

**Functions:**
- `handleScheduled()` - Proses sync terjadwal

### `handlers/clear-handler.js`
Handler untuk clear history.

**Functions:**
- `handleClearHistory()` - Clear history (scheduled)
- `handleClearHistoryEndpoint()` - Clear history dengan autentikasi

### `handlers/api-handler.js`
Handler untuk API endpoints.

**Functions:**
- `handleLiveAPI()` - Handle `/api/live` endpoint
- `handleHistoryAPI()` - Handle `/api/history` endpoint

### `utils/encoding.js`
Utilities untuk encoding/decoding.

**Functions:**
- `base64ToUtf8()` - Decode base64 ke UTF-8
- `utf8ToBase64()` - Encode UTF-8 ke base64
- `fixDoubleEncoding()` - Fix double-encoded strings (mojibake)

### `utils/commit-messages.js`
Generator untuk commit message yang variatif.

**Functions:**
- `getRandomCommitMessage()` - Generate commit message acak berdasarkan aktivitas

### `utils/data-processor.js`
Processing dan transformasi data.

**Functions:**
- `cleanHistory()` - Bersihkan history dari encoding issues
- `processRecentTracks()` - Proses recent tracks dari Spotify
- `processCurrentlyPlaying()` - Proses currently playing track
- `removeDuplicates()` - Hapus duplikat dari history
- `sortHistory()` - Sort history berdasarkan timestamp

## 🔄 Flow Eksekusi

### Scheduled Sync Flow
```
Cron Trigger
    ↓
index.js (handleScheduledEvent)
    ↓
sync-handler.js (handleScheduled)
    ├→ spotify.js (get data)
    ├→ data-processor.js (process data)
    └→ github.js (save data)
```

### Clear History Flow
```
Cron Trigger / HTTP Request
    ↓
index.js (handleScheduledEvent / handleFetch)
    ↓
clear-handler.js
    ├→ github.js (get current history)
    └→ github.js (clear history)
```

### API Request Flow
```
HTTP Request
    ↓
index.js (handleFetch)
    ↓
api-handler.js
    └→ github.js (get data)
```

## 🛠️ Maintenance Tips

### Menambah Endpoint Baru
1. Buat handler baru di `handlers/`
2. Import handler di `index.js`
3. Tambah route di `handleFetch()` function

### Menambah Service Integration Baru
1. Buat service file baru di `services/`
2. Export functions yang diperlukan
3. Import di handler yang membutuhkan

### Mengubah Data Processing Logic
1. Edit `utils/data-processor.js`
2. Pastikan tidak mengubah signature function yang sudah ada
3. Test dengan data existing

### Mengubah Commit Messages
1. Edit `utils/commit-messages.js`
2. Tambah atau ubah messages array
3. Test dengan deploy

## 🧪 Testing

Untuk test worker secara lokal:

```bash
# Development mode
npm run dev

# Test manual trigger
curl http://localhost:8787/trigger

# Test API endpoints
curl http://localhost:8787/api/live
curl http://localhost:8787/api/history
```

## 📝 Best Practices

1. **Separation of Concerns**: Setiap modul memiliki tanggung jawab yang jelas
2. **Reusability**: Functions dapat digunakan ulang di berbagai handler
3. **Maintainability**: Mudah untuk menemukan dan mengubah kode
4. **Testing**: Setiap modul dapat di-test secara independent
5. **Documentation**: Setiap function memiliki JSDoc comments

## 🔒 Security

- Environment variables tidak pernah di-log secara penuh
- Password protection untuk clear history endpoint
- CORS configuration untuk API endpoints
- Input validation di setiap handler

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [GitHub REST API](https://docs.github.com/en/rest)
