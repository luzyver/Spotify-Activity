# Goals & Achievements System

## Overview
Sistem gamifikasi untuk Spotify Activity Tracker dengan 2 komponen utama:
- **Goals**: Target jangka pendek yang dapat di-reset (daily/weekly/monthly)
- **Achievements**: Pencapaian permanen yang unlock sekali saja

---

## 🎯 GOALS (23 Goals Total)

Goals adalah target yang dapat di-reset secara otomatis berdasarkan periode waktu.

### Daily Goals (5 goals)
1. **Daily Listener** - Listen to 10 tracks today
2. **Artist Explorer** - Listen to 5 different artists today
3. **Variety Today** - Listen to 8 unique tracks today
4. **Morning Routine** - Listen to 3 tracks before noon
5. **Evening Unwind** - Listen to 5 tracks after 6 PM

### Weekly Goals (6 goals)
1. **Weekly Warrior** - Listen to 50 tracks this week
2. **Artist Discovery** - Listen to 15 different artists this week
3. **Consistency** - Listen to music every day this week
4. **Track Variety** - Listen to 30 unique tracks this week
5. **Weekend Vibes** - Listen to 20 tracks on the weekend
6. **Loyal Fan** - Play your favorite artist 10 times this week

### Monthly Goals (8 goals)
1. **Monthly Master** - Listen to 200 tracks this month
2. **Genre Explorer** - Listen to 40 different artists this month
3. **Track Collector** - Listen to 100 unique tracks this month
4. **Dedication** - Listen to music for 20 days this month
5. **Time Investment** - Listen to 10 hours of music (≈200 tracks)
6. **New Discoveries** - Listen to 20 artists you haven't heard before
7. **Diverse Taste** - Listen to music in all time periods
8. **Power Listener** - Have at least one day with 30+ tracks

---

## 🏆 ACHIEVEMENTS (65 Achievements Total)

Achievements adalah pencapaian permanen yang unlock sekali saja.

### Beginner & Progressive (9 achievements)
1. **First Steps** 🎵 - Play your first track
2. **Getting Started** 🎧 - Listen to 10 tracks
3. **Music Lover** ❤️ - Listen to 50 tracks
4. **Marathon Listener** 🏃 - Listen to 100 tracks
5. **Super Fan** ⭐ - Listen to 500 tracks
6. **Legend** 👑 - Listen to 1000 tracks
7. **Elite Listener** 💫 - Listen to 2500 tracks
8. **Music Master** 🏆 - Listen to 5000 tracks
9. **Immortal** ♾️ - Listen to 10000 tracks

### Time-based (8 achievements)
1. **Night Owl** 🦉 - Listen between 12 AM - 4 AM
2. **Early Bird** 🐦 - Listen between 5 AM - 7 AM
3. **Morning Person** 🌅 - 100 tracks in morning (7 AM - 12 PM)
4. **Afternoon Vibes** ☀️ - 50 tracks in afternoon (12 PM - 6 PM)
5. **Evening Mood** 🌆 - 100 tracks in evening (6 PM - 10 PM)
6. **Midnight Session** 🌙 - 50 tracks between 10 PM - 12 AM
7. **Weekend Warrior** 🎉 - 100 tracks on weekends
8. **Weekday Grind** 💼 - 200 tracks on weekdays

### Streak (7 achievements)
1. **Consistency** 🔥 - 3 consecutive days
2. **Week Warrior** 🔥 - 7 consecutive days
3. **Dedicated** 🔥 - 14 consecutive days
4. **Monthly Master** 📅 - 30 consecutive days
5. **Unstoppable** 💪 - 90 consecutive days
6. **Committed** 🎯 - 180 consecutive days
7. **Eternal Flame** 🌟 - 365 consecutive days

### Discovery (8 achievements)
1. **Genre Explorer** 🗺️ - 10 different artists
2. **Music Explorer** 🧭 - 25 different artists
3. **Diversity Champion** 🌍 - 50 different artists
4. **World Traveler** ✈️ - 100 different artists
5. **Music Connoisseur** 🎩 - 200 different artists
6. **Track Collector** 💿 - 100 unique tracks
7. **Track Hoarder** 📀 - 500 unique tracks
8. **Track Master** 💽 - 1000 unique tracks

### Loyalty (8 achievements)
1. **Loyal Fan** 💚 - Play same track 10 times
2. **Super Loyal** 💎 - Play same track 25 times
3. **Obsessed** 🔮 - Play same track 50 times
4. **Personal Anthem** 🎺 - Play same track 100 times
5. **Artist Fan** 🎸 - Listen to same artist 25 times
6. **Artist Devotee** 🎤 - Listen to same artist 50 times
7. **Superfan** 🌟 - Listen to same artist 100 times
8. **Stan** 👑 - Listen to same artist 250 times

### Special (7 achievements)
1. **Variety Seeker** 🎲 - No repeat artists in 20 consecutive plays
2. **Binge Listener** 🍿 - 50 tracks in a single day
3. **Mega Binge** 🎬 - 100 tracks in a single day
4. **Party Starter** 🎊 - 20 tracks in an hour
5. **Speed Demon** ⚡ - 30 tracks in an hour
6. **Shuffle Master** 🔀 - 50 different tracks in a row
7. **Repeat Mode** 🔁 - Same track 5 times in a row

### Milestone (4 achievements)
1. **First Week** 📆 - Complete first week of listening
2. **First Month** 📅 - Complete first month of listening
3. **100 Hours** ⏰ - Listen to ≈2000 tracks
4. **500 Hours** ⏳ - Listen to ≈10000 tracks

### Seasonal (4 achievements)
1. **Spring Vibes** 🌸 - 100 tracks in March-May
2. **Summer Hits** 🌞 - 100 tracks in June-August
3. **Autumn Mood** 🍂 - 100 tracks in September-November
4. **Winter Warmth** ❄️ - 100 tracks in December-February

### Combo (4 achievements)
1. **Triple Threat** 🎯 - Listen in morning, afternoon, and night in one day
2. **Full Spectrum** 🌈 - Listen every day of the week
3. **Balanced Listener** ⚖️ - 10+ plays in each time period
4. **Explorer & Loyalist** 🎭 - 50 different artists AND one track 20 times

---

## Technical Implementation

### Files Created/Modified:
1. `frontend/src/lib/stores/goals.ts` - Goals store and logic
2. `frontend/src/lib/stores/achievements.ts` - Achievements store (updated)
3. `frontend/src/lib/components/GoalsCard.svelte` - Goals UI component
4. `frontend/src/routes/+page.svelte` - Main page (updated to include goals)

### Key Features:
- **Auto-reset**: Goals automatically reset based on their period (daily/weekly/monthly)
- **Progress tracking**: Both goals and achievements show progress bars
- **Category filtering**: Goals can be filtered by Daily/Weekly/Monthly tabs
- **Real-time updates**: Both systems update automatically when history changes
- **Responsive design**: Mobile-friendly UI with proper breakpoints

### Usage:
```typescript
import { goals, checkGoals } from '$lib/stores/goals';
import { achievements, checkAchievements } from '$lib/stores/achievements';

// Check and update goals
checkGoals(historyData, allHistoryData);

// Check and update achievements
checkAchievements(historyData);
```

---

## Summary
- **Total Goals**: 23 (5 daily + 6 weekly + 8 monthly + 4 special)
- **Total Achievements**: 65 across 9 categories
- **Auto-reset**: Goals reset automatically based on period
- **Progress tracking**: Visual progress bars for all goals and achievements
- **Mobile-friendly**: Responsive design with tabs and proper spacing
