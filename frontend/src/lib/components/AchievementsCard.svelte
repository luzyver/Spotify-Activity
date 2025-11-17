<script lang="ts">
  import { achievements } from '$lib/stores/achievements';
  import { Lock } from 'lucide-svelte';

  let selectedCategory: string = 'All';

  // Get unique categories
  $: categories = [
    'All',
    ...new Set(
      $achievements
        .map((a) => a.category)
        .filter((category): category is string => typeof category === 'string')
    ),
  ];

  // Filter achievements by category
  $: filteredAchievements =
    selectedCategory === 'All'
      ? $achievements
      : $achievements.filter((a) => a.category === selectedCategory);

  $: unlockedCount = filteredAchievements.filter((a) => a.unlocked).length;
  $: totalCount = filteredAchievements.length;
  $: completionPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  function getProgressPercentage(progress: number | undefined, target: number | undefined): number {
    if (!progress || !target) return 0;
    return Math.min((progress / target) * 100, 100);
  }
</script>

<div class="rounded-xl bg-[#181818] p-4 shadow-lg sm:p-6">
  <div class="mb-4 flex items-center justify-between">
    <h2 class="text-xl font-bold text-white sm:text-2xl">🏆 Achievements</h2>
    <div class="text-sm font-medium text-gray-400">
      {unlockedCount}/{totalCount} unlocked
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
          ? 'bg-[#1db954]'
          : 'bg-gradient-to-r from-[#1db954] to-[#1ed760]'}"
        style="width: {completionPercentage}%"
      ></div>
    </div>
  </div>

  <!-- Category Tabs -->
  <div
    class="scrollbar-thin scrollbar-thumb-[#404040] scrollbar-track-[#282828] mb-6 flex gap-2 overflow-x-auto pb-2"
  >
    {#each categories as category (category)}
      <button
        class="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all {selectedCategory ===
        category
          ? 'bg-[#1db954] text-white shadow-md'
          : 'bg-[#282828] text-gray-400 hover:bg-[#333333]'}"
        on:click={() => (selectedCategory = category)}
      >
        {category}
      </button>
    {/each}
  </div>

  <!-- Achievements Grid with Scrollbar -->
  <div
    class="scrollbar-thin scrollbar-thumb-[#404040] scrollbar-track-[#282828] max-h-[600px] overflow-y-auto pr-2"
  >
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each filteredAchievements as achievement (achievement.id)}
        <div
          class="group relative overflow-hidden rounded-lg border-2 p-4 transition-all {achievement.unlocked
            ? 'border-[#1db954] bg-[#1db954]/10 hover:bg-[#1db954]/20'
            : 'border-[#333333] bg-[#282828] opacity-60 hover:border-[#404040] hover:opacity-80'}"
        >
          {#if !achievement.unlocked}
            <div class="absolute right-3 top-3">
              <Lock class="h-4 w-4 text-gray-500" />
            </div>
          {/if}

          <div class="mb-2 flex items-start gap-3">
            <span class="text-3xl">{achievement.icon}</span>
            <div class="min-w-0 flex-1">
              <h3 class="text-sm font-bold text-white sm:text-base">
                {achievement.title}
                {#if achievement.unlocked}
                  <span class="ml-2 text-[#1db954]">✓</span>
                {/if}
              </h3>
              <p class="mt-1 text-xs text-gray-400">{achievement.description}</p>
            </div>
          </div>

          {#if achievement.progress !== undefined && achievement.target}
            <div class="mt-3">
              <div class="mb-2 flex justify-between text-xs">
                <span class="text-gray-400">Progress</span>
                <span class="font-medium text-white">
                  {achievement.progress}/{achievement.target}
                </span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-[#404040]">
                <div
                  class="h-full rounded-full transition-all duration-500 {achievement.unlocked
                    ? 'bg-[#1db954]'
                    : 'bg-gradient-to-r from-[#1db954] to-[#1ed760]'}"
                  style="width: {getProgressPercentage(achievement.progress, achievement.target)}%"
                ></div>
              </div>
            </div>
          {/if}

          {#if achievement.unlocked}
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1db954]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
            ></div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  {#if filteredAchievements.length === 0}
    <div class="py-8 text-center text-gray-400">
      <p>No achievements in this category</p>
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
