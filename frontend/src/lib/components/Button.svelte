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
    default:
      'bg-gradient-to-r from-[#1db954] to-[#1ed760] text-white shadow-lg shadow-[#1db954]/30 hover:shadow-xl hover:shadow-[#1db954]/50 active:scale-95',
    ghost: 'text-gray-400 hover:bg-white/5 hover:text-white active:scale-95',
    outline:
      'border border-white/10 text-white hover:bg-white/5 hover:border-white/20 active:scale-95',
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
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1db954] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
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
