<script lang="ts">
	const docPages = [
		{ title: 'Introduction', slug: 'what-is-a-automata' },
		{ title: 'Dimensions', slug: 'dimension' },
		{ title: 'Generations', slug: 'generations' },
		{ title: 'Viewer', slug: 'viewer' },
		{ title: 'Neighbors', slug: 'neighbors' },
		{ title: 'State', slug: 'state' },
	];

	let activeDoc = $state('what-is-a-automata');
	let sidebarOpen = $state(false);
	let DocComponent: any = $state(null);
	let contentEl: HTMLElement | undefined = $state(undefined);

	let activeIndex = $derived(docPages.findIndex((p) => p.slug === activeDoc));
	let prevPage = $derived(activeIndex > 0 ? docPages[activeIndex - 1] : null);
	let nextPage = $derived(activeIndex < docPages.length - 1 ? docPages[activeIndex + 1] : null);

	async function loadDocComponent(slug: string) {
		activeDoc = slug;
		sidebarOpen = false;
		try {
			const mod = await import(`../../docs/${slug}.md`);
			DocComponent = mod.default;
		} catch {
			DocComponent = null;
		}
		contentEl?.scrollTo(0, 0);
	}

	$effect(() => {
		loadDocComponent(activeDoc);
	});
</script>

<div class="fixed inset-0 flex items-start justify-center overflow-y-auto" style="background-color: rgba(0,0,0,0.95);">
	<!-- Mobile nav bar -->
	<div class="fixed left-0 top-0 z-40 flex h-[50px] w-full items-center bg-[#252525] px-5 md:hidden">
		<button
			onclick={() => sidebarOpen = !sidebarOpen}
			class="flex h-[50px] w-[50px] items-center justify-center border-none bg-[#8080801c] text-[#ffffff36]"
			aria-label="Toggle menu"
		>
			<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>
	</div>

	<!-- Nav container (sidebar + exit buttons) -->
	<div
		class="mt-[10vh] flex h-[80vh] flex-col items-center max-md:fixed max-md:inset-0 max-md:z-40 max-md:mt-0 max-md:h-full max-md:w-full max-md:justify-start max-md:bg-black {sidebarOpen ? '' : 'max-md:hidden'}"
	>
		<!-- Exit / Home buttons -->
		<div class="flex items-center justify-center" style="height: 70px;">
			<a
				href="/"
				aria-label="Back to viewer"
				class="mx-2.5 flex h-[50px] w-[50px] items-center justify-center rounded-full border-[3px] border-[rgba(56,56,56,0.9)] bg-transparent text-[rgba(56,56,56,0.9)] transition-colors hover:border-green-500 hover:text-green-500"
			>
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</a>
			<a
				href="/intro"
				aria-label="Home"
				class="mx-2.5 flex h-[50px] w-[50px] items-center justify-center rounded-full border-[3px] border-[rgba(56,56,56,0.9)] bg-transparent text-[rgba(56,56,56,0.9)] transition-colors hover:border-green-500 hover:text-green-500"
			>
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
					<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
				</svg>
			</a>
		</div>

		<!-- Sidebar -->
		<nav
			class="flex h-[70%] w-[250px] flex-col items-end justify-center"
			style="border-right: 1px solid rgba(56, 56, 56, 0.6); color: rgba(156, 156, 156, 1); letter-spacing: 8px;"
		>
			{#each docPages as page}
				<button
					onclick={() => loadDocComponent(page.slug)}
					class="cursor-pointer border-none bg-transparent px-2.5 py-2.5 text-right transition-colors"
					style="color: inherit; letter-spacing: 6px; margin: 10px; margin-right: 50px; padding-bottom: 10px;
						{activeDoc === page.slug
							? 'border-bottom: 1px solid white; margin-bottom: 15px; margin-top: 10px;'
							: ''}"
					class:hover-green={activeDoc !== page.slug}
				>
					{page.title}
				</button>
			{/each}
		</nav>
	</div>

	<!-- Doc content -->
	<div
		bind:this={contentEl}
		class="overflow-hidden max-md:px-5 {sidebarOpen ? 'max-md:hidden' : ''}"
		style="width: 500px; padding-left: 100px; margin-left: 10px;"
	>
		<!-- Markdown content -->
		<div class="doc" style="margin-top: 200px; margin-bottom: 100px;">
			{#if DocComponent}
				<DocComponent />
			{:else}
				<p style="color: rgba(156, 156, 156, 1);">Documentation coming soon...</p>
			{/if}
		</div>

		<!-- Prev / Next navigation -->
		<div class="mb-[50px] flex h-[100px] w-full items-center justify-center">
			{#if prevPage}
				<button
					onclick={() => loadDocComponent(prevPage.slug)}
					class="mx-5 flex cursor-pointer items-center border border-[rgba(56,56,56,0.6)] bg-transparent px-[15px] py-2.5 text-white transition-colors hover:border-green-500 hover:text-green-500"
				>
					<span class="mr-2 flex items-center text-[30px]">&larr;</span>
					<span style="letter-spacing: 3px;">{prevPage.title}</span>
				</button>
			{/if}
			{#if nextPage}
				<button
					onclick={() => loadDocComponent(nextPage.slug)}
					class="mx-5 flex cursor-pointer items-center border border-[rgba(56,56,56,0.6)] bg-transparent px-[15px] py-2.5 text-white transition-colors hover:border-green-500 hover:text-green-500"
				>
					<span style="letter-spacing: 3px;">{nextPage.title}</span>
					<span class="ml-2 flex items-center text-[30px]">&rarr;</span>
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	/* Markdown styles matching legacy */
	:global(.doc) {
		color: white;
		font-family: 'Roboto', sans-serif;
	}
	:global(.doc h1) {
		margin-top: 10px;
		margin-bottom: 10px;
		letter-spacing: 6px;
		font-size: 1.5em;
	}
	:global(.doc h2) {
		margin-top: 50px;
		text-transform: uppercase;
		letter-spacing: 5px;
		border-bottom: 1px solid rgba(55, 55, 55);
		padding-bottom: 20px;
		font-size: 0.83em;
	}
	:global(.doc p) {
		margin-top: 30px;
		line-height: 25px;
		letter-spacing: 3px;
		color: rgba(156, 156, 156, 1);
	}
	:global(.doc em) {
		color: rgba(200, 200, 200, 1);
	}
	:global(.doc table) {
		border-collapse: collapse;
	}
	:global(.doc td) {
		border: 1px solid rgba(56, 56, 56, 0.9);
		height: 30px;
		width: 30px;
		text-align: center;
	}
	:global(.doc pre > code) {
		color: #989868;
		white-space: pre-wrap;
	}
	:global(.doc ul) {
		line-height: 30px;
		letter-spacing: 2px;
		font-size: 14px;
	}
	:global(.doc li > :first-child) {
		color: #82827b;
		letter-spacing: 2px;
		font-size: 14px;
	}
	:global(.doc > blockquote > blockquote em) {
		color: #4f6079;
	}
	:global(.doc > blockquote > blockquote p) {
		color: #6f88ad;
	}

	.hover-green:hover {
		border-color: green;
		color: green;
	}
</style>
