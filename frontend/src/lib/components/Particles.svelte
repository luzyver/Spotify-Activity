<script lang="ts">
	import { onMount } from 'svelte';

	let container: HTMLDivElement;

	onMount(() => {
		const particleCount = 30;

		for (let i = 0; i < particleCount; i++) {
			const particle = document.createElement('div');
			particle.className = 'particle';
			particle.style.left = `${Math.random() * 100}%`;
			particle.style.animationDelay = `${Math.random() * 8}s`;
			particle.style.animationDuration = `${Math.random() * 4 + 6}s`;
			container.appendChild(particle);
		}
	});
</script>

<div bind:this={container} class="fixed inset-0 pointer-events-none z-0"></div>
