<script lang="ts">
  type Season = 'winter' | 'spring' | 'summer' | 'fall';

  interface Particle {
    id: number;
    left: number;
    delay: number;
    duration: number;
    size: number;
    opacity: number;
    rotation: number;
  }

  function getSeason(): Season {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  const season = getSeason();

  const config = {
    winter: { count: 50, emoji: '❄️', color: 'white', useEmoji: false },
    spring: { count: 30, emoji: '🌸', color: '#ffb7c5', useEmoji: true },
    summer: { count: 40, emoji: '✨', color: '#ffd700', useEmoji: false },
    fall: { count: 35, emoji: '🍂', color: '#d2691e', useEmoji: true },
  }[season];

  const particles: Particle[] = Array.from({ length: config.count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 5 + Math.random() * 10,
    size: config.useEmoji ? 12 + Math.random() * 12 : 2 + Math.random() * 4,
    opacity: 0.4 + Math.random() * 0.6,
    rotation: Math.random() * 360,
  }));
</script>

<div class="seasonal-effect {season}" aria-hidden="true">
  {#each particles as p (p.id)}
    <div
      class="particle"
      style="
        left: {p.left}%;
        animation-delay: {p.delay}s;
        animation-duration: {p.duration}s;
        font-size: {p.size}px;
        width: {config.useEmoji ? 'auto' : p.size + 'px'};
        height: {config.useEmoji ? 'auto' : p.size + 'px'};
        opacity: {p.opacity};
        --rotation: {p.rotation}deg;
      "
    >
      {#if config.useEmoji}
        {config.emoji}
      {/if}
    </div>
  {/each}
</div>

<style>
  .seasonal-effect {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 40;
    overflow: hidden;
  }

  .particle {
    position: absolute;
    top: -30px;
    animation: fall linear infinite;
  }

  .winter .particle {
    background: white;
    border-radius: 50%;
  }

  .spring .particle {
    line-height: 1;
  }

  .summer .particle {
    background: radial-gradient(circle, #ffd700 0%, transparent 70%);
    border-radius: 50%;
    box-shadow: 0 0 6px 2px rgba(255, 215, 0, 0.4);
    animation: float linear infinite;
  }

  .fall .particle {
    line-height: 1;
  }

  @keyframes fall {
    0% {
      transform: translateY(-30px) rotate(0deg);
    }
    100% {
      transform: translateY(100vh) rotate(var(--rotation, 360deg));
    }
  }

  @keyframes float {
    0% {
      transform: translateY(-30px) translateX(0) scale(1);
      opacity: 0;
    }
    10% {
      opacity: var(--opacity, 0.6);
    }
    50% {
      transform: translateY(50vh) translateX(20px) scale(1.2);
    }
    90% {
      opacity: var(--opacity, 0.6);
    }
    100% {
      transform: translateY(100vh) translateX(-10px) scale(0.8);
      opacity: 0;
    }
  }
</style>
