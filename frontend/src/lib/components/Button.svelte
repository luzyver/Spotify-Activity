<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    variant?: 'default' | 'ghost' | 'outline';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    class?: string;
    disabled?: boolean;
    onclick?: () => void;
    children?: import('svelte').Snippet;
  }

  let {
    variant = 'default',
    size = 'default',
    class: className,
    disabled = false,
    onclick,
    children,
  }: Props = $props();

  // Armor plates: primary carries the gold edge, the others light cyan on hover
  const variants = {
    default:
      '[--edge:var(--color-gold)] border border-gold/70 bg-surface text-fg shadow-[inset_0_-2px_0_rgb(242_179_61/0.7)] hover:border-gold hover:shadow-[inset_0_-2px_0_var(--color-gold)]',
    ghost: 'text-muted hover:text-hud-text',
    outline:
      '[--edge:var(--color-line-strong)] border border-line-strong text-fg hover:[--edge:var(--color-hud)] hover:border-hud/60 hover:shadow-[inset_0_-2px_0_var(--color-hud)]',
  };

  const sizes = {
    default: 'h-10 px-6 py-2',
    sm: 'h-8 px-4 text-sm',
    lg: 'h-12 px-8 text-base',
    icon: 'h-10 w-10',
  };
</script>

<button
  class={cn(
    'plate hud-text relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm [--cut:9px] transition-all duration-300 focus-visible:outline-offset-[-4px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    sizes[size],
    className
  )}
  {disabled}
  {onclick}
>
  {#if children}
    {@render children()}
  {/if}
</button>
