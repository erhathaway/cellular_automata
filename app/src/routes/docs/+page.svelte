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

<div class="docs-page">
	<!-- Mobile nav bar -->
	<div class="mobile-bar">
		<button onclick={() => sidebarOpen = !sidebarOpen} class="mobile-menu-btn" aria-label="Toggle menu">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>
	</div>

	<!-- Centered inner wrapper -->
	<div class="docs-inner">
		<!-- Nav container -->
		<div class="docs-nav {sidebarOpen ? '' : 'mobile-hidden'}">
			<!-- Exit / Home -->
			<div class="nav-top-actions">
				<a href="/" aria-label="Back to viewer" class="nav-action-btn">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</a>
			</div>

			<!-- Sidebar -->
			<nav class="docs-sidebar">
				{#each docPages as page}
					<button
						onclick={() => loadDocComponent(page.slug)}
						class="sidebar-link"
						class:active={activeDoc === page.slug}
					>
						{page.title}
					</button>
				{/each}
			</nav>
		</div>

		<!-- Doc content -->
		<div bind:this={contentEl} class="docs-content {sidebarOpen ? 'mobile-hidden' : ''}">
			<div class="doc" style="max-width: 500px; margin-top: 200px; margin-bottom: 100px;">
				{#if DocComponent}
					<DocComponent />
				{:else}
					<p class="empty-text">Documentation coming soon...</p>
				{/if}
			</div>

			<!-- Prev / Next -->
			<div class="doc-nav-row">
				{#if prevPage}
					<button class="doc-nav-btn" onclick={() => loadDocComponent(prevPage.slug)}>
						<span class="doc-nav-arrow">&larr;</span>
						<span class="doc-nav-label">{prevPage.title}</span>
					</button>
				{/if}
				{#if nextPage}
					<button class="doc-nav-btn" onclick={() => loadDocComponent(nextPage.slug)}>
						<span class="doc-nav-label">{nextPage.title}</span>
						<span class="doc-nav-arrow">&rarr;</span>
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.docs-page {
		display: flex;
		justify-content: center;
		height: 100%;
		width: 100%;
		background: #1c1917;
		background-image: repeating-linear-gradient(
			0deg, transparent, transparent 8px,
			rgba(68, 64, 60, 0.08) 8px, rgba(68, 64, 60, 0.08) 9px
		);
	}

	/* Mobile bar */
	.mobile-bar {
		display: none;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 40;
		width: 100%;
		height: 50px;
		align-items: center;
		padding: 0 20px;
		background: #292524;
		border-bottom: 1px solid #44403c;
	}

	@media (max-width: 767px) {
		.mobile-bar { display: flex; }
		.mobile-hidden { display: none !important; }
	}

	.mobile-menu-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 50px;
		height: 50px;
		border: none;
		background: none;
		color: #78716c;
		cursor: pointer;
	}

	.docs-inner {
		display: flex;
		height: 100%;
	}

	/* Nav */
	.docs-nav {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		shrink: 0;
		padding-top: 10vh;
	}

	@media (max-width: 767px) {
		.docs-nav {
			position: fixed;
			inset: 0;
			z-index: 40;
			padding-top: 0;
			background: #1c1917;
		}
	}

	.nav-top-actions {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 70px;
	}

	.nav-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 2px solid #44403c;
		background: transparent;
		color: #57534e;
		text-decoration: none;
		transition: border-color 0.2s ease, color 0.2s ease;
	}

	.nav-action-btn:hover {
		border-color: #facc15;
		color: #facc15;
	}

	.docs-sidebar {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		height: 70%;
		width: 250px;
		border-right: 1px solid #44403c;
		padding-right: 24px;
		gap: 4px;
	}

	.sidebar-link {
		font-family: 'Space Mono', monospace;
		font-size: 13px;
		font-weight: 400;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		text-align: right;
		color: #78716c;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		padding: 8px 0;
		margin: 4px 0;
		cursor: pointer;
		transition: color 0.2s ease, border-color 0.2s ease;
	}

	.sidebar-link:hover {
		color: #facc15;
	}

	.sidebar-link.active {
		color: #fefce8;
		border-bottom-color: #facc15;
		font-weight: 700;
	}

	/* Content */
	.docs-content {
		overflow-y: auto;
		width: 600px;
		padding-left: 100px;
	}

	@media (max-width: 767px) {
		.docs-content {
			width: 100%;
			padding: 0 20px;
		}
	}

	.empty-text {
		font-family: 'Space Mono', monospace;
		color: #78716c;
		letter-spacing: 0.06em;
	}

	/* Prev / Next */
	.doc-nav-row {
		display: flex;
		align-items: center;
		justify-content: center;
		max-width: 500px;
		height: 100px;
		margin-bottom: 50px;
	}

	.doc-nav-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0 12px;
		padding: 10px 18px;
		font-family: 'Space Mono', monospace;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #a8a29e;
		background: transparent;
		border: 2px solid #44403c;
		border-radius: 8px;
		cursor: pointer;
		transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
	}

	.doc-nav-btn:hover {
		border-color: #facc15;
		color: #facc15;
		background: rgba(250, 204, 21, 0.05);
	}

	.doc-nav-arrow {
		font-size: 20px;
		line-height: 1;
	}

	.doc-nav-label {
		line-height: 1;
	}

	/* ── Markdown content styles ── */
	:global(.doc) {
		color: #fefce8;
		font-family: 'Space Grotesk', sans-serif;
	}

	:global(.doc h1) {
		font-family: 'Space Mono', monospace;
		font-weight: 700;
		font-size: 1.5em;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #fefce8;
		margin-top: 10px;
		margin-bottom: 10px;
	}

	:global(.doc h2) {
		font-family: 'Space Mono', monospace;
		font-weight: 700;
		font-size: 0.85em;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #facc15;
		margin-top: 50px;
		padding-bottom: 16px;
		border-bottom: 1px solid #44403c;
	}

	:global(.doc p) {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 15px;
		line-height: 1.75;
		letter-spacing: 0.02em;
		color: #a8a29e;
		margin-top: 24px;
	}

	:global(.doc em) {
		color: #d6d3d1;
		font-style: italic;
	}

	:global(.doc table) {
		border-collapse: collapse;
		margin-top: 20px;
	}

	:global(.doc td) {
		border: 1px solid #44403c;
		height: 30px;
		width: 30px;
		text-align: center;
		font-family: 'Space Mono', monospace;
		font-size: 13px;
		color: #a8a29e;
	}

	:global(.doc pre > code) {
		font-family: 'Space Mono', monospace;
		color: #facc15;
		white-space: pre-wrap;
		font-size: 13px;
	}

	:global(.doc ul) {
		line-height: 1.8;
		letter-spacing: 0.02em;
		font-size: 14px;
		color: #a8a29e;
	}

	:global(.doc li > :first-child) {
		color: #a8a29e;
		letter-spacing: 0.02em;
		font-size: 14px;
	}

	:global(.doc > blockquote > blockquote em) {
		color: #facc15;
	}

	:global(.doc > blockquote > blockquote p) {
		color: #d6d3d1;
	}
</style>
