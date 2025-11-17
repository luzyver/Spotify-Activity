<script lang="ts">
  import type { HistoryItem } from '$lib/types';
  import { TrendingUp, TrendingDown } from 'lucide-svelte';

  let { history }: { history: HistoryItem[] } = $props();

  const comparison = $derived.by(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const thisMonth = history.filter((item) => item.timestamp >= thisMonthStart.getTime());
    const lastMonth = history.filter(
      (item) =>
        item.timestamp >= lastMonthStart.getTime() && item.timestamp <= lastMonthEnd.getTime()
    );

    const thisMonthPlays = thisMonth.length;
    const lastMonthPlays = lastMonth.length;
    const thisMonthTracks = new Set(thisMonth.map((i) => i.uri)).size;
    const lastMonthTracks = new Set(lastMonth.map((i) => i.uri)).size;

    const playsChange =
      lastMonthPlays > 0
        ? Math.round(((thisMonthPlays - lastMonthPlays) / lastMonthPlays) * 100)
        : 0;
    const tracksChange =
      lastMonthTracks > 0
        ? Math.round(((thisMonthTracks - lastMonthTracks) / lastMonthTracks) * 100)
        : 0;

    return {
      thisMonth: {
        name: now.toLocaleDateString('en-US', { month: 'long' }),
        plays: thisMonthPlays,
        tracks: thisMonthTracks,
      },
      lastMonth: {
        name: lastMonthStart.toLocaleDateString('en-US', { month: 'long' }),
        plays: lastMonthPlays,
        tracks: lastMonthTracks,
      },
      changes: {
        plays: playsChange,
        tracks: tracksChange,
      },
    };
  });

  function getChangeColor(change: number): string {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  }

  function getChangeBg(change: number): string {
    if (change > 0) return 'from-green-500/20';
    if (change < 0) return 'from-red-500/20';
    return 'from-gray-500/20';
  }
</script>

<div class="space-y-4">
  <h3 class="text-lg font-semibold sm:text-xl">Month Comparison</h3>

  <div class="grid gap-3 md:grid-cols-2">
    <!-- Total Plays Comparison -->
    <div class="rounded-lg border border-white/5 bg-white/[0.02] p-4">
      <div class="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Total Plays</div>

      <div class="mb-3 flex items-end justify-between">
        <div>
          <div class="text-xs text-gray-600">{comparison.lastMonth.name}</div>
          <div class="text-xl font-semibold text-gray-400">{comparison.lastMonth.plays}</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-600">{comparison.thisMonth.name}</div>
          <div class="text-2xl font-semibold">{comparison.thisMonth.plays}</div>
        </div>
      </div>

      <div
        class="flex items-center justify-between rounded border border-white/5 bg-white/[0.02] px-3 py-2"
      >
        <span class="text-xs text-gray-500">Change</span>
        <div class="flex items-center gap-1.5">
          {#if comparison.changes.plays > 0}
            <TrendingUp class="h-3.5 w-3.5 {getChangeColor(comparison.changes.plays)}" />
          {:else if comparison.changes.plays < 0}
            <TrendingDown class="h-3.5 w-3.5 {getChangeColor(comparison.changes.plays)}" />
          {/if}
          <span class="text-sm font-semibold {getChangeColor(comparison.changes.plays)}">
            {comparison.changes.plays > 0 ? '+' : ''}{comparison.changes.plays}%
          </span>
        </div>
      </div>
    </div>

    <!-- Unique Tracks Comparison -->
    <div class="rounded-lg border border-white/5 bg-white/[0.02] p-4">
      <div class="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
        Unique Tracks
      </div>

      <div class="mb-3 flex items-end justify-between">
        <div>
          <div class="text-xs text-gray-600">{comparison.lastMonth.name}</div>
          <div class="text-xl font-semibold text-gray-400">{comparison.lastMonth.tracks}</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-600">{comparison.thisMonth.name}</div>
          <div class="text-2xl font-semibold">{comparison.thisMonth.tracks}</div>
        </div>
      </div>

      <div
        class="flex items-center justify-between rounded border border-white/5 bg-white/[0.02] px-3 py-2"
      >
        <span class="text-xs text-gray-500">Change</span>
        <div class="flex items-center gap-1.5">
          {#if comparison.changes.tracks > 0}
            <TrendingUp class="h-3.5 w-3.5 {getChangeColor(comparison.changes.tracks)}" />
          {:else if comparison.changes.tracks < 0}
            <TrendingDown class="h-3.5 w-3.5 {getChangeColor(comparison.changes.tracks)}" />
          {/if}
          <span class="text-sm font-semibold {getChangeColor(comparison.changes.tracks)}">
            {comparison.changes.tracks > 0 ? '+' : ''}{comparison.changes.tracks}%
          </span>
        </div>
      </div>
    </div>
  </div>
</div>
