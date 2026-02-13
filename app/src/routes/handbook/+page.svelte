<script lang="ts">
	const docPages = [
		{ title: 'Introduction', slug: 'what-is-a-automata' },
		{ title: 'Dimensions', slug: 'dimension' },
		{ title: 'Generations', slug: 'generations' },
		{ title: 'Viewer', slug: 'viewer' },
		{ title: 'Neighbors & Lattices', slug: 'neighbors' },
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
		<span class="mobile-title">Miner's Handbook</span>
	</div>

	<!-- Centered inner wrapper -->
	<div class="docs-inner">
		<!-- Nav container -->
		<div class="docs-nav {sidebarOpen ? '' : 'mobile-hidden'}">
			<!-- Sidebar panel -->
			<div class="sidebar-panel">
				<!-- Nails -->
				<div class="nails"><div class="nail"></div><div class="nail"></div></div>
				<div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

				<!-- Header -->
				<div class="sidebar-header">
					<svg class="sidebar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
						<path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
					</svg>
					<span class="sidebar-title">Miner's Handbook</span>
				</div>

				<div class="sidebar-divider"></div>

				<!-- Links -->
				<nav class="sidebar-links">
					{#each docPages as page, i}
						<button
							onclick={() => loadDocComponent(page.slug)}
							class="sidebar-link"
							class:active={activeDoc === page.slug}
						>
							{page.title}
						</button>
					{/each}
				</nav>

				<!-- Back to mine -->
				<div class="sidebar-divider"></div>
				<a href="/mine" class="sidebar-back">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
					</svg>
					Back to Mine
				</a>
			</div>
		</div>

		<!-- Doc content -->
		<div bind:this={contentEl} class="docs-content {sidebarOpen ? 'mobile-hidden' : ''}">
			<div class="doc-panel">
				<!-- Nails -->
				<div class="nails"><div class="nail"></div><div class="nail"></div></div>
				<div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

				<div class="doc">
					{#if DocComponent}
						<DocComponent />
					{:else}
						<p class="empty-text">Documentation coming soon...</p>
					{/if}
				</div>

				<!-- Prev / Next -->
				{#if prevPage || nextPage}
					<div class="doc-divider"></div>
					<div class="doc-nav-row">
						{#if prevPage}
							<button class="doc-nav-btn" onclick={() => loadDocComponent(prevPage.slug)}>
								<svg class="doc-nav-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
								</svg>
								<span class="doc-nav-label">{prevPage.title}</span>
							</button>
						{/if}
						<div class="doc-nav-spacer"></div>
						{#if nextPage}
							<button class="doc-nav-btn next" onclick={() => loadDocComponent(nextPage.slug)}>
								<span class="doc-nav-label">{nextPage.title}</span>
								<svg class="doc-nav-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
								</svg>
							</button>
						{/if}
					</div>
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
		background: #000;
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
		padding: 0 16px;
		gap: 12px;
		background-color: #1c1917;
		border-bottom: 2px solid #44403c;
	}

	@media (max-width: 767px) {
		.mobile-bar { display: flex; }
		.mobile-hidden { display: none !important; }
	}

	.mobile-menu-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: none;
		background: none;
		color: #78716c;
		cursor: pointer;
	}

	.mobile-title {
		font-family: 'Space Mono', monospace;
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #facc15;
	}

	.docs-inner {
		display: flex;
		height: 100%;
		width: 100%;
		max-width: 960px;
		padding: 24px;
		gap: 24px;
	}

	@media (max-width: 767px) {
		.docs-inner {
			padding: 60px 12px 12px;
			gap: 0;
		}
	}

	/* ── Nav ── */
	.docs-nav {
		display: flex;
		flex-direction: column;
		height: 100%;
		shrink: 0;
		padding-top: 20px;
	}

	@media (max-width: 767px) {
		.docs-nav {
			position: fixed;
			inset: 0;
			z-index: 40;
			padding: 60px 12px 12px;
			background: #000;
		}
	}

	/* ── Sidebar panel (mine-log style) ── */
	.sidebar-panel {
		position: relative;
		width: 220px;
		background-color: #1c1917;
		background-image:
			repeating-linear-gradient(
				0deg,
				transparent,
				transparent 10px,
				rgba(68, 64, 60, 0.1) 10px,
				rgba(68, 64, 60, 0.1) 11px
			);
		border: 2px solid #44403c;
		border-radius: 8px;
		padding: 20px 16px;
	}

	/* Nails — shared between sidebar and content panels */
	.nails {
		position: absolute;
		top: 8px;
		left: 12px;
		right: 12px;
		display: flex;
		justify-content: space-between;
		pointer-events: none;
	}

	.nails-bottom {
		top: auto;
		bottom: 8px;
	}

	.nail {
		width: 6px;
		height: 6px;
		background: #78716c;
		border-radius: 50%;
		box-shadow: inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3);
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.sidebar-icon {
		color: #facc15;
		filter: drop-shadow(0 0 4px rgba(250, 204, 21, 0.4));
	}

	.sidebar-title {
		font-family: 'Space Mono', monospace;
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #facc15;
	}

	.sidebar-divider {
		height: 1px;
		background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
		margin: 14px 0;
	}

	.sidebar-links {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.sidebar-link {
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		font-weight: 400;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		text-align: left;
		color: #a8a29e;
		background: none;
		border: none;
		padding: 8px 10px;
		border-radius: 4px;
		cursor: pointer;
		transition: color 0.15s, background 0.15s;
	}

	.sidebar-link:hover {
		color: #f5f5f4;
		background: rgba(255,255,255,0.05);
	}

	.sidebar-link.active {
		color: #facc15;
		background: rgba(250, 204, 21, 0.15);
		font-weight: 700;
	}

	.sidebar-back {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: 'Space Mono', monospace;
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #78716c;
		text-decoration: none;
		padding: 6px 10px;
		border-radius: 4px;
		transition: color 0.15s, background 0.15s;
	}

	.sidebar-back:hover {
		color: #f5f5f4;
		background: rgba(255,255,255,0.05);
	}

	/* ── Content panel ── */
	.docs-content {
		overflow-y: auto;
		flex: 1;
		min-width: 0;
		padding-top: 20px;
		scrollbar-width: thin;
		scrollbar-color: #44403c transparent;
	}

	.docs-content::-webkit-scrollbar {
		width: 6px;
	}

	.docs-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.docs-content::-webkit-scrollbar-thumb {
		background: #44403c;
		border-radius: 3px;
	}

	.docs-content::-webkit-scrollbar-thumb:hover {
		background: #57534e;
	}

	.doc-panel {
		position: relative;
		background-color: #1c1917;
		background-image:
			repeating-linear-gradient(
				0deg,
				transparent,
				transparent 10px,
				rgba(68, 64, 60, 0.1) 10px,
				rgba(68, 64, 60, 0.1) 11px
			);
		border: 2px solid #44403c;
		border-radius: 8px;
		padding: 40px 40px 32px;
	}

	@media (max-width: 767px) {
		.doc-panel {
			padding: 28px 20px 24px;
		}
	}

	.empty-text {
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		color: #a8a29e;
		letter-spacing: 0.06em;
	}

	/* ── Prev / Next ── */
	.doc-divider {
		height: 1px;
		background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
		margin: 32px 0 20px;
	}

	.doc-nav-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.doc-nav-spacer {
		flex: 1;
	}

	.doc-nav-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 14px;
		font-family: 'Space Mono', monospace;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #a8a29e;
		background: rgba(255,255,255,0.05);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: color 0.15s, background 0.15s;
	}

	.doc-nav-btn:hover {
		color: #facc15;
		background: rgba(250, 204, 21, 0.15);
	}

	.doc-nav-arrow {
		flex-shrink: 0;
	}

	.doc-nav-label {
		line-height: 1;
	}

	/* ── Markdown content styles ── */
	:global(.doc) {
		color: #d6d3d1;
		font-family: 'Space Grotesk', sans-serif;
	}

	:global(.doc h1) {
		font-family: 'Space Mono', monospace;
		font-weight: 700;
		font-size: 18px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #facc15;
		margin-top: 0;
		margin-bottom: 4px;
	}

	:global(.doc h2) {
		font-family: 'Space Mono', monospace;
		font-weight: 700;
		font-size: 13px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #facc15;
		margin-top: 48px;
		margin-bottom: 4px;
		padding-bottom: 12px;
		border-bottom: 1px solid #44403c;
	}

	:global(.doc h3) {
		font-family: 'Space Mono', monospace;
		font-weight: 700;
		font-size: 12px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #d6d3d1;
		margin-top: 32px;
	}

	:global(.doc p) {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 14px;
		font-weight: 400;
		line-height: 1.75;
		letter-spacing: 0.02em;
		color: #a8a29e;
		margin-top: 16px;
	}

	:global(.doc strong) {
		color: #e7e5e4;
		font-weight: 600;
	}

	:global(.doc em) {
		color: #d6d3d1;
		font-style: italic;
	}

	:global(.doc a) {
		color: #facc15;
		text-decoration: none;
		transition: color 0.15s;
	}

	:global(.doc a:hover) {
		color: #fde047;
	}

	/* Tables */
	:global(.doc table) {
		border-collapse: collapse;
		margin-top: 16px;
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

	:global(.doc th) {
		border: 1px solid #44403c;
		height: 30px;
		padding: 4px 12px;
		text-align: left;
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #78716c;
		background: rgba(255,255,255,0.04);
	}

	/* Code blocks */
	:global(.doc pre) {
		margin-top: 16px;
		padding: 12px 16px;
		background: #0c0a09;
		border: 1px solid #292524;
		border-radius: 6px;
		overflow-x: auto;
	}

	:global(.doc pre > code) {
		font-family: 'Space Mono', monospace;
		color: #facc15;
		white-space: pre-wrap;
		font-size: 12px;
		line-height: 1.6;
		background: none;
		padding: 0;
		border: none;
		border-radius: 0;
	}

	/* Inline code */
	:global(.doc code) {
		font-family: 'Space Mono', monospace;
		font-size: 12px;
		color: #facc15;
	}

	/* Lists */
	:global(.doc ul) {
		line-height: 1.75;
		letter-spacing: 0.02em;
		font-size: 14px;
		color: #a8a29e;
		padding-left: 20px;
		margin-top: 12px;
	}

	:global(.doc ol) {
		line-height: 1.75;
		letter-spacing: 0.02em;
		font-size: 14px;
		color: #a8a29e;
		padding-left: 20px;
		margin-top: 12px;
	}

	:global(.doc li) {
		margin-top: 4px;
	}

	:global(.doc li > :first-child) {
		color: #a8a29e;
		letter-spacing: 0.02em;
		font-size: 14px;
	}

	:global(.doc li::marker) {
		color: #57534e;
	}

	/* Blockquotes */
	:global(.doc blockquote) {
		margin-top: 16px;
		padding: 12px 16px;
		border-left: 3px solid #facc15;
		background: rgba(250, 204, 21, 0.04);
		border-radius: 0 4px 4px 0;
	}

	:global(.doc blockquote p) {
		margin-top: 0;
		color: #d6d3d1;
		font-size: 14px;
	}

	:global(.doc blockquote p + p) {
		margin-top: 10px;
	}

	:global(.doc blockquote em) {
		color: #facc15;
	}

	:global(.doc > blockquote > blockquote) {
		margin-top: 0;
		border-left-color: #78716c;
		background: rgba(120, 113, 108, 0.06);
	}

	/* Horizontal rule */
	:global(.doc hr) {
		border: none;
		height: 1px;
		background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
		margin: 40px 0;
	}

	/* Images */
	:global(.doc img) {
		border-radius: 6px;
		border: 1px solid #44403c;
		margin-top: 16px;
	}
</style>
