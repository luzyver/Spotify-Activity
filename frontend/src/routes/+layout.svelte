<script lang="ts">
  import '../app.css';
  import HudRings from '$lib/components/HudRings.svelte';
  import Reticle from '$lib/components/Reticle.svelte';

  let { children } = $props();
</script>

<!-- Visor: honeycomb plating and slow instrument rings behind the page -->
<div class="hud-backdrop" aria-hidden="true">
  <HudRings core={false} class="visor-rings" />
</div>
<!-- Boot: one scan line sweeps the screen on load -->
<div class="boot-scan" aria-hidden="true"></div>
<Reticle />

<div class="relative min-h-screen text-fg">
  <div class="relative z-10">
    {@render children()}
  </div>
</div>
