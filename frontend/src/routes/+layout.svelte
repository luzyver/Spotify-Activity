<script lang="ts">
  import '../app.css';
  import SeasonalEffect from '$lib/components/SeasonalEffect.svelte';

  let { children } = $props();
</script>

<SeasonalEffect />

<div class="relative min-h-screen bg-[#09090b] text-white selection:bg-[#1db954] selection:text-black">
  <div class="relative z-10">
    {@render children()}
  </div>
</div>
