<script lang="ts">
	import { onMount } from 'svelte';

	// ── Cellular automata simulation for the hero ──
	const COLS = 80;
	const ROWS = 40;
	const CELL_SIZE = 8;

	let canvas: HTMLCanvasElement;
	let grid: Uint8Array;
	let nextGrid: Uint8Array;
	let animFrame: number;
	let mounted = false;

	function initGrid() {
		grid = new Uint8Array(COLS * ROWS);
		nextGrid = new Uint8Array(COLS * ROWS);
		for (let i = 0; i < grid.length; i++) {
			grid[i] = Math.random() < 0.35 ? 1 : 0;
		}
	}

	function step() {
		for (let y = 0; y < ROWS; y++) {
			for (let x = 0; x < COLS; x++) {
				let neighbors = 0;
				for (let dy = -1; dy <= 1; dy++) {
					for (let dx = -1; dx <= 1; dx++) {
						if (dx === 0 && dy === 0) continue;
						const nx = (x + dx + COLS) % COLS;
						const ny = (y + dy + ROWS) % ROWS;
						neighbors += grid[ny * COLS + nx];
					}
				}
				const idx = y * COLS + x;
				const alive = grid[idx];
				nextGrid[idx] = alive
					? (neighbors === 2 || neighbors === 3 ? 1 : 0)
					: (neighbors === 3 ? 1 : 0);
			}
		}
		[grid, nextGrid] = [nextGrid, grid];
	}

	function draw() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		for (let y = 0; y < ROWS; y++) {
			for (let x = 0; x < COLS; x++) {
				if (grid[y * COLS + x]) {
					ctx.fillStyle = `rgba(250, 204, 21, ${0.15 + Math.random() * 0.15})`;
					ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
				}
			}
		}
	}

	let lastStep = 0;
	function loop(t: number) {
		if (t - lastStep > 200) {
			step();
			draw();
			lastStep = t;
		}
		animFrame = requestAnimationFrame(loop);
	}

	onMount(() => {
		mounted = true;
		initGrid();
		draw();
		animFrame = requestAnimationFrame(loop);
		return () => {
			if (animFrame) cancelAnimationFrame(animFrame);
		};
	});

	// ── Mine shafts (feature blocks) ──
	const shafts = [
		{
			depth: 'Shaft I',
			title: 'The Surface Vein',
			dim: '1D',
			desc: 'Elementary rules carved into a single seam. 256 possible veins — each one unique, each one infinite.',
			color: '#22d660',
			colorDim: '#0a1f10',
			pattern: [0,1,0,0, 0,0,1,0, 1,1,1,0, 0,0,0,0],
		},
		{
			depth: 'Shaft II',
			title: 'The Deep Grid',
			dim: '2D',
			desc: 'Gliders, oscillators, still lifes. The richest deposits lie in two dimensions — where life itself emerges.',
			color: '#38bdf8',
			colorDim: '#0c1a2e',
			pattern: [0,0,0,0, 0,1,1,0, 0,1,1,0, 0,0,0,0],
		},
		{
			depth: 'Shaft III',
			title: 'The Abyss',
			dim: '3D',
			desc: 'Structures crystallize in three dimensions. Rare formations grow, evolve, and collapse in the deep.',
			color: '#c084fc',
			colorDim: '#1a0e2e',
			pattern: [0,1,0,0, 1,0,1,0, 0,1,0,0, 0,0,0,0],
		},
	];
</script>

<div class="landing">
	<!-- ── Hero ── -->
	<section class="hero">
		<canvas
			bind:this={canvas}
			width={COLS * CELL_SIZE}
			height={ROWS * CELL_SIZE}
			class="hero-canvas"
		></canvas>
		<div class="hero-overlay"></div>

		<div class="hero-content">
			<!-- Title panel -->
			<div class="title-panel">
				<div class="nails"><div class="nail"></div><div class="nail"></div></div>
				<div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

				<span class="pretitle">Welcome to the</span>
				<h1 class="title">Mines of Automata</h1>
				<div class="title-divider"></div>
				<p class="subtitle">
					Grab your pickaxe and strap on your backpack — there's no telling
					what's down here. Every strike uncovers a new pattern, but your
					pack only holds so much, so choose wisely. The rarest finds
					are worth keeping. Wouldn't be the first time these mines
					turned up something nobody's ever seen.
				</p>
			</div>

			<!-- Pipe connector -->
			<div class="hero-pipe">
				<div class="pipe-outer">
					<div class="pipe-inner"></div>
				</div>
				<div class="pipe-flange pipe-flange-top"></div>
				<div class="pipe-flange pipe-flange-bottom"></div>
			</div>

			<!-- CTA button -->
			<a href="/mine" class="cta-btn">
				<svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
					<path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
					<path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
					<path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
				</svg>
				<span class="cta-label">Enter the Mine</span>
			</a>
		</div>
	</section>

	<!-- ── Mine shafts ── -->
	<section class="features">
		<div class="features-header">
			<span class="section-label">Mine Shafts</span>
			<div class="section-line"></div>
		</div>

		<div class="features-grid">
			{#each shafts as shaft}
				<div class="feature-card">
					<div class="nails"><div class="nail"></div><div class="nail"></div></div>
					<div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

					<!-- Ore sample -->
					<div class="feature-pattern">
						{#each shaft.pattern as cell}
							<div
								class="pattern-cell"
								style="background: {cell ? shaft.color : shaft.colorDim}; {cell ? `box-shadow: 0 0 4px ${shaft.color}40;` : ''}"
							></div>
						{/each}
					</div>

					<div class="feature-body">
						<span class="feature-depth">{shaft.depth}</span>
						<span class="feature-dim" style="color: {shaft.color};">{shaft.dim}</span>
						<h3 class="feature-title">{shaft.title}</h3>
						<p class="feature-desc">{shaft.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── Bottom links ── -->
	<section class="bottom-links">
		<div class="bottom-divider"></div>
		<div class="bottom-row">
			<a href="/handbook" class="bottom-link">
				<svg class="bottom-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
					<path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
				</svg>
				<span>Miner's Handbook</span>
			</a>
			<a href="/gallery" class="bottom-link">
				<svg class="bottom-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="9" />
					<polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none" opacity="0.3" />
					<polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
				</svg>
				<span>View Discoveries</span>
			</a>
		</div>
	</section>

	<!-- Footer -->
	<div class="footer">
		Built by Ethan Hathaway
	</div>
</div>

<style>
	/* ── Layout ── */
	.landing {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		background: #000;
		overflow-y: auto;
		scrollbar-width: none;
	}

	.landing::-webkit-scrollbar {
		display: none;
	}

	/* ── Hero ── */
	.hero {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: min(85vh, 700px);
		overflow: hidden;
	}

	.hero-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		image-rendering: pixelated;
		opacity: 0.6;
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 80% 70% at 50% 45%, transparent 0%, #000000 70%),
			linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%);
	}

	.hero-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 24px;
	}

	/* ── Title panel ── */
	.title-panel {
		position: relative;
		padding: 36px 48px 32px;
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
		text-align: center;
		max-width: 520px;
		box-shadow:
			0 4px 24px rgba(0,0,0,0.5),
			0 0 40px rgba(250, 204, 21, 0.04);
	}

	.pretitle {
		font-family: 'Space Mono', monospace;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #78716c;
	}

	.title {
		font-family: 'Space Mono', monospace;
		font-size: 28px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #facc15;
		margin-top: 8px;
		filter: drop-shadow(0 0 12px rgba(250, 204, 21, 0.3));
	}

	.title-divider {
		height: 1px;
		background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
		margin: 18px 0;
	}

	.subtitle {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 14px;
		line-height: 1.75;
		letter-spacing: 0.02em;
		color: #a8a29e;
	}

	/* ── Nails ── */
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

	/* ── Pipe ── */
	.hero-pipe {
		position: relative;
		width: 14px;
		height: 48px;
	}

	.pipe-outer {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			#1c1917 0%,
			#292524 20%,
			#44403c 50%,
			#292524 80%,
			#1c1917 100%
		);
		border-radius: 3px;
		border: 1px solid #57534e;
		overflow: hidden;
	}

	.pipe-inner {
		position: absolute;
		left: 50%;
		top: 0;
		bottom: 0;
		width: 4px;
		transform: translateX(-50%);
		background: rgba(250, 204, 21, 0.15);
		box-shadow: 0 0 6px rgba(250, 204, 21, 0.3);
		animation: pipe-glow 1.2s ease-in-out infinite;
	}

	@keyframes pipe-glow {
		0%   { background: rgba(250, 204, 21, 0.15); }
		50%  { background: rgba(250, 204, 21, 0.5); }
		100% { background: rgba(250, 204, 21, 0.15); }
	}

	.pipe-flange {
		position: absolute;
		left: -3px;
		right: -3px;
		height: 6px;
		background: linear-gradient(
			180deg,
			#57534e 0%,
			#78716c 40%,
			#57534e 100%
		);
		border-radius: 2px;
		border: 1px solid #44403c;
	}

	.pipe-flange-top { top: -2px; }
	.pipe-flange-bottom { bottom: -2px; }

	/* ── CTA Button ── */
	.cta-btn {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		gap: 14px;
		cursor: pointer;
		padding: 18px 40px;
		background: linear-gradient(180deg, #44403c 0%, #292524 40%, #1c1917 100%);
		border: 1.5px solid #57534e;
		border-top-color: #78716c;
		border-bottom-color: #44403c;
		border-radius: 6px;
		color: #facc15;
		text-decoration: none;
		transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.1s;
		box-shadow:
			0 4px 0 #0c0a09,
			0 6px 12px rgba(0,0,0,0.5),
			inset 0 1px 0 rgba(255,255,255,0.1);
	}

	.cta-btn:hover {
		border-color: #facc15;
		border-top-color: #fde047;
		background: linear-gradient(180deg, #57534e 0%, #44403c 40%, #292524 100%);
		box-shadow:
			0 4px 0 #0c0a09,
			0 6px 12px rgba(0,0,0,0.5),
			0 0 20px rgba(250, 204, 21, 0.15),
			inset 0 1px 0 rgba(255,255,255,0.12);
	}

	.cta-btn:active {
		transform: translateY(3px);
		border-color: #facc15;
		box-shadow:
			0 1px 0 #57534e,
			0 0 12px rgba(250, 204, 21, 0.2),
			inset 0 2px 4px rgba(0,0,0,0.3);
	}

	.cta-icon {
		width: 28px;
		height: 28px;
		flex-shrink: 0;
		filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.5));
	}

	.cta-label {
		font-family: 'Space Mono', monospace;
		font-size: 18px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		white-space: nowrap;
	}

	/* ── Features ── */
	.features {
		width: 100%;
		max-width: 860px;
		padding: 0 24px 48px;
	}

	.features-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 24px;
	}

	.section-label {
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #78716c;
		white-space: nowrap;
	}

	.section-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, #44403c, transparent);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}

	@media (max-width: 700px) {
		.features-grid {
			grid-template-columns: 1fr;
			max-width: 360px;
			margin: 0 auto;
		}
	}

	.feature-card {
		position: relative;
		padding: 24px 20px;
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
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.feature-card:hover {
		border-color: #57534e;
		box-shadow: 0 0 20px rgba(0,0,0,0.3);
	}

	/* ── Mini CA pattern ── */
	.feature-pattern {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(4, 1fr);
		width: 48px;
		height: 48px;
		gap: 1px;
		margin-bottom: 16px;
		image-rendering: pixelated;
	}

	.pattern-cell {
		border-radius: 1px;
	}

	.feature-body {
		display: flex;
		flex-direction: column;
	}

	.feature-depth {
		font-family: 'Space Mono', monospace;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #57534e;
	}

	.feature-dim {
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin-top: 2px;
	}

	.feature-title {
		font-family: 'Space Mono', monospace;
		font-size: 15px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #facc15;
		margin-top: 4px;
	}

	.feature-desc {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 13px;
		line-height: 1.65;
		letter-spacing: 0.02em;
		color: #a8a29e;
		margin-top: 8px;
	}

	/* ── Bottom links ── */
	.bottom-links {
		width: 100%;
		max-width: 860px;
		padding: 0 24px 48px;
	}

	.bottom-divider {
		height: 1px;
		background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
		margin-bottom: 24px;
	}

	.bottom-row {
		display: flex;
		justify-content: center;
		gap: 32px;
	}

	.bottom-link {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #78716c;
		text-decoration: none;
		padding: 10px 18px;
		border-radius: 6px;
		border: 1px solid transparent;
		transition: color 0.15s, background 0.15s, border-color 0.15s;
	}

	.bottom-link:hover {
		color: #facc15;
		background: rgba(250, 204, 21, 0.06);
		border-color: #44403c;
	}

	.bottom-link-icon {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	/* ── Footer ── */
	.footer {
		padding: 24px;
		font-family: 'Space Mono', monospace;
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #44403c;
	}
</style>
