<script lang="ts">
	const docPages = [
		{ title: 'What is a Cellular Automata?', slug: 'what-is-a-automata' },
		{ title: 'Dimensions', slug: 'dimension' },
		{ title: 'Neighbors', slug: 'neighbors' },
		{ title: 'Generations', slug: 'generations' },
		{ title: 'State', slug: 'state' },
		{ title: 'Viewer', slug: 'viewer' },
	];

	let activeDoc = $state('what-is-a-automata');
	let docContent = $state('');
	let sidebarOpen = $state(false);

	async function loadDoc(slug: string) {
		activeDoc = slug;
		sidebarOpen = false;
		try {
			const mod = await import(`../../docs/${slug}.md`);
			// mdsvex exports a default Svelte component, but we need the raw HTML
			// If mdsvex is configured, the .md files are importable as components
			docContent = '';
			// We'll render the component instead
		} catch {
			docContent = 'Documentation coming soon...';
		}
	}

	// Dynamic component for mdsvex
	let DocComponent: any = $state(null);

	async function loadDocComponent(slug: string) {
		activeDoc = slug;
		sidebarOpen = false;
		try {
			const mod = await import(`../../docs/${slug}.md`);
			DocComponent = mod.default;
		} catch {
			DocComponent = null;
		}
	}

	// Load initial doc
	$effect(() => {
		loadDocComponent(activeDoc);
	});
</script>

<div class="flex h-full bg-gray-950 text-white">
	<!-- Mobile sidebar toggle -->
	<button
		onclick={() => (sidebarOpen = !sidebarOpen)}
		class="fixed left-4 top-4 z-30 rounded bg-gray-800 px-3 py-2 text-sm md:hidden"
	>
		Menu
	</button>

	<!-- Sidebar -->
	<nav
		class="fixed left-0 top-0 z-20 h-full w-64 transform bg-gray-900 p-6 transition-transform duration-200 md:relative md:translate-x-0 {sidebarOpen
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<a href="/" class="mb-6 block text-sm text-gray-400 hover:text-white">&larr; Back to app</a>
		<h2 class="mb-4 text-lg font-semibold">Documentation</h2>
		<ul class="space-y-2">
			{#each docPages as page}
				<li>
					<button
						onclick={() => loadDocComponent(page.slug)}
						class="w-full rounded px-3 py-2 text-left text-sm transition {activeDoc ===
						page.slug
							? 'bg-white/10 text-white'
							: 'text-gray-400 hover:bg-white/5 hover:text-white'}"
					>
						{page.title}
					</button>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Content -->
	<main class="flex-1 overflow-y-auto p-8 pt-16 md:pt-8">
		<div class="prose prose-invert mx-auto max-w-3xl">
			{#if DocComponent}
				<DocComponent />
			{:else}
				<p class="text-gray-400">Documentation coming soon...</p>
			{/if}
		</div>
	</main>
</div>
