import { writable } from 'svelte/store';
import type { HistoryItem } from '$lib/types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
  category?: string;
}

export const achievements = writable<Achievement[]>([
  // Beginner Achievements
  {
    id: 'first-play',
    title: 'First Steps',
    description: 'Play your first track',
    icon: '🎵',
    unlocked: false,
    category: 'Beginner',
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Listen to 10 tracks',
    icon: '🎧',
    unlocked: false,
    progress: 0,
    target: 10,
    category: 'Beginner',
  },
  {
    id: 'music-lover',
    title: 'Music Lover',
    description: 'Listen to 50 tracks',
    icon: '❤️',
    unlocked: false,
    progress: 0,
    target: 50,
    category: 'Beginner',
  },
  {
    id: 'marathon',
    title: 'Marathon Listener',
    description: 'Listen to 100 tracks',
    icon: '🏃',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'Progressive',
  },
  {
    id: 'super-fan',
    title: 'Super Fan',
    description: 'Listen to 500 tracks',
    icon: '⭐',
    unlocked: false,
    progress: 0,
    target: 500,
    category: 'Progressive',
  },
  {
    id: 'legend',
    title: 'Legend',
    description: 'Listen to 1000 tracks',
    icon: '👑',
    unlocked: false,
    progress: 0,
    target: 1000,
    category: 'Progressive',
  },
  {
    id: 'elite',
    title: 'Elite Listener',
    description: 'Listen to 2500 tracks',
    icon: '💫',
    unlocked: false,
    progress: 0,
    target: 2500,
    category: 'Progressive',
  },
  {
    id: 'master',
    title: 'Music Master',
    description: 'Listen to 5000 tracks',
    icon: '🏆',
    unlocked: false,
    progress: 0,
    target: 5000,
    category: 'Progressive',
  },
  {
    id: 'immortal',
    title: 'Immortal',
    description: 'Listen to 10000 tracks',
    icon: '♾️',
    unlocked: false,
    progress: 0,
    target: 10000,
    category: 'Progressive',
  },

  // Time-based Achievements
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Listen to music between 12 AM - 4 AM',
    icon: '🦉',
    unlocked: false,
    category: 'Time-based',
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Listen to music between 5 AM - 7 AM',
    icon: '🐦',
    unlocked: false,
    category: 'Time-based',
  },
  {
    id: 'morning-person',
    title: 'Morning Person',
    description: 'Listen to 100 tracks in the morning (7 AM - 12 PM)',
    icon: '🌅',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'Time-based',
  },
  {
    id: 'afternoon-vibes',
    title: 'Afternoon Vibes',
    description: 'Listen to 50 tracks in the afternoon (12 PM - 6 PM)',
    icon: '☀️',
    unlocked: false,
    progress: 0,
    target: 50,
    category: 'Time-based',
  },
  {
    id: 'evening-mood',
    title: 'Evening Mood',
    description: 'Listen to 100 tracks in the evening (6 PM - 10 PM)',
    icon: '🌆',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'Time-based',
  },
  {
    id: 'midnight-session',
    title: 'Midnight Session',
    description: 'Listen to 50 tracks between 10 PM - 12 AM',
    icon: '🌙',
    unlocked: false,
    progress: 0,
    target: 50,
    category: 'Time-based',
  },
  {
    id: 'weekend-warrior',
    title: 'Weekend Warrior',
    description: 'Listen to 100 tracks on weekends',
    icon: '🎉',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'Time-based',
  },
  {
    id: 'weekday-grind',
    title: 'Weekday Grind',
    description: 'Listen to 200 tracks on weekdays',
    icon: '💼',
    unlocked: false,
    progress: 0,
    target: 200,
    category: 'Time-based',
  },

  // Streak Achievements
  {
    id: 'three-day-streak',
    title: 'Consistency',
    description: 'Listen to music for 3 consecutive days',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    target: 3,
    category: 'Streak',
  },
  {
    id: 'week-streak',
    title: 'Week Warrior',
    description: 'Listen to music for 7 consecutive days',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    target: 7,
    category: 'Streak',
  },
  {
    id: 'two-week-streak',
    title: 'Dedicated',
    description: 'Listen to music for 14 consecutive days',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    target: 14,
    category: 'Streak',
  },
  {
    id: 'month-streak',
    title: 'Monthly Master',
    description: 'Listen to music for 30 consecutive days',
    icon: '📅',
    unlocked: false,
    progress: 0,
    target: 30,
    category: 'Streak',
  },
  {
    id: 'quarter-streak',
    title: 'Unstoppable',
    description: 'Listen to music for 90 consecutive days',
    icon: '💪',
    unlocked: false,
    progress: 0,
    target: 90,
    category: 'Streak',
  },
  {
    id: 'half-year-streak',
    title: 'Committed',
    description: 'Listen to music for 180 consecutive days',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    target: 180,
    category: 'Streak',
  },
  {
    id: 'year-streak',
    title: 'Eternal Flame',
    description: 'Listen to music for 365 consecutive days',
    icon: '🌟',
    unlocked: false,
    progress: 0,
    target: 365,
    category: 'Streak',
  },

  // Discovery Achievements
  {
    id: 'genre-explorer',
    title: 'Genre Explorer',
    description: 'Listen to 10 different artists',
    icon: '🗺️',
    unlocked: false,
    progress: 0,
    target: 10,
    category: 'Discovery',
  },
  {
    id: 'music-explorer',
    title: 'Music Explorer',
    description: 'Listen to 25 different artists',
    icon: '🧭',
    unlocked: false,
    progress: 0,
    target: 25,
    category: 'Discovery',
  },
  {
    id: 'diversity-champion',
    title: 'Diversity Champion',
    description: 'Listen to 50 different artists',
    icon: '🌍',
    unlocked: false,
    progress: 0,
    target: 50,
    category: 'Discovery',
  },
  {
    id: 'world-traveler',
    title: 'World Traveler',
    description: 'Listen to 100 different artists',
    icon: '✈️',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'Discovery',
  },
  {
    id: 'music-connoisseur',
    title: 'Music Connoisseur',
    description: 'Listen to 200 different artists',
    icon: '🎩',
    unlocked: false,
    progress: 0,
    target: 200,
    category: 'Discovery',
  },
  {
    id: 'track-collector',
    title: 'Track Collector',
    description: 'Listen to 100 unique tracks',
    icon: '💿',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'Discovery',
  },
  {
    id: 'track-hoarder',
    title: 'Track Hoarder',
    description: 'Listen to 500 unique tracks',
    icon: '📀',
    unlocked: false,
    progress: 0,
    target: 500,
    category: 'Discovery',
  },
  {
    id: 'track-master',
    title: 'Track Master',
    description: 'Listen to 1000 unique tracks',
    icon: '💽',
    unlocked: false,
    progress: 0,
    target: 1000,
    category: 'Discovery',
  },

  // Loyalty Achievements
  {
    id: 'loyal-fan',
    title: 'Loyal Fan',
    description: 'Play the same track 10 times',
    icon: '💚',
    unlocked: false,
    progress: 0,
    target: 10,
    category: 'Loyalty',
  },
  {
    id: 'super-loyal',
    title: 'Super Loyal',
    description: 'Play the same track 25 times',
    icon: '💎',
    unlocked: false,
    progress: 0,
    target: 25,
    category: 'Loyalty',
  },
  {
    id: 'obsessed',
    title: 'Obsessed',
    description: 'Play the same track 50 times',
    icon: '🔮',
    unlocked: false,
    progress: 0,
    target: 50,
    category: 'Loyalty',
  },
  {
    id: 'anthem',
    title: 'Personal Anthem',
    description: 'Play the same track 100 times',
    icon: '🎺',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'Loyalty',
  },
  {
    id: 'artist-fan',
    title: 'Artist Fan',
    description: 'Listen to the same artist 25 times',
    icon: '🎸',
    unlocked: false,
    progress: 0,
    target: 25,
    category: 'Loyalty',
  },
  {
    id: 'artist-devotee',
    title: 'Artist Devotee',
    description: 'Listen to the same artist 50 times',
    icon: '🎤',
    unlocked: false,
    progress: 0,
    target: 50,
    category: 'Loyalty',
  },
  {
    id: 'superfan',
    title: 'Superfan',
    description: 'Listen to the same artist 100 times',
    icon: '🌟',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'Loyalty',
  },
  {
    id: 'stan',
    title: 'Stan',
    description: 'Listen to the same artist 250 times',
    icon: '👑',
    unlocked: false,
    progress: 0,
    target: 250,
    category: 'Loyalty',
  },

  // Special Achievements
  {
    id: 'variety-seeker',
    title: 'Variety Seeker',
    description: 'No repeat artists in 20 consecutive plays',
    icon: '🎲',
    unlocked: false,
    category: 'Special',
  },
  {
    id: 'binge-listener',
    title: 'Binge Listener',
    description: 'Listen to 50 tracks in a single day',
    icon: '🍿',
    unlocked: false,
    progress: 0,
    target: 50,
    category: 'Special',
  },
  {
    id: 'mega-binge',
    title: 'Mega Binge',
    description: 'Listen to 100 tracks in a single day',
    icon: '🎬',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'Special',
  },
  {
    id: 'party-starter',
    title: 'Party Starter',
    description: 'Listen to 20 tracks in an hour',
    icon: '🎊',
    unlocked: false,
    category: 'Special',
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Listen to 30 tracks in an hour',
    icon: '⚡',
    unlocked: false,
    category: 'Special',
  },
  {
    id: 'shuffle-master',
    title: 'Shuffle Master',
    description: 'Listen to 50 different tracks in a row',
    icon: '🔀',
    unlocked: false,
    category: 'Special',
  },
  {
    id: 'repeat-mode',
    title: 'Repeat Mode',
    description: 'Play the same track 5 times in a row',
    icon: '🔁',
    unlocked: false,
    category: 'Special',
  },

  // Milestone Achievements
  {
    id: 'first-week',
    title: 'First Week',
    description: 'Complete your first week of listening',
    icon: '📆',
    unlocked: false,
    category: 'Milestone',
  },
  {
    id: 'first-month',
    title: 'First Month',
    description: 'Complete your first month of listening',
    icon: '📅',
    unlocked: false,
    category: 'Milestone',
  },
  {
    id: 'hundred-hours',
    title: '100 Hours',
    description: 'Listen to 100 hours of music (≈2000 tracks)',
    icon: '⏰',
    unlocked: false,
    progress: 0,
    target: 2000,
    category: 'Milestone',
  },
  {
    id: 'five-hundred-hours',
    title: '500 Hours',
    description: 'Listen to 500 hours of music (≈10000 tracks)',
    icon: '⏳',
    unlocked: false,
    progress: 0,
    target: 10000,
    category: 'Milestone',
  },

  // Seasonal Achievements
  {
    id: 'spring-vibes',
    title: 'Spring Vibes',
    description: 'Listen to 100 tracks in March-May',
    icon: '🌸',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'Seasonal',
  },
  {
    id: 'summer-hits',
    title: 'Summer Hits',
    description: 'Listen to 100 tracks in June-August',
    icon: '🌞',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'Seasonal',
  },
  {
    id: 'autumn-mood',
    title: 'Autumn Mood',
    description: 'Listen to 100 tracks in September-November',
    icon: '🍂',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'Seasonal',
  },
  {
    id: 'winter-warmth',
    title: 'Winter Warmth',
    description: 'Listen to 100 tracks in December-February',
    icon: '❄️',
    unlocked: false,
    progress: 0,
    target: 100,
    category: 'Seasonal',
  },

  // Combo Achievements
  {
    id: 'triple-threat',
    title: 'Triple Threat',
    description: 'Listen to music in morning, afternoon, and night in one day',
    icon: '🎯',
    unlocked: false,
    category: 'Combo',
  },
  {
    id: 'full-spectrum',
    title: 'Full Spectrum',
    description: 'Listen to music every day of the week',
    icon: '🌈',
    unlocked: false,
    category: 'Combo',
  },
  {
    id: 'balanced-listener',
    title: 'Balanced Listener',
    description: 'Have at least 10 plays in each time period (morning/afternoon/evening/night)',
    icon: '⚖️',
    unlocked: false,
    category: 'Combo',
  },
  {
    id: 'explorer-loyalist',
    title: 'Explorer & Loyalist',
    description: 'Listen to 50 different artists AND play one track 20 times',
    icon: '🎭',
    unlocked: false,
    category: 'Combo',
  },
]);

export function checkAchievements(history: HistoryItem[]) {
  achievements.update((current) => {
    const updated = [...current];
    const totalPlays = history.length;

    // Helper function to update achievement
    const updateAch = (id: string, progress: number, target: number) => {
      const ach = updated.find((a) => a.id === id);
      if (ach) {
        ach.progress = progress;
        ach.unlocked = progress >= target;
      }
    };

    // Beginner & Progressive Achievements
    if (totalPlays > 0) {
      const firstPlay = updated.find((a) => a.id === 'first-play');
      if (firstPlay) firstPlay.unlocked = true;
    }
    updateAch('getting-started', totalPlays, 10);
    updateAch('music-lover', totalPlays, 50);
    updateAch('marathon', totalPlays, 100);
    updateAch('super-fan', totalPlays, 500);
    updateAch('legend', totalPlays, 1000);
    updateAch('elite', totalPlays, 2500);
    updateAch('master', totalPlays, 5000);
    updateAch('immortal', totalPlays, 10000);

    // Time-based Achievements
    const nightOwlPlays = history.filter((item) => {
      const hour = new Date(item.timestamp).getHours();
      return hour >= 0 && hour < 4;
    }).length;
    const earlyBirdPlays = history.filter((item) => {
      const hour = new Date(item.timestamp).getHours();
      return hour >= 5 && hour < 7;
    }).length;
    const morningPlays = history.filter((item) => {
      const hour = new Date(item.timestamp).getHours();
      return hour >= 7 && hour < 12;
    }).length;
    const afternoonPlays = history.filter((item) => {
      const hour = new Date(item.timestamp).getHours();
      return hour >= 12 && hour < 18;
    }).length;
    const eveningPlays = history.filter((item) => {
      const hour = new Date(item.timestamp).getHours();
      return hour >= 18 && hour < 22;
    }).length;
    const midnightPlays = history.filter((item) => {
      const hour = new Date(item.timestamp).getHours();
      return hour >= 22 && hour < 24;
    }).length;
    const weekendPlays = history.filter((item) => {
      const day = new Date(item.timestamp).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    }).length;
    const weekdayPlays = history.filter((item) => {
      const day = new Date(item.timestamp).getDay();
      return day >= 1 && day <= 5; // Monday to Friday
    }).length;

    const nightOwlAch = updated.find((a) => a.id === 'night-owl');
    if (nightOwlAch) nightOwlAch.unlocked = nightOwlPlays > 0;
    const earlyBirdAch = updated.find((a) => a.id === 'early-bird');
    if (earlyBirdAch) earlyBirdAch.unlocked = earlyBirdPlays > 0;
    updateAch('morning-person', morningPlays, 100);
    updateAch('afternoon-vibes', afternoonPlays, 50);
    updateAch('evening-mood', eveningPlays, 100);
    updateAch('midnight-session', midnightPlays, 50);
    updateAch('weekend-warrior', weekendPlays, 100);
    updateAch('weekday-grind', weekdayPlays, 200);

    // Streak Achievements
    const dateStrings = history
      .map((h) => new Date(h.timestamp).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i);
    const dates = dateStrings.map((d) => new Date(d)).sort((a, b) => a.getTime() - b.getTime());

    let streak = dates.length > 0 ? 1 : 0;
    let maxStreak = streak;
    for (let i = 1; i < dates.length; i++) {
      const diff = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }
    updateAch('three-day-streak', maxStreak, 3);
    updateAch('week-streak', maxStreak, 7);
    updateAch('two-week-streak', maxStreak, 14);
    updateAch('month-streak', maxStreak, 30);
    updateAch('quarter-streak', maxStreak, 90);
    updateAch('half-year-streak', maxStreak, 180);
    updateAch('year-streak', maxStreak, 365);

    // Discovery Achievements
    const uniqueArtists = new Set(history.map((h) => h.artist)).size;
    const uniqueTracks = new Set(history.map((h) => h.uri)).size;
    updateAch('genre-explorer', uniqueArtists, 10);
    updateAch('music-explorer', uniqueArtists, 25);
    updateAch('diversity-champion', uniqueArtists, 50);
    updateAch('world-traveler', uniqueArtists, 100);
    updateAch('music-connoisseur', uniqueArtists, 200);
    updateAch('track-collector', uniqueTracks, 100);
    updateAch('track-hoarder', uniqueTracks, 500);
    updateAch('track-master', uniqueTracks, 1000);

    // Loyalty Achievements
    const trackCounts = history.reduce(
      (acc, item) => {
        acc[item.track] = (acc[item.track] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const artistCounts = history.reduce(
      (acc, item) => {
        acc[item.artist] = (acc[item.artist] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const maxTrackPlays = Math.max(...Object.values(trackCounts), 0);
    const maxArtistPlays = Math.max(...Object.values(artistCounts), 0);
    updateAch('loyal-fan', maxTrackPlays, 10);
    updateAch('super-loyal', maxTrackPlays, 25);
    updateAch('obsessed', maxTrackPlays, 50);
    updateAch('anthem', maxTrackPlays, 100);
    updateAch('artist-fan', maxArtistPlays, 25);
    updateAch('artist-devotee', maxArtistPlays, 50);
    updateAch('superfan', maxArtistPlays, 100);
    updateAch('stan', maxArtistPlays, 250);

    // Special Achievements
    // Variety Seeker - check last 20 plays for no repeats
    if (history.length >= 20) {
      const last20 = history.slice(-20);
      const last20Artists = new Set(last20.map((h) => h.artist));
      const varietySeeker = updated.find((a) => a.id === 'variety-seeker');
      if (varietySeeker) varietySeeker.unlocked = last20Artists.size === 20;
    }

    // Binge Listener - 50 tracks in one day
    const dailyCounts: Record<string, number> = {};
    history.forEach((item) => {
      const date = new Date(item.timestamp).toDateString();
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    const maxDailyPlays = Math.max(...Object.values(dailyCounts), 0);
    updateAch('binge-listener', maxDailyPlays, 50);
    updateAch('mega-binge', maxDailyPlays, 100);

    // Party Starter & Speed Demon - tracks in an hour
    const hourCounts: Record<string, number> = {};
    history.forEach((item) => {
      const date = new Date(item.timestamp);
      const hourKey = `${date.toDateString()}-${date.getHours()}`;
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    });
    const maxHourlyPlays = Math.max(...Object.values(hourCounts), 0);
    const partyStarter = updated.find((a) => a.id === 'party-starter');
    if (partyStarter) partyStarter.unlocked = maxHourlyPlays >= 20;
    const speedDemon = updated.find((a) => a.id === 'speed-demon');
    if (speedDemon) speedDemon.unlocked = maxHourlyPlays >= 30;

    // Shuffle Master - 50 different tracks in a row
    if (history.length >= 50) {
      const last50 = history.slice(-50);
      const last50Tracks = new Set(last50.map((h) => h.uri));
      const shuffleMaster = updated.find((a) => a.id === 'shuffle-master');
      if (shuffleMaster) shuffleMaster.unlocked = last50Tracks.size === 50;
    }

    // Repeat Mode - same track 5 times in a row
    let repeatMode = false;
    for (let i = 0; i <= history.length - 5; i++) {
      const fiveInRow = history.slice(i, i + 5);
      if (new Set(fiveInRow.map((h) => h.uri)).size === 1) {
        repeatMode = true;
        break;
      }
    }
    const repeatModeAch = updated.find((a) => a.id === 'repeat-mode');
    if (repeatModeAch) repeatModeAch.unlocked = repeatMode;

    // Milestone Achievements
    if (dates.length >= 7) {
      const firstWeek = updated.find((a) => a.id === 'first-week');
      if (firstWeek) firstWeek.unlocked = true;
    }
    if (dates.length >= 30) {
      const firstMonth = updated.find((a) => a.id === 'first-month');
      if (firstMonth) firstMonth.unlocked = true;
    }
    updateAch('hundred-hours', totalPlays, 2000);
    updateAch('five-hundred-hours', totalPlays, 10000);

    // Seasonal Achievements
    const springPlays = history.filter((item) => {
      const month = new Date(item.timestamp).getMonth();
      return month >= 2 && month <= 4; // March-May (0-indexed)
    }).length;
    const summerPlays = history.filter((item) => {
      const month = new Date(item.timestamp).getMonth();
      return month >= 5 && month <= 7; // June-August
    }).length;
    const autumnPlays = history.filter((item) => {
      const month = new Date(item.timestamp).getMonth();
      return month >= 8 && month <= 10; // September-November
    }).length;
    const winterPlays = history.filter((item) => {
      const month = new Date(item.timestamp).getMonth();
      return month === 11 || month <= 1; // December-February
    }).length;
    updateAch('spring-vibes', springPlays, 100);
    updateAch('summer-hits', summerPlays, 100);
    updateAch('autumn-mood', autumnPlays, 100);
    updateAch('winter-warmth', winterPlays, 100);

    // Combo Achievements
    // Triple Threat - listen in morning, afternoon, and night in one day
    const dayPeriods: Record<string, Set<string>> = {};
    history.forEach((item) => {
      const date = new Date(item.timestamp);
      const dateStr = date.toDateString();
      const hour = date.getHours();
      if (!dayPeriods[dateStr]) dayPeriods[dateStr] = new Set();

      if (hour >= 5 && hour < 12) dayPeriods[dateStr].add('morning');
      else if (hour >= 12 && hour < 18) dayPeriods[dateStr].add('afternoon');
      else if (hour >= 18 || hour < 5) dayPeriods[dateStr].add('night');
    });
    const hasTripleThreat = Object.values(dayPeriods).some((periods) => periods.size >= 3);
    const tripleThreat = updated.find((a) => a.id === 'triple-threat');
    if (tripleThreat) tripleThreat.unlocked = hasTripleThreat;

    // Full Spectrum - listen every day of the week
    const daysOfWeek = new Set(history.map((h) => new Date(h.timestamp).getDay()));
    const fullSpectrum = updated.find((a) => a.id === 'full-spectrum');
    if (fullSpectrum) fullSpectrum.unlocked = daysOfWeek.size === 7;

    // Balanced Listener - at least 10 plays in each time period
    const morningCount = morningPlays + earlyBirdPlays;
    const nightCount = nightOwlPlays + midnightPlays;
    const balancedListener = updated.find((a) => a.id === 'balanced-listener');
    if (balancedListener) {
      balancedListener.unlocked =
        morningCount >= 10 && afternoonPlays >= 10 && eveningPlays >= 10 && nightCount >= 10;
    }

    // Explorer & Loyalist - 50 different artists AND one track 20 times
    const explorerLoyalist = updated.find((a) => a.id === 'explorer-loyalist');
    if (explorerLoyalist) {
      explorerLoyalist.unlocked = uniqueArtists >= 50 && maxTrackPlays >= 20;
    }

    return updated;
  });
}
