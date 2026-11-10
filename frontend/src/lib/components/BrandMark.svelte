<script lang="ts">
  // The brand mark from luzyver.dev: an "L" cut as a gold armor plate on a red faceplate with a cyan eye slit.
  // Same paths as static/favicon.svg; keep the two in sync.
  let { class: className = 'h-8 w-8' }: { class?: string } = $props();
</script>

<svg class={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
  <path d="M5 1h22l4 4v11l-5.5 11L21 31H11l-4.5-4L1 16V5z" fill="#D7263D" stroke="#F2B33D" stroke-width="1.5" stroke-linejoin="round" />
  <path d="M10.5 6H15v13h10l-3.5 5H9V7.5z" fill="#F2B33D" />
  <path d="M18 9.5h7l-1.6 2.3H18z" fill="#38CCF5" />
</svg>
