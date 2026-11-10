const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>_+';

/**
 * HUD decode: the text resolves left to right out of random glyphs, on mount and whenever it changes.
 * It rewrites the text node Svelte keeps up to date, so the markup still carries the real text
 * for SSR and no-JS. Pair it with aria-label so screen readers never hear the noise.
 */
export function decode(node: HTMLElement, text: string) {
  let raf = 0;

  function run(target: string) {
    cancelAnimationFrame(raf);
    const textNode = [...node.childNodes].find((n): n is Text => n.nodeType === Node.TEXT_NODE && !!n.textContent?.trim());
    if (!textNode || !target || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const start = performance.now();
    const duration = Math.min(1100, 350 + target.length * 28);
    const step = (t: number) => {
      const progress = Math.min(1, (t - start) / duration);
      const shown = Math.floor(progress * target.length);
      let out = target.slice(0, shown);
      for (let i = shown; i < target.length; i++) {
        out += target[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      textNode.data = out;
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  run(text);
  return {
    update: run,
    destroy: () => cancelAnimationFrame(raf),
  };
}
