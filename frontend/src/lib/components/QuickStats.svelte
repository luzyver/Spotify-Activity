<script lang="ts">
  import type { HistoryItem } from '$lib/types';

  let { history }: { history: HistoryItem[] } = $props();

  const stats = $derived.by(() => {
    const now = new Date();

    // Start of today (00:00:00)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Start of this week (Monday 00:00:00)
    const dayOfWeek = now.getDay();
    const mondayDate = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), mondayDate);

    // Start of this month (1st day 00:00:00)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      today: history.filter((item) => new Date(item.timestamp) >= today).length,
      week: history.filter((item) => new Date(item.timestamp) >= startOfWeek).length,
      month: history.filter((item) => new Date(item.timestamp) >= startOfMonth).length,
      total: history.length,
    };
  });

  const quickStats = $derived([
    { label: 'Today', value: stats.today },
    { label: 'This Week', value: stats.week },
    { label: 'This Month', value: stats.month },
    { label: 'All Time', value: stats.total },
  ]);
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
  {#each quickStats as stat (stat.label)}
    <div
      class="rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
    >
      <div class="text-xs font-medium text-gray-500">{stat.label}</div>
      <div class="mt-1 text-2xl font-semibold">{stat.value}</div>
    </div>
  {/each}
</div>
