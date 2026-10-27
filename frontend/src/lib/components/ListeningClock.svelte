<script lang="ts">
  let { heatmap, max, peakHour }: { heatmap: number[][]; max: number; peakHour: number | null } = $props();

  const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const pad = (h: number) => String(h).padStart(2, '0');
</script>

<div class="tile col-span-2 flex flex-col p-4 sm:p-5">
  <div class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
    <span class="tile-label">Jam dengar · 4 minggu</span>
    {#if peakHour !== null}
      <span class="text-xs text-zinc-400">
        Paling sering <span class="text-accent font-semibold">{pad(peakHour)}.00–{pad((peakHour + 1) % 24)}.00</span>
      </span>
    {/if}
  </div>

  <div class="mt-4 grid grid-cols-[auto_1fr] gap-x-2 gap-y-[2px] sm:gap-y-[3px]">
    {#each heatmap as row, d}
      <span class="text-[10px] leading-none text-zinc-500 self-center">{DAYS[d]}</span>
      <div class="grid grid-cols-24 gap-[2px] sm:gap-[3px]">
        {#each row as count, h}
          <div
            class="pop-in aspect-square rounded-[2px] sm:rounded-[3px]"
            style="animation-delay: {300 + (h + d) * 18}ms; background-color: {count === 0
              ? 'rgb(255 255 255 / 0.04)'
              : `rgb(var(--accent) / ${0.18 + 0.82 * (count / Math.max(max, 1))})`};"
            title="{DAYS[d]} {pad(h)}.00 · {count} lagu"
          ></div>
        {/each}
      </div>
    {/each}
    <span></span>
    <div class="mt-1 flex justify-between text-[10px] text-zinc-500">
      <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
    </div>
  </div>
</div>
