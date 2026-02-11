<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import NavSidebar from '$lib/components/NavSidebar.svelte';

	let { children } = $props();

	let leftOpen = $state(true);

	const LEFT_WIDTH = 72;

	function toggleLeft() {
		leftOpen = !leftOpen;
		animateResize();
	}

	function animateResize() {
		const start = performance.now();
		const duration = 320;
		function loop() {
			window.dispatchEvent(new Event('resize'));
			if (performance.now() - start < duration) {
				requestAnimationFrame(loop);
			}
		}
		requestAnimationFrame(loop);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Cellular Automata</title>
</svelte:head>

<div class="flex h-screen w-screen overflow-hidden">
	<!-- Left drawer -->
	<aside
		class="h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-out"
		style:width="{leftOpen ? LEFT_WIDTH : 0}px"
		style:background="linear-gradient(to right, rgb(0,0,0), rgba(0,0,0,0.92))"
	>
		<div class="h-full" style:width="{LEFT_WIDTH}px">
			<NavSidebar />
		</div>
	</aside>

	<!-- Main content -->
	<div class="relative h-full min-w-0 flex-1 overflow-hidden">
		{@render children()}

		<!-- Left toggle tab -->
		<button
			class="absolute left-0 top-4 z-30 flex h-12 w-6 cursor-pointer items-center justify-center border-none bg-black text-neutral-500 transition-colors hover:text-white"
			style="border-radius: 0 6px 6px 0;"
			onclick={toggleLeft}
			aria-label={leftOpen ? 'Close left panel' : 'Open left panel'}
		>
			<svg class="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
				{#if leftOpen}
					<path d="M7.5 2L4.5 6L7.5 10" />
				{:else}
					<path d="M4.5 2L7.5 6L4.5 10" />
				{/if}
			</svg>
		</button>
	</div>
</div>
