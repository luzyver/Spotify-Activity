<script lang="ts">
  import '../app.css';

  let { children } = $props();
</script>

<div class="relative min-h-screen bg-[#050505] text-white selection:bg-[#1db954] selection:text-black">
  <!-- Subtle ambient background glow -->
  <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div class="absolute -top-[20%] -left-[10%] h-[50vh] w-[50vh] rounded-full bg-[#1db954]/10 blur-[120px]"></div>
    <div class="absolute top-[20%] -right-[10%] h-[60vh] w-[60vh] rounded-full bg-[#1ed760]/5 blur-[150px]"></div>
  </div>
  
  <div class="relative z-10">
    {@render children()}
  </div>
</div>
