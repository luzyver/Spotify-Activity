<script lang="ts">
  import { goals } from '$lib/stores/goals';
  import type { Goal } from '$lib/stores/goals';

  let selectedTab: 'daily' | 'weekly' | 'monthly' = 'daily';

  $: filteredGoals = $goals.filter((g) => g.type === selectedTab);
  $: completedCount = filteredGoals.filter((g) => g.completed).length;
  $: totalCount = filteredGoals.length;
  $: completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  function getProgressColor(progress: number, target: number): string {
    const percentage = (progress / target) * 100;
    if (percentage >= 100) return 'bg-[#1db954]';
    if (percentage >= 75) return 'bg-[#1ed760]';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-gray-500';
  }

  function getProgressPercentage(progress: number, target: number): number {
    return Math.min((progress / target) * 100, 100);
  }
</script>

<div class="rounded-xl bg-[#181818] p-4 shadow-lg sm:p-6">
  <div class="mb-4 flex items-center justify-between">
    <h2 class="text-xl font-bold text-white sm:text-2xl">🎯 Goals</h2>
    <div class="text-sm font-medium text-gray-400">
      {completedCount}/{totalCount} completed
    </div>
  </div>

  <!-- Overall Progress Bar -->
  <div class="mb-6">
    <div class="mb-2 flex items-center justify-between">
      <span class="text-sm font-medium text-gray-300">Overall Progress</span>
      <span class="text-sm font-bold text-white">{completionPercentage.toFixed(0)}%</span>
    </div>
    <div class="h-3 w-full rounded-full bg-[#282828]">
      <div
        class="h-3 rounded-full transition-all duration-500 {completionPercentage >= 100
          ? 'bg-green-500'
          : 'bg-gradient-to-r from-[#1db954] to-[#1ed760]'}"
        style="width: {completionPercentage}%"
      ></div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="mb-6 flex gap-2 overflow-x-auto">
    <button
      class="whitespace-nowrap rounded-lg px-4 py-2 font-medium transition-all {selectedTab ===
      'daily'
        ? 'bg-[#1db954] text-white shadow-md'
        : 'bg-[#282828] text-gray-400 hover:bg-[#333333]'}"
      on:click={() => (selectedTab = 'daily')}
    >
      📅 Daily
    </button>
    <button
      class="whitespace-nowrap rounded-lg px-4 py-2 font-medium transition-all {selectedTab ===
      'weekly'
        ? 'bg-[#1db954] text-white shadow-md'
        : 'bg-[#282828] text-gray-400 hover:bg-[#333333]'}"
      on:click={() => (selectedTab = 'weekly')}
    >
      📆 Weekly
    </button>
    <button
      class="whitespace-nowrap rounded-lg px-4 py-2 font-medium transition-all {selectedTab ===
      'monthly'
        ? 'bg-[#1db954] text-white shadow-md'
        : 'bg-[#282828] text-gray-400 hover:bg-[#333333]'}"
      on:click={() => (selectedTab = 'monthly')}
    >
      🗓️ Monthly
    </button>
  </div>

  <!-- Goals List -->
  <div
    class="scrollbar-thin scrollbar-thumb-[#404040] scrollbar-track-[#282828] max-h-[500px] space-y-3 overflow-y-auto pr-2"
  >
    {#each filteredGoals as goal (goal.id)}
      <div
        class="rounded-lg border-2 p-4 transition-all {goal.completed
          ? 'border-[#1db954] bg-[#1db954]/10'
          : 'border-[#333333] bg-[#282828] hover:border-[#404040]'}"
      >
        <div class="mb-2 flex items-start justify-between">
          <div class="flex flex-1 items-start gap-3">
            <span class="text-2xl">{goal.icon}</span>
            <div class="min-w-0 flex-1">
              <h3 class="text-sm font-semibold text-white sm:text-base">
                {goal.title}
                {#if goal.completed}
                  <span class="ml-2 text-[#1db954]">✓</span>
                {/if}
              </h3>
              <p class="mt-1 text-xs text-gray-400 sm:text-sm">{goal.description}</p>
            </div>
          </div>
          <div class="ml-2 text-right">
            <div class="text-sm font-bold text-white">
              {goal.progress}/{goal.target}
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-3 h-2 w-full rounded-full bg-[#404040]">
          <div
            class="h-2 rounded-full transition-all duration-500 {getProgressColor(
              goal.progress,
              goal.target
            )}"
            style="width: {getProgressPercentage(goal.progress, goal.target)}%"
          ></div>
        </div>
      </div>
    {/each}
  </div>

  {#if filteredGoals.length === 0}
    <div class="py-8 text-center text-gray-400">
      <p>No goals available for this period</p>
    </div>
  {/if}
</div>

<style>
  /* Custom scrollbar styles */
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: #282828;
    border-radius: 4px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #404040;
    border-radius: 4px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #505050;
  }
</style>
