<script lang="ts">
  import { onMount } from 'svelte';

  // Targeting reticle: under a mouse, four corner ticks glide onto whatever link, button or field is pointed at.
  // Fine pointers only, off under reduced motion; purely decorative.
  const TARGETS = 'a, button, input, [data-lock]';
  const PAD = 5;

  let box = $state({ x: 0, y: 0, w: 0, h: 0 });
  let locked = $state(false);
  let enabled = $state(false);
  let current: Element | null = null;

  function place(el: Element) {
    const r = el.getBoundingClientRect();
    box = { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 };
  }

  onMount(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    enabled = true;

    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(TARGETS) ?? null;
      if (el === current) return;
      current = el;
      locked = !!el;
      if (el) place(el);
    };
    const onScroll = () => {
      if (current?.isConnected) place(current);
      else locked = false;
    };
    const onLeave = () => {
      current = null;
      locked = false;
    };

    document.addEventListener('pointerover', onOver);
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  });
</script>

{#if enabled}
  <div
    class="reticle"
    class:locked
    style="transform: translate({box.x}px, {box.y}px); width: {box.w}px; height: {box.h}px"
    aria-hidden="true"
  >
    <i></i><i></i><i></i><i></i>
  </div>
{/if}

<style>
  .reticle {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 60;
    pointer-events: none;
    opacity: 0;
    transition:
      transform 220ms var(--ease-out),
      width 220ms var(--ease-out),
      height 220ms var(--ease-out),
      opacity 200ms;
  }
  .reticle.locked {
    opacity: 1;
  }
  .reticle i {
    position: absolute;
    width: 9px;
    height: 9px;
    border: 0 solid var(--color-hud);
    filter: drop-shadow(0 0 4px rgb(56 204 245 / 0.7));
  }
  .reticle i:nth-child(1) { top: 0; left: 0; border-top-width: 2px; border-left-width: 2px; }
  .reticle i:nth-child(2) { top: 0; right: 0; border-top-width: 2px; border-right-width: 2px; }
  .reticle i:nth-child(3) { bottom: 0; left: 0; border-bottom-width: 2px; border-left-width: 2px; }
  .reticle i:nth-child(4) { bottom: 0; right: 0; border-bottom-width: 2px; border-right-width: 2px; }
</style>
