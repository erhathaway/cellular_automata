<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Cellular Automata</title>
</svelte:head>

<div class="h-screen w-screen overflow-hidden">
	{@render children()}
</div>
