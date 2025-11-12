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

  const variants = {
    default: 'bg-[#1db954] text-white hover:bg-[#1db954]/90 shadow-md shadow-[#1db954]/20',
    ghost: 'hover:bg-white/10 hover:text-white',
    outline: 'border border-white/20 hover:bg-white/10',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8',
    icon: 'h-10 w-10',
  };
</script>

<button
  class={cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1db954] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
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
