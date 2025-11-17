import { writable } from 'svelte/store';
import type { HistoryItem } from '$lib/types';

export interface Goal {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  completed: boolean;
  type: 'daily' | 'weekly' | 'monthly';
  category: string;
  resetDate?: string;
}

export const goals = writable<Goal[]>([
  // Daily Goals
  {
    id: 'daily-tracks',
    title: 'Daily Listener',
    description: 'Listen to 10 tracks today',
    icon: '🎵',
    progress: 0,
    target: 10,
    completed: false,
    type: 'daily',
    category: 'Daily',
  },
  {
    id: 'daily-artists',
    title: 'Artist Explorer',
    description: 'Listen to 5 different artists today',
    icon: '🎨',
    progress: 0,
    target: 5,
    completed: false,
    type: 'daily',
    category: 'Daily',
  },
  {
    id: 'daily-unique',
    title: 'Variety Today',
    description: 'Listen to 8 unique tracks today',
    icon: '🎲',
    progress: 0,
    target: 8,
    completed: false,
    type: 'daily',
    category: 'Daily',
  },
  {
    id: 'daily-morning',
    title: 'Morning Routine',
    description: 'Listen to 3 tracks before noon',
    icon: '🌅',
    progress: 0,
    target: 3,
    completed: false,
    type: 'daily',
    category: 'Daily',
  },
  {
    id: 'daily-evening',
    title: 'Evening Unwind',
    description: 'Listen to 5 tracks after 6 PM',
    icon: '🌆',
    progress: 0,
    target: 5,
    completed: false,
    type: 'daily',
    category: 'Daily',
  },

  // Weekly Goals
  {
    id: 'weekly-tracks',
    title: 'Weekly Warrior',
    description: 'Listen to 50 tracks this week',
    icon: '🎧',
    progress: 0,
    target: 50,
    completed: false,
    type: 'weekly',
    category: 'Weekly',
  },
  {
    id: 'weekly-artists',
    title: 'Artist Discovery',
    description: 'Listen to 15 different artists this week',
    icon: '🗺️',
    progress: 0,
    target: 15,
    completed: false,
    type: 'weekly',
    category: 'Weekly',
  },
  {
    id: 'weekly-streak',
    title: 'Consistency',
    description: 'Listen to music every day this week',
    icon: '🔥',
    progress: 0,
    target: 7,
    completed: false,
    type: 'weekly',
    category: 'Weekly',
  },
  {
    id: 'weekly-unique',
    title: 'Track Variety',
    description: 'Listen to 30 unique tracks this week',
    icon: '💿',
    progress: 0,
    target: 30,
    completed: false,
    type: 'weekly',
    category: 'Weekly',
  },
  {
    id: 'weekly-weekend',
    title: 'Weekend Vibes',
    description: 'Listen to 20 tracks on the weekend',
    icon: '🎉',
    progress: 0,
    target: 20,
    completed: false,
    type: 'weekly',
    category: 'Weekly',
  },
  {
    id: 'weekly-favorite',
    title: 'Loyal Fan',
    description: 'Play your favorite artist 10 times this week',
    icon: '💚',
    progress: 0,
    target: 10,
    completed: false,
    type: 'weekly',
    category: 'Weekly',
  },

  // Monthly Goals
  {
    id: 'monthly-tracks',
    title: 'Monthly Master',
    description: 'Listen to 200 tracks this month',
    icon: '🏆',
    progress: 0,
    target: 200,
    completed: false,
    type: 'monthly',
    category: 'Monthly',
  },
  {
    id: 'monthly-artists',
    title: 'Genre Explorer',
    description: 'Listen to 40 different artists this month',
    icon: '🌍',
    progress: 0,
    target: 40,
    completed: false,
    type: 'monthly',
    category: 'Monthly',
  },
  {
    id: 'monthly-unique',
    title: 'Track Collector',
    description: 'Listen to 100 unique tracks this month',
    icon: '📀',
    progress: 0,
    target: 100,
    completed: false,
    type: 'monthly',
    category: 'Monthly',
  },
  {
    id: 'monthly-streak',
    title: 'Dedication',
    description: 'Listen to music for 20 days this month',
    icon: '📅',
    progress: 0,
    target: 20,
    completed: false,
    type: 'monthly',
    category: 'Monthly',
  },
  {
    id: 'monthly-hours',
    title: 'Time Investment',
    description: 'Listen to 10 hours of music (≈200 tracks)',
    icon: '⏰',
    progress: 0,
    target: 200,
    completed: false,
    type: 'monthly',
    category: 'Monthly',
  },
  {
    id: 'monthly-discovery',
    title: 'New Discoveries',
    description: "Listen to 20 artists you haven't heard before",
    icon: '🔍',
    progress: 0,
    target: 20,
    completed: false,
    type: 'monthly',
    category: 'Monthly',
  },
  {
    id: 'monthly-variety',
    title: 'Diverse Taste',
    description: 'Listen to music in all time periods (morning/afternoon/evening/night)',
    icon: '🌈',
    progress: 0,
    target: 4,
    completed: false,
    type: 'monthly',
    category: 'Monthly',
  },
  {
    id: 'monthly-binge',
    title: 'Power Listener',
    description: 'Have at least one day with 30+ tracks',
    icon: '🍿',
    progress: 0,
    target: 30,
    completed: false,
    type: 'monthly',
    category: 'Monthly',
  },
]);

// Helper function to get start of day/week/month
function getStartOfPeriod(type: 'daily' | 'weekly' | 'monthly'): Date {
  const now = new Date();
  const start = new Date(now);

  if (type === 'daily') {
    start.setHours(0, 0, 0, 0);
  } else if (type === 'weekly') {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
  } else if (type === 'monthly') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }

  return start;
}

// Track previous artists for discovery goal
let previousMonthArtists = new Set<string>();

export function checkGoals(history: HistoryItem[], allHistory?: HistoryItem[]) {
  goals.update((current) => {
    const updated = [...current];
    const now = new Date();

    // Filter history by period
    const filterByPeriod = (type: 'daily' | 'weekly' | 'monthly') => {
      const start = getStartOfPeriod(type);
      return history.filter((h) => {
        const itemDate = new Date(h.timestamp);
        return itemDate >= start;
      });
    };

    const todayHistory = filterByPeriod('daily');
    const weekHistory = filterByPeriod('weekly');
    const monthHistory = filterByPeriod('monthly');

    // Helper to update goal
    const updateGoal = (id: string, progress: number, target: number) => {
      const goal = updated.find((g) => g.id === id);
      if (goal) {
        goal.progress = Math.min(progress, target);
        goal.completed = progress >= target;
      }
    };

    // Daily Goals
    updateGoal('daily-tracks', todayHistory.length, 10);
    updateGoal('daily-artists', new Set(todayHistory.map((h) => h.artist)).size, 5);
    updateGoal('daily-unique', new Set(todayHistory.map((h) => h.uri)).size, 8);

    const morningTracks = todayHistory.filter((h) => new Date(h.timestamp).getHours() < 12).length;
    updateGoal('daily-morning', morningTracks, 3);

    const eveningTracks = todayHistory.filter((h) => new Date(h.timestamp).getHours() >= 18).length;
    updateGoal('daily-evening', eveningTracks, 5);

    // Weekly Goals
    updateGoal('weekly-tracks', weekHistory.length, 50);
    updateGoal('weekly-artists', new Set(weekHistory.map((h) => h.artist)).size, 15);
    updateGoal('weekly-unique', new Set(weekHistory.map((h) => h.uri)).size, 30);

    // Weekly streak - count unique days
    const weekDays = new Set(weekHistory.map((h) => new Date(h.timestamp).toDateString())).size;
    updateGoal('weekly-streak', weekDays, 7);

    // Weekend tracks
    const weekendTracks = weekHistory.filter((h) => {
      const day = new Date(h.timestamp).getDay();
      return day === 0 || day === 6;
    }).length;
    updateGoal('weekly-weekend', weekendTracks, 20);

    // Favorite artist this week
    const weekArtistCounts: Record<string, number> = {};
    weekHistory.forEach((h) => {
      weekArtistCounts[h.artist] = (weekArtistCounts[h.artist] || 0) + 1;
    });
    const maxWeekArtist = Math.max(...Object.values(weekArtistCounts), 0);
    updateGoal('weekly-favorite', maxWeekArtist, 10);

    // Monthly Goals
    updateGoal('monthly-tracks', monthHistory.length, 200);
    updateGoal('monthly-artists', new Set(monthHistory.map((h) => h.artist)).size, 40);
    updateGoal('monthly-unique', new Set(monthHistory.map((h) => h.uri)).size, 100);
    updateGoal('monthly-hours', monthHistory.length, 200);

    // Monthly streak - count unique days
    const monthDays = new Set(monthHistory.map((h) => new Date(h.timestamp).toDateString())).size;
    updateGoal('monthly-streak', monthDays, 20);

    // New discoveries - artists not in previous month
    if (allHistory) {
      const lastMonthStart = new Date(now);
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
      lastMonthStart.setDate(1);
      lastMonthStart.setHours(0, 0, 0, 0);

      const thisMonthStart = getStartOfPeriod('monthly');

      const lastMonthHistory = allHistory.filter((h) => {
        const date = new Date(h.timestamp);
        return date >= lastMonthStart && date < thisMonthStart;
      });

      previousMonthArtists = new Set(lastMonthHistory.map((h) => h.artist));
      const currentMonthArtists = new Set(monthHistory.map((h) => h.artist));
      const newArtists = [...currentMonthArtists].filter((a) => !previousMonthArtists.has(a));
      updateGoal('monthly-discovery', newArtists.length, 20);
    }

    // Diverse time periods
    const monthPeriods = new Set<string>();
    monthHistory.forEach((h) => {
      const hour = new Date(h.timestamp).getHours();
      if (hour >= 5 && hour < 12) monthPeriods.add('morning');
      else if (hour >= 12 && hour < 18) monthPeriods.add('afternoon');
      else if (hour >= 18 && hour < 22) monthPeriods.add('evening');
      else monthPeriods.add('night');
    });
    updateGoal('monthly-variety', monthPeriods.size, 4);

    // Power listener day
    const monthDailyCounts: Record<string, number> = {};
    monthHistory.forEach((h) => {
      const date = new Date(h.timestamp).toDateString();
      monthDailyCounts[date] = (monthDailyCounts[date] || 0) + 1;
    });
    const maxDayTracks = Math.max(...Object.values(monthDailyCounts), 0);
    updateGoal('monthly-binge', maxDayTracks, 30);

    // Auto-reset goals if period has passed
    updated.forEach((goal) => {
      const lastReset = goal.resetDate ? new Date(goal.resetDate) : new Date(0);
      const periodStart = getStartOfPeriod(goal.type);

      if (lastReset < periodStart) {
        goal.progress = 0;
        goal.completed = false;
        goal.resetDate = periodStart.toISOString();
      }
    });

    return updated;
  });
}
