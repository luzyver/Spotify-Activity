<script lang="ts">
  // Layered radial instrument: tick rings and arcs turning in opposite directions around a reactor
  // (coil ring, glowing core). An original drawing, decorative only.
  // `live` spins the coils up and lets the core breathe.
  let { live = false, core = true, class: className = '' }: { live?: boolean; core?: boolean; class?: string } = $props();
</script>

<svg class="hud-rings {className}" class:live viewBox="0 0 200 200" fill="none" aria-hidden="true" focusable="false">
  <circle class="spin-slow" cx="100" cy="100" r="96" stroke="#38ccf5" stroke-opacity="0.45" stroke-width="3" stroke-dasharray="1 5.03" />
  <g class="spin-rev">
    <circle cx="100" cy="100" r="86" stroke="#38ccf5" stroke-opacity="0.55" stroke-width="1.5" stroke-dasharray="90 40 30 60 140 50 60 70.35" />
    <circle cx="100" cy="100" r="86" stroke="#f2b33d" stroke-width="2.5" stroke-dasharray="34 506.35" stroke-dashoffset="-200" />
  </g>
  <g class="spin-mid">
    <circle cx="100" cy="100" r="74" stroke="#38ccf5" stroke-opacity="0.3" stroke-width="6" stroke-dasharray="70 394.96" />
    <circle cx="100" cy="100" r="74" stroke="#d7263d" stroke-opacity="0.9" stroke-width="2" stroke-dasharray="18 446.96" stroke-dashoffset="-120" />
    <circle cx="100" cy="100" r="74" stroke="#38ccf5" stroke-opacity="0.2" stroke-width="1" />
  </g>
  <path d="M100 2v14M100 184v14M2 100h14M184 100h14" stroke="#38ccf5" stroke-opacity="0.6" stroke-width="1.5" />

  {#if core}
    <defs>
      <radialGradient id="hud-core" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="45%" stop-color="#9be7fb" />
        <stop offset="100%" stop-color="#38ccf5" stop-opacity="0" />
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="60" stroke="#38ccf5" stroke-opacity="0.25" stroke-width="1" />
    <circle class="spin-coil" cx="100" cy="100" r="46" stroke="#38ccf5" stroke-opacity="0.75" stroke-width="9" stroke-dasharray="21.9 7" />
    <circle cx="100" cy="100" r="34" stroke="#f2b33d" stroke-opacity="0.8" stroke-width="1.5" />
    <circle class="core" cx="100" cy="100" r="30" fill="url(#hud-core)" />
  {/if}
</svg>

<style>
  .hud-rings :is(.spin-slow, .spin-rev, .spin-mid, .spin-coil, .core) {
    transform-box: view-box;
    transform-origin: 50% 50%;
  }
  .spin-slow { animation: hud-spin 90s linear infinite; }
  .spin-rev { animation: hud-spin 60s linear infinite reverse; }
  .spin-mid { animation: hud-spin 44s linear infinite; }
  .spin-coil { animation: hud-spin 40s linear infinite; }
  .core { opacity: 0.55; }

  .live .spin-coil { animation-duration: 8s; }
  .live .spin-mid { animation-duration: 20s; }
  .live .core { animation: hud-core 1.6s ease-in-out infinite; }

  @keyframes hud-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes hud-core {
    0%, 100% { opacity: 0.6; transform: scale(0.94); }
    50% { opacity: 1; transform: scale(1.06); }
  }

  @media (prefers-reduced-motion: reduce) {
    .hud-rings * { animation: none !important; }
  }
</style>
